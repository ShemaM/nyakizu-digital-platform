from django.urls import path

from .views import DarajaWebhookView, FeeScheduleView, LedgerView, MeView, TopUpStatusView, TopUpView

urlpatterns = [
    path("fee-schedule/", FeeScheduleView.as_view(), name="billing-fee-schedule"),
    path("me/", MeView.as_view(), name="billing-me"),
    path("ledger/", LedgerView.as_view(), name="billing-ledger"),
    path("pay/", TopUpView.as_view(), name="billing-pay"),
    path("pay/<str:reference>/", TopUpStatusView.as_view(), name="billing-pay-status"),
    path("webhooks/daraja/", DarajaWebhookView.as_view(), name="billing-daraja-webhook"),
]
