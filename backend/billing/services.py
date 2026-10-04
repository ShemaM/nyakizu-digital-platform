"""
billing/services.py

The rules of docs/BILLING_SPEC.md in one place:

- get_active_schedule / compute_fee: the public fee formula.
- apply_credit_change: the ONLY place a seller's credit ever moves. It writes an
  append-only CreditEntry each time, so the balance can always be reconciled
  (ledger_mismatch).
- charge_order_fee / refund_order_fee: called from signals.py when an order
  is locked or cancelled.
- enforcement_level: what a seller's balance means right now, for the
  reminder ladder and for billing/access.py's gating.
"""

from decimal import Decimal, ROUND_CEILING

from django.conf import settings
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone

from .models import CreditEntry, FeeSchedule, OrderFee, SellerAccount


def ensure_account(seller_profile):
    """Return the seller's SellerAccount, creating one if they have none. Never changes an existing one."""
    account, _ = SellerAccount.objects.get_or_create(seller=seller_profile)
    return account


_DEFAULT_SCHEDULE_FIELDS = dict(
    rate_percent=Decimal("0.500"), round_to_kes=5,
    min_fee_kes=Decimal("10.00"), max_fee_kes=Decimal("250.00"),
    free_orders_allowance=3,
)


def get_active_schedule():
    """
    The one fee schedule everything reads. Auto-creates the spec's starting
    values the first time nothing exists yet (e.g. a fresh database before its
    seed migration has run) rather than erroring — the same "never crash on a
    missing config row" approach as accounts/notifications.py's defaults.
    """
    schedule = FeeSchedule.objects.filter(is_active=True).order_by("-updated_at").first()
    if schedule is None:
        schedule = FeeSchedule.objects.create(**_DEFAULT_SCHEDULE_FIELDS)
    return schedule


# ── The fee formula ───────────────────────────────────────────────────────────

def compute_fee(order_total, schedule, *, buyer=False):
    """
    fee = clamp(ceil_to(rate% of order_total, round_to_kes), min_fee_kes, max_fee_kes)

    `buyer=True` uses the schedule's buyer_* fields (see FeeSchedule) — off by
    default (buyer_rate_percent is 0), per docs/BILLING_SPEC.md §3.
    """
    prefix = "buyer_" if buyer else ""
    rate = getattr(schedule, f"{prefix}rate_percent")
    order_total = Decimal(str(order_total))

    if rate <= 0 or order_total <= 0:
        return Decimal("0.00")

    round_to = getattr(schedule, f"{prefix}round_to_kes")
    min_fee = getattr(schedule, f"{prefix}min_fee_kes")
    max_fee = getattr(schedule, f"{prefix}max_fee_kes")

    raw = order_total * rate / Decimal("100")
    rounded = (raw / round_to).quantize(Decimal("1"), rounding=ROUND_CEILING) * round_to
    return min(max(rounded, min_fee), max_fee)


# ── Charging and refunding ────────────────────────────────────────────────────

@transaction.atomic
def apply_credit_change(account, amount, kind, *, order_fee=None, payment=None, note="", user=None, now=None):
    """
    Move a seller's credit by `amount` (negative takes credit away) and record it.
    Locks the account row, keeps debt_since in step with the sign, and writes the
    CreditEntry, all in one transaction. Every change to credit_kes must come
    through here — never assign to account.credit_kes anywhere else.
    """
    amount = Decimal(str(amount))
    if amount == 0:
        raise ValueError("A credit change must not be zero.")

    account = SellerAccount.objects.select_for_update().get(pk=account.pk)
    account.credit_kes += amount
    if account.credit_kes < 0 and account.debt_since is None:
        account.debt_since = now or timezone.now()
    elif account.credit_kes >= 0:
        account.debt_since = None
    account.save(update_fields=["credit_kes", "debt_since", "updated_at"])

    return CreditEntry.objects.create(
        account=account, account_number=account.account_number, kind=kind,
        amount_kes=amount, balance_after_kes=account.credit_kes,
        order_fee=order_fee, payment=payment, note=note, created_by=user,
    )


def ledger_mismatch(account):
    """
    None if the account's credit_kes equals the sum of its ledger entries, as it
    always should. Otherwise the difference (credit_kes minus the entries' total) —
    a sign credit was changed without going through apply_credit_change.
    """
    total = CreditEntry.objects.filter(account=account).aggregate(total=Sum("amount_kes"))["total"] or Decimal("0")
    current = SellerAccount.objects.values_list("credit_kes", flat=True).get(pk=account.pk)
    return None if current == total else current - total


@transaction.atomic
def charge_order_fee(order, now=None):
    """
    Charge (or waive) this order's fee, once. OrderFee's OneToOne to Order
    makes this safe to call more than once for the same order — a second call
    is a no-op. Returns the OrderFee.
    """
    existing = OrderFee.objects.filter(order=order).first()
    if existing is not None:
        return existing

    seller_profile = getattr(order.seller, "seller_profile", None)
    if seller_profile is None:
        # No store profile at all (shouldn't happen for a real order) — nothing to charge.
        return None

    ensure_account(seller_profile)
    account = SellerAccount.objects.select_for_update().get(seller=seller_profile)
    schedule = get_active_schedule()
    order_total = order.final_total if order.final_total is not None else order.total_price

    if account.free_orders_used < schedule.free_orders_allowance:
        account.free_orders_used += 1
        account.save(update_fields=["free_orders_used", "updated_at"])
        return OrderFee.objects.create(order=order, amount_kes=Decimal("0.00"), status="waived_free")

    fee = compute_fee(order_total, schedule)
    order_fee = OrderFee.objects.create(order=order, amount_kes=fee, status="charged")
    if fee > 0:
        apply_credit_change(account, -fee, "fee_charged", order_fee=order_fee, now=now)
    return order_fee


