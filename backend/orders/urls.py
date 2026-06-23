"""
orders/urls.py

URL patterns for the orders app.
All paths are relative to /api/orders/ (set in root urls.py).
"""

from django.urls import path
from .views import OrderListCreateView, OrderDetailView, CancelOrderView

urlpatterns = [
    path('', OrderListCreateView.as_view(), name='order-list'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('<int:pk>/cancel/', CancelOrderView.as_view(), name='order-cancel'),
]
