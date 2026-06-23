"""
orders/views.py

API views for buyer orders.
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Order
from .serializers import OrderSerializer, OrderCreateSerializer


class OrderListCreateView(APIView):
    """
    GET  /api/orders/  — list the current buyer's orders
    POST /api/orders/  — place a new order
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(buyer=request.user)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            order = serializer.save()
            # Return the full order (including items) after creation
            output = OrderSerializer(order)
            return Response(output.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OrderDetailView(generics.RetrieveAPIView):
    """
    GET /api/orders/<id>/
    View a single order. Only the buyer who placed it can see it.
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # A buyer can only see their own orders (basic security)
        return Order.objects.filter(buyer=self.request.user)


class CancelOrderView(APIView):
    """
    POST /api/orders/<id>/cancel/
    Cancel a pending order. Only works if the order is still 'pending'.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, buyer=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if order.status != 'pending':
            return Response(
                {'error': f"Cannot cancel an order that is '{order.status}'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.status = 'cancelled'
        order.save()
        return Response({'message': 'Order cancelled successfully.'}, status=status.HTTP_200_OK)
