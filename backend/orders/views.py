"""
orders/views.py
"""

from decimal import Decimal, InvalidOperation
from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction, IntegrityError
from django.db.models import Q
from django.utils import timezone
from accounts.models import SellerProfile
from accounts.permissions import is_approved_seller, is_verified_buyer, is_admin_user
from nyakizu.pagination import LargeResultsSetPagination
from .models import Order, OrderItem, PaymentClaim, PaymentRecord, CartDraft
from .notifications import record_status_event, send_payment_claim_seller_email, send_payment_reminder_email
from .serializers import OrderSerializer, OrderCreateSerializer


def _orders_for_serialization(queryset):
    """
    Attach the select_related/prefetch_related every OrderSerializer listing
    needs — without it, each order re-queries buyer, items, each item's
    product, status_events, and payment_claims individually (N+1 across the
    whole page).
    """
    return queryset.select_related("buyer", "seller").prefetch_related(
        "items__product", "status_events", "payment_claims",
    )


class OrderListCreateView(APIView):
    """
    GET  /api/orders/  — buyer's own orders
    POST /api/orders/  — place a new order
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not is_verified_buyer(request.user):
            return Response(
                {"error": "Only verified buyers can view buyer orders."},
                status=status.HTTP_403_FORBIDDEN,
            )

        orders = _orders_for_serialization(
            Order.objects.filter(buyer=request.user).order_by("-created_at")
        )
        paginator = LargeResultsSetPagination()
        page = paginator.paginate_queryset(orders, request, view=self)
        serializer = OrderSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        if not is_verified_buyer(request.user):
            return Response(
                {"error": "Only verified buyers can place orders."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = OrderCreateSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            order  = serializer.save()
            output = OrderSerializer(order)
            return Response(output.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SellerOrderListView(APIView):
    """
    GET /api/orders/seller/
    Returns all orders where the logged-in seller is the seller.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not is_approved_seller(request.user):
            return Response(
                {"error": "Only approved sellers can view seller orders."},
                status=status.HTTP_403_FORBIDDEN,
            )

        orders = _orders_for_serialization(
            Order.objects.filter(seller=request.user).distinct().order_by("-created_at")
        )
        paginator = LargeResultsSetPagination()
        page = paginator.paginate_queryset(orders, request, view=self)
        serializer = OrderSerializer(page, many=True, context={"request": request})
        return paginator.get_paginated_response(serializer.data)


