"""
orders/views.py
"""

from decimal import Decimal, InvalidOperation
from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from accounts.permissions import is_approved_seller, is_verified_buyer, is_admin_user
from .models import Order, OrderItem
from .notifications import record_status_event
from .serializers import OrderSerializer, OrderCreateSerializer


def _orders_for_serialization(queryset):
    """
    Attach the select_related/prefetch_related every OrderSerializer listing
    needs — without it, each order re-queries buyer, items, each item's
    product, and status_events individually (N+1 across the whole page).
    """
    return queryset.select_related("buyer", "seller").prefetch_related(
        "items__product", "status_events",
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
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

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
        serializer = OrderSerializer(orders, many=True, context={"request": request})
        return Response(serializer.data)


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
        old_status = serializer.instance.status
        new_status = serializer.validated_data.get("status", old_status)
        if new_status == "cancelled" and old_status != "cancelled":
            # Cancelling has side effects (releasing stock back to inventory)
            # that only CancelOrderView performs — going through this generic
            # PATCH used to silently skip that and leak sold-out stock.
            raise ValidationError(
                {"status": "Use the cancel endpoint (/orders/<id>/cancel/) to cancel an order."}
            )

        order = serializer.save()
        if order.status != old_status:
            record_status_event(order, order.status)


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

        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)


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

        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)


class RecordPaymentView(APIView):
    """
    POST /api/orders/<id>/pay/
    Record a payment against an order. Seller or buyer can record.
    Body: { amount, payment_reference, payment_method }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        if order.buyer != user and order.seller != user and not is_admin_user(user):
            return Response(
                {"error": "You do not have permission to record payments on this order."},
                status=status.HTTP_403_FORBIDDEN,
            )

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

        with transaction.atomic():
            order = Order.objects.select_for_update().get(pk=order.pk)
            order.amount_paid += amount
            order.payment_reference = request.data.get("payment_reference", order.payment_reference)
            order.payment_method = request.data.get("payment_method", order.payment_method)

            if order.balance <= 0:
                order.status = "cleared"
            else:
                order.status = "debt_active"

            order.save(update_fields=["amount_paid", "payment_reference", "payment_method", "status", "updated_at"])

        # Every recorded payment is worth telling the buyer about, even if
        # two partial payments both land on "debt_active" — unlike the other
        # transitions this isn't gated on the status label actually changing.
        record_status_event(order, order.status)

        serializer = OrderSerializer(order)
        return Response(serializer.data)


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
        serializer = OrderSerializer(orders_qs, many=True)
        return Response(serializer.data)


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
