"""
orders/views.py
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import Q
from accounts.permissions import is_approved_seller, is_verified_buyer, is_admin_user
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderCreateSerializer


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

        orders     = Order.objects.filter(buyer=request.user).order_by("-created_at")
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

        orders = Order.objects.filter(
            seller=request.user
        ).distinct().order_by("-created_at")
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

        return Order.objects.filter(allowed_orders).distinct()


class CancelOrderView(APIView):
    """POST /api/orders/<id>/cancel/ — buyer cancels a submitted order."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, buyer=request.user)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        if not is_verified_buyer(request.user):
            return Response(
                {"error": "Only verified buyers can cancel buyer orders."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if order.status not in ("submitted", "sourcing"):
            return Response(
                {"error": f"Cannot cancel an order with status '{order.status}'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            order = Order.objects.select_for_update().get(pk=order.pk, buyer=request.user)
            if order.status not in ("submitted", "sourcing"):
                return Response(
                    {"error": f"Cannot cancel an order with status '{order.status}'."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Release stock back
            for item in OrderItem.objects.select_related("product").filter(order=order):
                if item.product_id:
                    product = item.product
                    product.stock_quantity += item.quantity
                    if product.stock_quantity > 0 and product.status == "out_of_stock":
                        product.status = "available"
                    product.save(update_fields=["stock_quantity", "status", "updated_at"])

            order.status = "cancelled"
            order.save(update_fields=["status", "updated_at"])

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

        orders = Order.objects.filter(
            seller=request.user,
            status__in=["locked", "debt_active", "cleared"],
        ).order_by("-created_at")

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

        orders = Order.objects.filter(
            buyer=request.user,
            status__in=["locked", "debt_active"],
        ).order_by("-created_at")

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
            amount = float(amount)
        except (ValueError, TypeError):
            return Response({"error": "amount must be a number."}, status=status.HTTP_400_BAD_REQUEST)

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

        serializer = OrderSerializer(order)
        return Response(serializer.data)


class AdminOrderListView(APIView):
    """
    GET /api/orders/admin/
    Admin only. Lists all orders with optional status filter.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        orders_qs = Order.objects.all().select_related("buyer", "seller").prefetch_related("items").order_by("-created_at")
        status_filter = request.query_params.get("status")
        if status_filter:
            orders_qs = orders_qs.filter(status=status_filter)
        serializer = OrderSerializer(orders_qs, many=True)
        return Response(serializer.data)
