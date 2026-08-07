from django.urls import path
from .views import (
    OrderListCreateView, SellerOrderListView, OrderDetailView,
    CancelOrderView, SellerLedgerView, BuyerDebtsView, RecordPaymentView,
    AdminOrderListView,
)

urlpatterns = [
    path("",                  OrderListCreateView.as_view(),   name="order-list"),
    path("seller/",           SellerOrderListView.as_view(),   name="seller-order-list"),
    path("admin/",            AdminOrderListView.as_view(),    name="admin-order-list"),
    path("ledger/seller/",    SellerLedgerView.as_view(),      name="seller-ledger"),
    path("debts/",            BuyerDebtsView.as_view(),        name="buyer-debts"),
    path("<int:pk>/",         OrderDetailView.as_view(),       name="order-detail"),
    path("<int:pk>/cancel/",  CancelOrderView.as_view(),       name="order-cancel"),
    path("<int:pk>/pay/",     RecordPaymentView.as_view(),     name="order-pay"),
]