@transaction.atomic
def refund_order_fee(order, now=None):
    """
    Refund this order's fee if it was charged (not waived) and nothing has
    been paid against the order yet. A no-op otherwise — including if it was
    already refunded, so this is safe to call more than once.

    NOTE: orders.views.CancelOrderView currently only allows cancelling from
    "submitted"/"sourcing" — states a fee is never charged in, since charging
    happens on "locked" (see signals.py). So today this never actually finds
    anything to refund; it exists for the day a cancel-after-lock path is
    added (an admin action, or extending CancelOrderView), and is exercised
    directly in billing/test_services.py::RefundOrderFeeTests against that.
    """
    order_fee = OrderFee.objects.select_for_update().filter(order=order, status="charged").first()
    if order_fee is None or order.amount_paid > 0:
        return None

    seller_profile = order.seller.seller_profile
    account = SellerAccount.objects.select_for_update().get(seller=seller_profile)
    order_fee.status = "refunded"
    order_fee.refunded_at = now or timezone.now()
    order_fee.save(update_fields=["status", "refunded_at"])
    if order_fee.amount_kes > 0:
        apply_credit_change(account, order_fee.amount_kes, "fee_refunded", order_fee=order_fee, now=now)
    return order_fee


# ── What a seller's balance means right now ───────────────────────────────────

def enforcement_level(account, now=None) -> int:
    """
    0: plenty of credit, or a seller who hasn't started paying yet (still on
    their free orders) — a brand-new zero balance is not "low", it's normal.
    1: a seller who HAS used up their free orders and whose credit is low but
    not negative yet — a soft nudge. 2: something is owed. 3: owed enough, or
    long enough, to block approving new buyers. 4: owed enough, or long
    enough, to also block locking a new order's price. Only levels 3 and 4
    block anything, and even then never viewing records, existing approved
    buyers, or recording a payment already owed — see billing/access.py.
    """
    now = now or timezone.now()
    credit = account.credit_kes

    if credit >= 0:
        past_free_orders = account.free_orders_used >= get_active_schedule().free_orders_allowance
        return 1 if (past_free_orders and credit < settings.BILLING_LOW_CREDIT_KES) else 0

    owed = -credit
    debt_days = (now - account.debt_since).days if account.debt_since else 0
    if owed > settings.BILLING_LEVEL4_OWED_KES or debt_days > settings.BILLING_LEVEL4_DAYS:
        return 4
    if owed > settings.BILLING_LEVEL3_OWED_KES or debt_days > settings.BILLING_LEVEL3_DAYS:
        return 3
    return 2


def build_summary(account, now=None):
    """Everything the seller's billing card needs, for GET /api/billing/me/."""
    schedule = get_active_schedule()
    return {
        "account_number": account.account_number,
        "credit_kes": f"{account.credit_kes:.2f}",
        "free_orders_used": account.free_orders_used,
        "free_orders_remaining": max(schedule.free_orders_allowance - account.free_orders_used, 0),
        "debt_since": account.debt_since,
        "enforcement_level": enforcement_level(account, now),
        "charging_enabled": settings.BILLING_CHARGING_ENABLED,
        "enforcement_enabled": settings.BILLING_ENFORCEMENT_ENABLED,
        "min_topup_kes": settings.BILLING_MIN_TOPUP_KES,
        "max_topup_kes": settings.BILLING_MAX_TOPUP_KES,
        "fee_schedule": build_fee_schedule_summary(schedule),
    }


# Order sizes shown as worked examples on the pricing page. They are run through
# compute_fee, so what the page shows is always what would really be charged.
FEE_EXAMPLE_TOTALS = (1000, 5000, 20000, 100000)


def build_fee_examples(schedule=None):
    schedule = schedule or get_active_schedule()
    return [
        {"order_total_kes": f"{Decimal(total):.2f}", "fee_kes": f"{compute_fee(total, schedule):.2f}"}
        for total in FEE_EXAMPLE_TOTALS
    ]


def build_fee_schedule_summary(schedule=None):
    """The public fee formula, for GET /api/billing/fee-schedule/ and /api/billing/me/."""
    schedule = schedule or get_active_schedule()
    return {
        "rate_percent": f"{schedule.rate_percent:.3f}",
        "round_to_kes": schedule.round_to_kes,
        "min_fee_kes": f"{schedule.min_fee_kes:.2f}",
        "max_fee_kes": f"{schedule.max_fee_kes:.2f}",
        "free_orders_allowance": schedule.free_orders_allowance,
        "buyer_rate_percent": f"{schedule.buyer_rate_percent:.3f}",
    }