class OrderDetailView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/orders/<id>/ — buyer or seller can view/update the order."""
    serializer_class   = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        allowed_orders = Q(pk__in=[])
        if is_verified_buyer(user):
            allowed_orders |= Q(buyer=user)
        if is_approved_seller(user):
            allowed_orders |= Q(seller=user)
        if is_admin_user(user):
            allowed_orders |= Q()

        return _orders_for_serialization(Order.objects.filter(allowed_orders).distinct())

    def perform_update(self, serializer):
        order = serializer.instance
        user = self.request.user
        old_status = order.status
        new_status = serializer.validated_data.get("status", old_status)

        if new_status == "cancelled" and old_status != "cancelled":
            # Cancelling has side effects (releasing stock back to inventory)
            # that only CancelOrderView performs — going through this generic
            # PATCH used to silently skip that and leak sold-out stock.
            raise ValidationError(
                {"status": "Use the cancel endpoint (/orders/<id>/cancel/) to cancel an order."}
            )

        if new_status in ("debt_active", "cleared") and new_status != old_status:
            # These two only ever mean "a payment was actually recorded" —
            # RecordPaymentView derives them from amount_paid vs. the total,
            # inside a locked transaction. Letting either party PATCH the
            # label directly would let an order claim to be paid (or
            # partially paid) with no payment behind it.
            raise ValidationError(
                {"status": "This status is set automatically when a payment is recorded — "
                           "use /orders/<id>/record-payment/ instead."}
            )

        if "final_total" in serializer.validated_data and order.seller != user and not is_admin_user(user):
            # The seller locks the price after reviewing/sourcing an order;
            # a buyer changing it on their own order would let them quietly
            # undercut what they actually owe.
            raise ValidationError(
                {"final_total": "Only the seller can adjust the order total."}
            )

        # A payment date only makes sense once there's an actual debt to
        # promise against — an order with nothing owed yet ("submitted",
        # "locked") or already settled ("cleared") has no debt to attach one to.
        if "expected_payment_date" in serializer.validated_data and old_status != "debt_active":
            raise ValidationError(
                {"expected_payment_date": "This order isn't in debt right now — there's nothing to set a payment date for."}
            )

        order = serializer.save()
        if order.status != old_status:
            record_status_event(order, order.status)

        if "expected_payment_date" in serializer.validated_data:
            # A fresh date means any past-due reminder cadence starts over —
            # don't let the next cron run treat this as still needing the
            # "overdue" nudge it would have gotten under the old date.
            order.last_debt_reminder_at = None
            order.save(update_fields=["last_debt_reminder_at"])


class ToggleItemPackedView(APIView):
    """
    POST /api/orders/<order_id>/items/<item_id>/toggle-packed/
    Seller-only. Flips is_packed on one line item — the packing checklist
    on the fulfill screen. Returns the whole order so the frontend can just
    replace its state in one shot.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_id, item_id):
        if not is_approved_seller(request.user):
            return Response(
                {"error": "Only approved sellers can update packing status."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            item = OrderItem.objects.select_related("order").get(
                pk=item_id, order_id=order_id, order__seller=request.user
            )
        except OrderItem.DoesNotExist:
            return Response({"error": "Order item not found."}, status=status.HTTP_404_NOT_FOUND)

        item.is_packed = not item.is_packed
        item.save(update_fields=["is_packed"])

        order = _orders_for_serialization(Order.objects.filter(pk=order_id)).get()
        return Response(OrderSerializer(order).data)


class ToggleItemNotFoundView(APIView):
    """
    POST /api/orders/<order_id>/items/<item_id>/toggle-not-found/
    Seller-only. Flips not_found on a line item — for a sourcing request
    the seller tried to get and simply couldn't that day. Un-packs it too,
    since a not-found item can't also be a packed one.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_id, item_id):
        if not is_approved_seller(request.user):
            return Response(
                {"error": "Only approved sellers can update this."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            item = OrderItem.objects.select_related("order").get(
                pk=item_id, order_id=order_id, order__seller=request.user
            )
        except OrderItem.DoesNotExist:
            return Response({"error": "Order item not found."}, status=status.HTTP_404_NOT_FOUND)

        item.not_found = not item.not_found
        update_fields = ["not_found"]
        if item.not_found and item.is_packed:
            item.is_packed = False
            update_fields.append("is_packed")
        item.save(update_fields=update_fields)

        order = _orders_for_serialization(Order.objects.filter(pk=order_id)).get()
        return Response(OrderSerializer(order).data)


class SetItemPriceView(APIView):
    """
    POST /api/orders/<order_id>/items/<item_id>/set-price/
    Body: { unit_price }

    Seller-only. Prices a sourcing line that came in with none — a custom
    request the buyer asked for, now sourced and given a real cost. Order
    total recalculates immediately so the "priced items" figure the seller
    and buyer both see stays accurate as each line gets priced, ahead of
    the seller actually locking the order.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_id, item_id):
        if not is_approved_seller(request.user):
            return Response(
                {"error": "Only approved sellers can set item prices."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            item = OrderItem.objects.select_related("order").get(
                pk=item_id, order_id=order_id, order__seller=request.user
            )
        except OrderItem.DoesNotExist:
            return Response({"error": "Order item not found."}, status=status.HTTP_404_NOT_FOUND)

        if item.order.status in ("locked", "debt_active", "cleared", "cancelled"):
            return Response(
                {"error": "This order's price is already locked."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            price = Decimal(str(request.data.get("unit_price")))
        except (InvalidOperation, TypeError):
            return Response({"error": "Enter a valid price."}, status=status.HTTP_400_BAD_REQUEST)
        if price < 0:
            return Response({"error": "Price can't be negative."}, status=status.HTTP_400_BAD_REQUEST)

        item.unit_price = price
        item.save(update_fields=["unit_price"])
        item.order.calculate_total()

        order = _orders_for_serialization(Order.objects.filter(pk=order_id)).get()
        return Response(OrderSerializer(order).data)


class CancelOrderView(APIView):
    """
    POST /api/orders/<id>/cancel/ — the buyer or the fulfilling seller
    cancels an order that hasn't been locked yet.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        user = request.user
        is_buyer = is_verified_buyer(user)
        is_seller = is_approved_seller(user)
        if not is_buyer and not is_seller:
            return Response(
                {"error": "Only the buyer or seller on this order can cancel it."},
                status=status.HTTP_403_FORBIDDEN,
            )

        owned_orders = Q(pk=pk) & (Q(buyer=user) | Q(seller=user))
        try:
            order = Order.objects.get(owned_orders)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        if order.status not in ("submitted", "sourcing"):
            return Response(
                {"error": f"Cannot cancel an order with status '{order.status}'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            order = Order.objects.select_for_update().get(pk=order.pk)
            if order.status not in ("submitted", "sourcing"):
                return Response(
                    {"error": f"Cannot cancel an order with status '{order.status}'."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Release stock back — only for items actually taken out of
            # inventory. Sourcing items never decremented stock at creation
            # (see OrderCreateSerializer.create), so crediting them back here
            # would inflate stock_quantity beyond what's really on the shelf.
            for item in OrderItem.objects.select_related("product").filter(order=order, is_sourcing=False):
                if item.product_id:
                    product = item.product
                    product.stock_quantity += item.quantity
                    if product.stock_quantity > 0 and product.status == "out_of_stock":
                        product.status = "available"
                    product.save(update_fields=["stock_quantity", "status", "updated_at"])

            order.status = "cancelled"
            order.save(update_fields=["status", "updated_at"])

        record_status_event(order, order.status)
        return Response({"message": "Order cancelled."})


# ── Ledger views ──────────────────────────────────────────────────────────────

class SellerLedgerView(APIView):
    """
    GET /api/orders/ledger/seller/
    Returns seller's ledger: orders with locked, debt_active, or cleared status.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not is_approved_seller(request.user):
            return Response(
                {"error": "Only approved sellers can view ledger."},
                status=status.HTTP_403_FORBIDDEN,
            )

        orders = _orders_for_serialization(
            Order.objects.filter(
                seller=request.user,
                status__in=["locked", "debt_active", "cleared"],
            ).order_by("-created_at")
        )

        paginator = LargeResultsSetPagination()
        page = paginator.paginate_queryset(orders, request, view=self)
        serializer = OrderSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class BuyerDebtsView(APIView):
    """
    GET /api/orders/debts/
    Returns buyer's outstanding debts (locked or debt_active orders with balance > 0).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not is_verified_buyer(request.user):
            return Response(
                {"error": "Only verified buyers can view debts."},
                status=status.HTTP_403_FORBIDDEN,
            )

        orders = _orders_for_serialization(
            Order.objects.filter(
                buyer=request.user,
                status__in=["locked", "debt_active"],
            ).order_by("-created_at")
        )

        paginator = LargeResultsSetPagination()
        page = paginator.paginate_queryset(orders, request, view=self)
        serializer = OrderSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class RecordPaymentView(APIView):
    """
    POST /api/orders/<id>/pay/
    Records a real, confirmed payment against an order — seller (or admin)
    only. This is the source of truth for amount_paid, so a buyer can't
    call it to mark their own order paid; a buyer's side of this is
    SubmitPaymentClaimView below, which only tells the seller what to go
    verify, not the order's actual payment state.
    Body: { amount, payment_reference, payment_method, claim_id? }
    claim_id, when given, marks that PaymentClaim resolved — the seller
    checked their M-Pesa against it and this payment is the confirmation.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        user = request.user
        # Ownership lives in the queryset, same as every other order view in
        # this file — a non-owner gets a 404 rather than a 403 that confirms
        # the order exists (order IDs are plain sequential integers).
        orders = Order.objects.all() if is_admin_user(user) else Order.objects.filter(seller=user)
        try:
            order = orders.get(pk=pk)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        if order.status not in ("locked", "debt_active"):
            return Response(
                {"error": f"Cannot record payment for order with status '{order.status}'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        amount = request.data.get("amount")
        if amount is None:
            return Response({"error": "amount is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Go through str() first — Decimal(float) reproduces the float's
            # binary rounding error (e.g. Decimal(1500.10) != Decimal("1500.10")),
            # and amount_paid must stay exact for a money ledger.
            amount = Decimal(str(amount))
        except InvalidOperation:
            return Response({"error": "amount must be a number."}, status=status.HTTP_400_BAD_REQUEST)

        if amount <= 0:
            return Response({"error": "amount must be greater than 0."}, status=status.HTTP_400_BAD_REQUEST)

        reference = (request.data.get("payment_reference") or "").strip()
        method = request.data.get("payment_method", "")

        with transaction.atomic():
            # Locks the order row first, so two near-simultaneous requests
            # (a network retry racing the original) serialize against each
            # other here rather than both passing the duplicate check below.
            order = Order.objects.select_for_update().get(pk=order.pk)

            # A repeat of a reference already recorded on this order is a
            # retry/double-click, not a second real payment — the intent
            # ("make sure this payment is recorded") is already satisfied,
            # so return the order as-is instead of crediting it twice. Blank
            # references (cash, mostly) have nothing to dedupe against and
            # aren't checked — an accepted gap, not something worth an
            # Idempotency-Key protocol for a marketplace this size.
            if reference and order.payment_records.filter(reference=reference).exists():
                return Response(OrderSerializer(order).data)

            order.amount_paid += amount
            order.payment_reference = reference or order.payment_reference
            order.payment_method = method or order.payment_method

            if order.balance <= 0:
                order.status = "cleared"
            else:
                order.status = "debt_active"

            order.save(update_fields=["amount_paid", "payment_reference", "payment_method", "status", "updated_at"])

            try:
                PaymentRecord.objects.create(
                    order=order, amount=amount, reference=reference,
                    method=method, recorded_by=user,
                )
            except IntegrityError:
                # Belt-and-suspenders for the unique constraint itself, in
                # case some future codepath ever creates a PaymentRecord
                # without going through this locked block.
                return Response(OrderSerializer(order).data)

            claim_id = request.data.get("claim_id")
            if claim_id is not None:
                PaymentClaim.objects.filter(pk=claim_id, order=order, resolved=False).update(resolved=True)

        # Every recorded payment is worth telling the buyer about, even if
        # two partial payments both land on "debt_active" — unlike the other
        # transitions this isn't gated on the status label actually changing.
        record_status_event(order, order.status)

        serializer = OrderSerializer(order)
        return Response(serializer.data)


class RequestPaymentView(APIView):
    """
    POST /api/orders/<id>/request-payment/
    Seller (or admin) only. Sends the buyer a reminder email that a balance
    is still owing on this order. Purely a notification — it does not touch
    amount_paid or the order status.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        user = request.user
        orders = Order.objects.all() if is_admin_user(user) else Order.objects.filter(seller=user)
        try:
            order = orders.get(pk=pk)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        if order.status != "debt_active":
            return Response(
                {"error": f"Cannot request payment for order with status '{order.status}'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        send_payment_reminder_email(order)
        return Response({"ok": True})


class SubmitPaymentClaimView(APIView):
    """
    POST /api/orders/<id>/payment-claim/
    Body: { amount, reference }

    Buyer-only (must be this order's buyer). Lets the buyer say "I paid —
    here's the M-Pesa code" without the two of them having to relay it over
    WhatsApp or a phone call. Purely informational: it does not touch
    amount_paid or the order status — the seller still checks their own
    M-Pesa messages and records the real payment via RecordPaymentView.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, buyer=request.user)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        if order.status not in ("locked", "debt_active"):
            return Response(
                {"error": "This order isn't ready for payment yet."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            amount = Decimal(str(request.data.get("amount")))
        except (InvalidOperation, TypeError):
            return Response({"error": "Enter a valid amount."}, status=status.HTTP_400_BAD_REQUEST)
        if amount <= 0:
            return Response({"error": "Amount must be more than 0."}, status=status.HTTP_400_BAD_REQUEST)

        reference = (request.data.get("reference") or "").strip()
        if not reference:
            return Response({"error": "Enter the M-Pesa code."}, status=status.HTTP_400_BAD_REQUEST)

        claim = PaymentClaim.objects.create(order=order, amount=amount, reference=reference)
        send_payment_claim_seller_email(order, claim)

        order = _orders_for_serialization(Order.objects.filter(pk=pk)).get()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class AdminOrderListView(APIView):
    """
    GET /api/orders/admin/
    Admin only. Lists all orders with optional status/flagged filters.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        orders_qs = _orders_for_serialization(Order.objects.all()).order_by("-created_at")
        status_filter = request.query_params.get("status")
        if status_filter:
            orders_qs = orders_qs.filter(status=status_filter)
        if request.query_params.get("flagged") == "true":
            orders_qs = orders_qs.filter(is_flagged=True)

        paginator = LargeResultsSetPagination()
        page = paginator.paginate_queryset(orders_qs, request, view=self)
        serializer = OrderSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class FlagOrderView(APIView):
    """
    POST /api/orders/<id>/flag/
    Admin only. Marks an order for review — a lightweight escalation path
    for cancellations/disputes that need a human look, short of a full
    dispute-ticket system. Body: { reason }.
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        reason = request.data.get("reason", "").strip()
        if not reason:
            return Response({"error": "A reason is required to flag an order."}, status=status.HTTP_400_BAD_REQUEST)

        order.is_flagged = True
        order.flag_reason = reason
        order.flagged_at = timezone.now()
        order.save(update_fields=["is_flagged", "flag_reason", "flagged_at", "updated_at"])

        serializer = OrderSerializer(order)
        return Response(serializer.data)


class UnflagOrderView(APIView):
    """POST /api/orders/<id>/unflag/ — Admin only. Clears a flag once resolved."""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        order.is_flagged = False
        order.flag_reason = ""
        order.flagged_at = None
        order.save(update_fields=["is_flagged", "flag_reason", "flagged_at", "updated_at"])

        serializer = OrderSerializer(order)
        return Response(serializer.data)


class CartDraftView(APIView):
    """
    GET/PUT/DELETE /api/orders/drafts/<seller_id>/ — the authenticated
    buyer's own in-progress cart for that seller. The server-side twin of
    the IndexedDB draft NewListContent.tsx keeps locally; see CartDraft's
    docstring for why this exists (send_cart_reminders needs something to
    query — a local-only draft is invisible to the backend).

    `seller_id` in the URL is a *SellerProfile* id, the same one used
    everywhere else in this flow (the storefront URL, the product list's
    `?seller=` filter, OrderCreateSerializer's own seller_id) — not a User
    id. Resolved the same way OrderCreateSerializer does, so a draft here
    always points at the same underlying seller an order for it would.
    """
    permission_classes = [permissions.IsAuthenticated]

    def _resolve_seller_user(self, seller_id):
        try:
            return SellerProfile.objects.select_related("user").get(id=seller_id).user
        except SellerProfile.DoesNotExist:
            return None

    def get(self, request, seller_id):
        if not is_verified_buyer(request.user):
            return Response({"error": "Only buyers have carts."}, status=status.HTTP_403_FORBIDDEN)
        seller_user = self._resolve_seller_user(seller_id)
        if seller_user is None:
            return Response({"error": "Seller not found."}, status=status.HTTP_404_NOT_FOUND)
        try:
            draft = CartDraft.objects.get(buyer=request.user, seller=seller_user)
        except CartDraft.DoesNotExist:
            return Response({"error": "No draft."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"items": draft.items, "updated_at": draft.updated_at})

    def put(self, request, seller_id):
        if not is_verified_buyer(request.user):
            return Response({"error": "Only buyers have carts."}, status=status.HTTP_403_FORBIDDEN)
        seller_user = self._resolve_seller_user(seller_id)
        if seller_user is None:
            return Response({"error": "Seller not found."}, status=status.HTTP_404_NOT_FOUND)
        items = request.data.get("items")
        if not isinstance(items, list):
            return Response({"error": "items must be a list."}, status=status.HTTP_400_BAD_REQUEST)

        # An emptied-out cart isn't a draft worth keeping — deleting it here
        # (rather than storing an empty list) keeps the reminder job's query
        # trivial and means clearing a cart client-side quietly clears the
        # server copy too, no separate DELETE call required.
        if not items:
            CartDraft.objects.filter(buyer=request.user, seller=seller_user).delete()
            return Response({"items": []})

        draft, _ = CartDraft.objects.update_or_create(
            buyer=request.user,
            seller=seller_user,
            defaults={"items": items, "reminder_sent_at": None},
        )
        return Response({"items": draft.items, "updated_at": draft.updated_at})

    def delete(self, request, seller_id):
        if not is_verified_buyer(request.user):
            return Response({"error": "Only buyers have carts."}, status=status.HTTP_403_FORBIDDEN)
        seller_user = self._resolve_seller_user(seller_id)
        if seller_user is not None:
            CartDraft.objects.filter(buyer=request.user, seller=seller_user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
