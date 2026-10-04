"""
billing/payments.py — turning a Daraja M-Pesa payment into seller credit.

Two callers reach the same place: Daraja's callback (DarajaWebhookView) and the
seller's status poll (TopUpStatusView). Both call settle_payment, which asks
Daraja directly what happened and credits at most once, so neither can be
tricked by a forged request and neither can double-credit. The callback's own
claimed outcome is never trusted for the credit decision — see billing/daraja.py.
"""

import logging
import re
import uuid

from django.db import transaction

from .daraja import DarajaError, clean, stk_push, stk_query
from .models import Payment
from .services import apply_credit_change

logger = logging.getLogger("billing")

_KENYAN_MOBILE = re.compile(r"^(?:\+?254|0)([17]\d{8})$")


def normalize_phone(raw):
    """07XX / 01XX / 2547XX / +2547XX -> +254XXXXXXXXX, or None if it isn't a Kenyan mobile number."""
    match = _KENYAN_MOBILE.match(re.sub(r"[\s\-()]", "", raw or ""))
    return f"+254{match.group(1)}" if match else None


def start_topup(account, *, amount, phone):
    """
    Record a new top-up as "initiated", then ask Daraja to send an M-Pesa PIN
    prompt to the seller's phone. Raises DarajaError (having marked the
    payment failed) if Daraja won't take it, so a payment we couldn't start is
    never left looking pending.
    """
    # A placeholder until Daraja hands us its own CheckoutRequestID below —
    # Daraja's STK Push takes no reference of our own choosing at all, unlike
    # Paystack's, so the real id is only known once it answers.
    reference = f"{account.account_number}-{uuid.uuid4().hex[:12]}"
    payment = Payment.objects.create(account=account, reference=reference, amount_kes=amount, phone=phone)

    try:
        result = stk_push(phone=phone.lstrip("+"), amount_kes=amount, account_reference=account.account_number)
    except DarajaError as exc:
        payment.status = "failed"
        payment.raw_payload = {"error": "stk_push_failed", "detail": clean(exc.detail)}
        payment.save(update_fields=["status", "raw_payload"])
        raise

    payment.reference = result["checkout_request_id"]
    payment.raw_payload = {"push": clean(result["raw"])}
    payment.save(update_fields=["reference", "raw_payload"])
    return payment


def record_callback(checkout_request_id, callback):
    """
    Best-effort: save what Daraja's callback said (including the M-Pesa receipt
    number, if it succeeded) onto the matching Payment, purely for the audit
    trail — it is never read back to decide whether to credit anything. A
    no-op if the reference is unknown.
    """
    items = {item["Name"]: item.get("Value") for item in (callback.get("CallbackMetadata") or {}).get("Item", []) if "Name" in item}
    payment = Payment.objects.filter(reference=checkout_request_id).first()
    if payment is None:
        return None
    payment.raw_payload = {**payment.raw_payload, "callback": {**clean(callback), **items}}
    payment.save(update_fields=["raw_payload"])
    return payment


def settle_payment(reference):
    """
    Find out from Daraja what happened to `reference` (a CheckoutRequestID)
    and act on it, once.

    Returns the Payment, or None if we have no payment with that reference.
    Safe to call any number of times, from the callback and from polling, even
    at the same moment: the credit happens under a row lock and only if the
    payment is still "initiated". Raises DarajaError if Daraja can't be asked,
    leaving everything as it was so the caller can retry.

    Only Daraja's own stk_query reply decides anything — never the caller's
    say-so, and never an ambiguous reply (see billing/daraja.py): a payment
    Daraja hasn't finished deciding on is left exactly as it was.
    """
    payment = Payment.objects.filter(reference=reference).first()
    if payment is None or payment.status != "initiated":
        return payment

    result = stk_query(reference)  # network call, made without holding a lock
    if not result["settled"]:
        return payment  # Daraja has not reached a final answer yet

    with transaction.atomic():
        payment = Payment.objects.select_for_update().select_related("account").get(pk=payment.pk)
        if payment.status != "initiated":
            return payment  # another request settled it while we were asking

        payment.raw_payload = {**payment.raw_payload, "query": clean(result["raw"])}

        if not result["success"]:
            payment.status = "failed"
            payment.save(update_fields=["status", "raw_payload"])
        elif payment.account is None:
            logger.error("Daraja payment %s succeeded but its account no longer exists. Nothing was credited.", payment.pk)
            payment.save(update_fields=["raw_payload"])
        else:
            payment.status = "success"
            payment.save(update_fields=["status", "raw_payload"])
            apply_credit_change(
                payment.account, payment.amount_kes, "top_up",
                payment=payment, note="M-Pesa top-up",
            )

    return payment
