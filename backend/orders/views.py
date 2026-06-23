"""
orders/views.py
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderCreateSerializer


class OrderListCreateView(APIView):
    """
    GET  /api/orders/  — buyer's own orders
    POST /api/orders/  — place a new order
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        orders     = Order.objects.filter(buyer=request.user).order_by("-created_at")
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    def post(self, request):
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
        # Buyer sees their own orders; seller sees orders containing their products
        from django.db.models import Q
        return Order.objects.filter(
            Q(buyer=user) | Q(items__product__seller=user)
        ).distinct()


class CancelOrderView(APIView):
    """POST /api/orders/<id>/cancel/ — buyer cancels a pending order."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, buyer=request.user)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        if order.status != "pending":
            return Response(
                {"error": f"Cannot cancel an order with status '{order.status}'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.status = "cancelled"
        order.save()
        return Response({"message": "Order cancelled."})
