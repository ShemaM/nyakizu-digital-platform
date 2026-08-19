from django.urls import path
from .views import (
    OrderListCreateView, SellerOrderListView, OrderDetailView,
    CancelOrderView, SellerLedgerView, BuyerDebtsView, RecordPaymentView,
    AdminOrderListView, FlagOrderView, UnflagOrderView, ToggleItemPackedView,
    ToggleItemNotFoundView, SetItemPriceView, SubmitPaymentClaimView,
    RequestPaymentView,
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
    path("<int:pk>/payment-claim/", SubmitPaymentClaimView.as_view(), name="order-payment-claim"),
    path("<int:pk>/request-payment/", RequestPaymentView.as_view(), name="order-request-payment"),
    path("<int:pk>/flag/",    FlagOrderView.as_view(),         name="order-flag"),
    path("<int:pk>/unflag/",  UnflagOrderView.as_view(),       name="order-unflag"),
    path("<int:order_id>/items/<int:item_id>/toggle-packed/",    ToggleItemPackedView.as_view(),     name="order-item-toggle-packed"),
    path("<int:order_id>/items/<int:item_id>/toggle-not-found/", ToggleItemNotFoundView.as_view(),   name="order-item-toggle-not-found"),
    path("<int:order_id>/items/<int:item_id>/set-price/",        SetItemPriceView.as_view(),         name="order-item-set-price"),
]
