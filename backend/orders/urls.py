from django.urls import path
from .views import OrderListCreateView, SellerOrderListView, OrderDetailView, CancelOrderView

urlpatterns = [
    path("",             OrderListCreateView.as_view(), name="order-list"),
    path("seller/",      SellerOrderListView.as_view(), name="seller-order-list"),
    path("<int:pk>/",    OrderDetailView.as_view(),     name="order-detail"),
    path("<int:pk>/cancel/", CancelOrderView.as_view(), name="order-cancel"),
]
