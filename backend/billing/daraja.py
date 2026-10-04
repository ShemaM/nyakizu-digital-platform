"""
billing/daraja.py — the only code that talks to Safaricom's Daraja API
(M-Pesa Express / STK Push): the seller types a phone number, gets a PIN
prompt on their phone, and we find out what happened.

Two things about Daraja itself shape how this is written, both confirmed
against Safaricom's docs and independent field reports rather than assumed:

1. The STK callback carries no signature. So payments.py never trusts a
   callback's contents for a credit decision — it only uses it as a hint of
   which payment to go and ask Daraja about directly (stk_query), exactly
   like the seller's own status poll does. A forged callback can only make us
   ask a question we already had the right to ask; it can never move money by
   itself.
2. stk_query is unreliable while a transaction is still being decided, in two
   different ways — both confirmed against a real sandbox transaction, not
   just the docs. Safaricom can return an ambiguous "errorCode" envelope
   (commonly {"errorCode": "500.001.1001", ...}) for a transaction that later
   succeeds; AND it can return a clean, well-formed {"ResultCode": "4999",
   "ResultDesc": "The transaction is still under processing"} — a real reply
   shape, but still not a final answer. So only "0" (success) and a short,
   specific list of Safaricom's documented terminal failure codes count as
   settled; every other ResultCode, known or not, is read as "still waiting,"
   exactly like the ambiguous envelope. Reading an unrecognised or
   still-processing code as a failure is precisely the bug this shipped with
   at first, caught by testing against Safaricom's real sandbox: it turned
   genuinely still-pending payments into ones wrongly reported as failed.

The consumer key and secret are read from settings here and nowhere else;
never logged, never put in an error message, never stored.
"""

import base64
import logging

import requests
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger("billing")

# (connect, read) seconds. A slow Daraja must never hang a web worker.
TIMEOUT = (5, 15)

_BASE_URLS = {
    "sandbox": "https://sandbox.safaricom.co.ke",
    "production": "https://api.safaricom.co.ke",
}

# The fields worth keeping from a push/query reply, for a Payment's raw_payload.
_KEEP = (
    "ResponseCode", "ResponseDescription", "CustomerMessage",
    "MerchantRequestID", "CheckoutRequestID",
    "ResultCode", "ResultDesc", "errorCode", "errorMessage",
)

# Safaricom's documented, final ResultCodes for a failed STK push (as strings —
# Daraja sends this as either a JSON number or a numeric string depending on
# the call). Deliberately short and conservative: an unrecognised code is
# never assumed to be a failure, only ever "still waiting" — see stk_query.
#   1032: cancelled by the customer on their phone.
#   1037: timeout — the phone was unreachable or the customer never responded.
#   1:    insufficient M-Pesa balance.
#   2001: the wrong PIN was entered.
_TERMINAL_FAILURE_CODES = {"1032", "1037", "1", "2001"}


class DarajaError(Exception):
    """
    Daraja could not be reached, or refused or garbled the request.

    `detail` is Daraja's own response body when it refused the request —
    kept so a failed Payment's raw_payload can show the real reason instead of
    a generic marker. Empty when there was no response to show (a network
    failure, or an unreadable reply).
    """

    def __init__(self, message, detail=None):
        super().__init__(message)
        self.detail = detail or {}


class DarajaNotConfigured(DarajaError):
    """The Daraja credentials are not set, so top-ups are switched off."""


def clean(body):
    """The interesting fields of a Daraja reply, safe to store in a Payment's raw_payload."""
    return {key: body[key] for key in _KEEP if key in body}


def _base_url():
    return _BASE_URLS.get(settings.DARAJA_ENV, _BASE_URLS["sandbox"])


def _configured():
    return bool(
        settings.MPESA_DARAJA_ENABLED
        and settings.DARAJA_CONSUMER_KEY and settings.DARAJA_CONSUMER_SECRET
        and settings.DARAJA_SHORTCODE and settings.DARAJA_PASSKEY
    )


def get_access_token():
    """
    An OAuth token, good for about an hour. Fetched fresh on every call rather
    than cached: Nyakizu's top-up volume is small (throttled to 10 per seller
    per hour), and a stale cached token failing mid-request is a worse failure
    mode than one extra request.
    """
    if not _configured():
        raise DarajaNotConfigured("Daraja credentials are not set.")
    try:
        response = requests.get(
            f"{_base_url()}/oauth/v1/generate", params={"grant_type": "client_credentials"},
            auth=(settings.DARAJA_CONSUMER_KEY, settings.DARAJA_CONSUMER_SECRET), timeout=TIMEOUT,
        )
    except requests.RequestException as exc:
        logger.warning("Could not reach Daraja (%s).", type(exc).__name__)
        raise DarajaError("Could not reach Daraja.") from exc

    try:
        body = response.json()
    except ValueError:
        snippet = response.text[:300]
        logger.warning("Daraja sent an unreadable reply (HTTP %s): %s", response.status_code, snippet)
        raise DarajaError(f"Daraja sent an unreadable reply (HTTP {response.status_code}).", detail={"body": snippet})

    token = body.get("access_token")
    if response.status_code >= 400 or not token:
        message = body.get("errorMessage") or body.get("error_description") or f"HTTP {response.status_code}"
        logger.warning("Daraja refused to authenticate: %s", message)
        raise DarajaError(message, detail=body)
    return token


