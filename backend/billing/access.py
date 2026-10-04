"""
billing/access.py — the one place that decides what a seller's balance blocks.

FEE_GATED_ACTIONS lists the only two things an unpaid balance ever blocks, each
with the enforcement level it needs (see services.enforcement_level) and the
seller-facing message. Anything not listed is always allowed — viewing
records, recording debts and payments, and trading with buyers already
approved are never gated, regardless of balance.
"""

import logging

from django.conf import settings
from rest_framework.exceptions import APIException

from accounts.models import SellerProfile

from .services import ensure_account, enforcement_level

logger = logging.getLogger("billing")

FEE_GATED_ACTIONS = {
    "approve_new_buyers": {
        "level": 3,
        "detail": (
            "You have an outstanding balance on Nyakizu. Top up your account to approve new buyers. "
            "Your existing buyers and all your records are not affected."
        ),
    },
    "lock_order": {
        "level": 4,
        "detail": (
            "You have an outstanding balance on Nyakizu. Top up your account to confirm this order's price. "
            "You can still pack it, and record any payment already received against it."
        ),
    },
}


class UpgradeRequired(APIException):
    """HTTP 402. The frontend turns `code` and `feature` into a top-up prompt; `detail` is plain-English fallback text."""

    status_code = 402
    default_code = "UPGRADE_REQUIRED"

    def __init__(self, feature):
        super().__init__({
            "code": "UPGRADE_REQUIRED",
            "feature": feature,
            "detail": FEE_GATED_ACTIONS[feature]["detail"],
        })


def has_feature(seller, feature_key):
    """
    Can this seller (a User or a SellerProfile) do `feature_key` right now?

      - not one of FEE_GATED_ACTIONS -> always allowed.
      - BILLING_ENFORCEMENT_ENABLED off -> always allowed (Daraja top-ups
        aren't live yet, so a seller blocked now would have no way to pay
        their way out).
      - otherwise: allowed unless their enforcement_level has reached the
        action's required level.

    If billing itself breaks, this allows the action and logs the error — a
    billing bug must never stop anyone from trading.
    """
    if feature_key not in FEE_GATED_ACTIONS:
        return True
    if not settings.BILLING_ENFORCEMENT_ENABLED:
        return True
    try:
        profile = seller if isinstance(seller, SellerProfile) else seller.seller_profile
        account = ensure_account(profile)
        return enforcement_level(account) < FEE_GATED_ACTIONS[feature_key]["level"]
    except Exception:
        logger.exception("Could not check the %r feature for %r", feature_key, seller)
        return True


def require_feature(seller, feature_key):
    """Raise UpgradeRequired (HTTP 402) unless `has_feature`."""
    if not has_feature(seller, feature_key):
        raise UpgradeRequired(feature_key)
