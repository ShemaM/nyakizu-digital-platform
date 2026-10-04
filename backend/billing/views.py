import json
import logging
from decimal import Decimal, InvalidOperation

from django.conf import settings
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from accounts.permissions import IsApprovedSeller

from .daraja import DarajaError, DarajaNotConfigured
from .models import CreditEntry, Payment
from .payments import record_callback, settle_payment, start_topup
from .serializers import CreditEntrySerializer, TopUpSerializer
from .services import (
    build_fee_examples,
    build_fee_schedule_summary,
    build_summary,
    compute_fee,
    ensure_account,
    get_active_schedule,
)

logger = logging.getLogger("billing")

LEDGER_PAGE_SIZE = 50
MAX_QUOTE_TOTAL_KES = Decimal("10000000")


class FeeScheduleView(APIView):
    """
    GET /api/billing/fee-schedule/ — public. The exact formula the charge uses (docs/BILLING_SPEC.md §3),
    plus a few worked examples. With ?total=4000 it also returns what an order of that size would cost,
    so the pricing page's calculator never needs its own copy of the formula.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        schedule = get_active_schedule()
        data = build_fee_schedule_summary(schedule)
        data["examples"] = build_fee_examples(schedule)

        raw_total = request.query_params.get("total")
        if raw_total is not None:
            try:
                total = Decimal(raw_total)
            except InvalidOperation:
                total = None
            if total is None or not total.is_finite() or not 0 < total <= MAX_QUOTE_TOTAL_KES:
                return Response({"detail": "Enter an order total in shillings, like 4000."}, status=status.HTTP_400_BAD_REQUEST)
            data["quote"] = {"order_total_kes": f"{total:.2f}", "fee_kes": f"{compute_fee(total, schedule):.2f}"}
        return Response(data)


class MeView(APIView):
    """GET /api/billing/me/ — the signed-in seller's credit, free orders left, and enforcement level."""
    permission_classes = [IsApprovedSeller]

    def get(self, request):
        account = ensure_account(request.user.seller_profile)
        return Response(build_summary(account))


class LedgerView(APIView):
    """GET /api/billing/ledger/ — the seller's own statement: their last 50 credit movements, newest first."""
    permission_classes = [IsApprovedSeller]

    def get(self, request):
        account = ensure_account(request.user.seller_profile)
        entries = CreditEntry.objects.filter(account=account).select_related("order_fee")[:LEDGER_PAGE_SIZE]
        return Response(CreditEntrySerializer(entries, many=True).data)


class TopUpView(APIView):
    """
    POST /api/billing/pay/ — start an M-Pesa top-up: { amount_kes, phone }.
    Sends a PIN prompt to the seller's phone. Credit arrives once Daraja confirms
    it (its callback, or the status poll below), never on the strength of this call.
    """
    permission_classes = [IsApprovedSeller]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "billing_pay"

    def post(self, request):
        serializer = TopUpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        account = ensure_account(request.user.seller_profile)

        try:
            payment = start_topup(
                account, amount=serializer.validated_data["amount_kes"], phone=serializer.validated_data["phone"],
            )
        except DarajaNotConfigured:
            return Response({"detail": "Top-ups are not available yet."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except DarajaError:
            return Response(
                {"detail": "We could not start the M-Pesa payment. Please try again in a moment."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(
            {
                "reference": payment.reference,
                "status": payment.status,
                "amount_kes": f"{payment.amount_kes:.2f}",
                "detail": "Check your phone and enter your M-Pesa PIN to finish.",
            },
            status=status.HTTP_201_CREATED,
        )


class TopUpStatusView(APIView):
    """
    GET /api/billing/pay/<reference>/ — where a top-up stands. While it is still
    waiting, this asks Daraja directly (settle_payment), so it credits the seller
    even if the callback is late, dropped, or never arrives — Daraja does not
    retry a failed callback delivery the way some providers do, so this poll is
    not just a nicety here, it is the fallback of last resort.
    """
    permission_classes = [IsApprovedSeller]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "billing_pay_status"

    def get(self, request, reference):
        account = ensure_account(request.user.seller_profile)
        payment = Payment.objects.filter(reference=reference, account=account).first()
        if payment is None:
            return Response({"detail": "Payment not found."}, status=status.HTTP_404_NOT_FOUND)

        if payment.status == "initiated":
            try:
                payment = settle_payment(reference)
            except DarajaError:
                pass  # Daraja unreachable right now: report it as still waiting
            account.refresh_from_db()

        return Response({
            "reference": payment.reference,
            "status": payment.status,
            "amount_kes": f"{payment.amount_kes:.2f}",
            "credit_kes": f"{account.credit_kes:.2f}",
        })


_ACK = {"ResultCode": 0, "ResultDesc": "Accepted"}


def _webhook_ip_ok(request):
    """
    Optional second lock. Behind Heroku's router the last X-Forwarded-For entry
    is the real caller. Daraja's callback carries no signature at all (unlike
    Paystack's), so this is the only gate available on the request itself — but
    it is not load-bearing for safety: settle_payment never trusts what a
    callback says, only Daraja's own answer to "what happened to this
    reference", so a forged callback can never move money by itself either way.
    """
    allowed = settings.DARAJA_WEBHOOK_IPS
    if not allowed:
        return True
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    ip = forwarded.split(",")[-1].strip() if forwarded else request.META.get("REMOTE_ADDR")
    return ip in allowed


class DarajaWebhookView(APIView):
    """
    POST /api/billing/webhooks/daraja/ — Daraja's STK callback.

    No login, no CSRF, no throttle, and no signature to check (Daraja does not
    sign this request). The body's ResultCode/CallbackMetadata are recorded for
    the audit trail only — they never decide anything; settle_payment always
    asks Daraja directly what really happened. Daraja does not retry a callback
    it could not deliver, so unlike Paystack's webhook this always acknowledges
    with 200: refusing it or asking for a retry would gain nothing, and the
    seller's own status poll is the real fallback if this is ever missed.
    """
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    throttle_classes = []

    def post(self, request):
        if not _webhook_ip_ok(request):
            logger.warning("Ignored a Daraja callback from an address that is not on the allow-list.")
            return Response(_ACK)

        try:
            event = json.loads(request.body)
        except ValueError:
            return Response(_ACK)

        callback = (event.get("Body") or {}).get("stkCallback") or {}
        reference = callback.get("CheckoutRequestID")
        if not reference:
            return Response(_ACK)

        record_callback(reference, callback)
        try:
            payment = settle_payment(reference)
        except DarajaError:
            logger.exception("Could not confirm Daraja payment %s from its callback.", reference)
        else:
            if payment is None:
                logger.warning("Daraja callback for a reference we have no payment for: %s", reference)

        return Response(_ACK)