def _password_and_timestamp():
    """Password = base64(shortcode + passkey + timestamp). Timestamp is Nairobi local time, yyyymmddhhiiss."""
    stamp = timezone.localtime(timezone.now()).strftime("%Y%m%d%H%M%S")
    raw = f"{settings.DARAJA_SHORTCODE}{settings.DARAJA_PASSKEY}{stamp}"
    return base64.b64encode(raw.encode()).decode(), stamp


def _post(path, token, payload):
    try:
        response = requests.post(
            f"{_base_url()}{path}", headers={"Authorization": f"Bearer {token}"},
            json=payload, timeout=TIMEOUT,
        )
    except requests.RequestException as exc:
        logger.warning("Could not reach Daraja (%s).", type(exc).__name__)
        raise DarajaError("Could not reach Daraja.") from exc

    try:
        return response.status_code, response.json()
    except ValueError:
        snippet = response.text[:300]
        logger.warning("Daraja sent an unreadable reply (HTTP %s): %s", response.status_code, snippet)
        raise DarajaError(f"Daraja sent an unreadable reply (HTTP {response.status_code}).", detail={"body": snippet})


def stk_push(*, phone, amount_kes, account_reference, description="Nyakizu topup"):
    """
    Ask Daraja to send an M-Pesa PIN prompt to `phone` (254XXXXXXXXX, no "+").
    Returns Daraja's reply with `checkout_request_id` — the id everything else
    (stk_query, the callback) uses to refer to this one payment. Only means the
    prompt is on its way, never that the customer has paid — see stk_query.

    `account_reference` and `description` are shown on the STK screen; Daraja
    has historically capped these at 12 and 13 characters, so they are always
    trimmed to fit rather than risk the whole request being refused over it.
    """
    token = get_access_token()
    password, stamp = _password_and_timestamp()
    status_code, body = _post("/mpesa/stkpush/v1/processrequest", token, {
        "BusinessShortCode": settings.DARAJA_SHORTCODE,
        "Password": password,
        "Timestamp": stamp,
        "TransactionType": settings.DARAJA_TRANSACTION_TYPE,
        "Amount": int(amount_kes),
        "PartyA": phone,
        "PartyB": settings.DARAJA_SHORTCODE,
        "PhoneNumber": phone,
        "CallBackURL": settings.DARAJA_CALLBACK_URL,
        "AccountReference": account_reference[:12],
        "TransactionDesc": description[:13],
    })

    if status_code >= 400 or str(body.get("ResponseCode")) != "0":
        message = body.get("errorMessage") or body.get("ResponseDescription") or f"HTTP {status_code}"
        logger.warning("Daraja refused an STK push: %s", message)
        raise DarajaError(message, detail=body)

    checkout_request_id = body.get("CheckoutRequestID")
    if not checkout_request_id:
        raise DarajaError("Daraja accepted the request but gave no CheckoutRequestID.", detail=body)
    return {"checkout_request_id": checkout_request_id, "raw": body}


def stk_query(checkout_request_id):
    """
    Ask Daraja what happened to a checkout request.

    Returns {"settled": False} for anything that is not a known final answer:
    Daraja's ambiguous {"errorCode": ...} envelope (no "ResultCode" at all), OR
    a ResultCode that is not "0" and not in _TERMINAL_FAILURE_CODES — Daraja
    can send a perfectly well-formed ResultCode that still just means "not
    done yet" (its documented "4999", "The transaction is still under
    processing", for one). Neither case is ever read as a failure. Returns
    {"settled": True, "success": bool, "raw": body} only once Daraja gives an
    answer this module actually recognises as final.

    Raises DarajaError only for a genuine inability to ask at all (Daraja
    unreachable, or the credentials don't work) — the caller decides what to
    do with that; it is never treated as "the payment failed."
    """
    token = get_access_token()
    password, stamp = _password_and_timestamp()
    _, body = _post("/mpesa/stkpushquery/v1/query", token, {
        "BusinessShortCode": settings.DARAJA_SHORTCODE,
        "Password": password,
        "Timestamp": stamp,
        "CheckoutRequestID": checkout_request_id,
    })

    if "ResultCode" not in body:
        return {"settled": False, "raw": body}

    code = str(body.get("ResultCode"))
    if code == "0":
        return {"settled": True, "success": True, "raw": body}
    if code in _TERMINAL_FAILURE_CODES:
        return {"settled": True, "success": False, "raw": body}
    return {"settled": False, "raw": body}
