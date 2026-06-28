"""
orders/views.py
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from accounts.permissions import is_approved_seller, is_verified_buyer
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
    Returns all orders that contain at least one product owned by the logged-in seller.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not is_approved_seller(request.user):
            return Response(
                {"error": "Only approved sellers can view seller orders."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Find orders where any item's product belongs to this seller
        orders = (
            Order.objects
            .filter(items__product__seller=request.user)
            .distinct()
            .order_by("-created_at")
        )
        serializer = OrderSerializer(orders, many=True, context={"request": request})
        return Response(serializer.data)


class OrderDetailView(generics.RetrieveAPIView):
    """GET /api/orders/<id>/ — buyer or seller can view the order."""
    serializer_class   = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        from django.db.models import Q

        allowed_orders = Q(pk__in=[])
        if is_verified_buyer(user):
            allowed_orders |= Q(buyer=user)
        if is_approved_seller(user):
            allowed_orders |= Q(items__product__seller=user)

        return Order.objects.filter(allowed_orders).distinct()


class CancelOrderView(APIView):
    """POST /api/orders/<id>/cancel/ — buyer cancels a pending order."""
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

        if order.status != "pending":
            return Response(
                {"error": f"Cannot cancel an order with status '{order.status}'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            order = Order.objects.select_for_update().get(pk=order.pk, buyer=request.user)
            if order.status != "pending":
                return Response(
                    {"error": f"Cannot cancel an order with status '{order.status}'."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Pending orders have reserved stock; cancellation releases it back.
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
