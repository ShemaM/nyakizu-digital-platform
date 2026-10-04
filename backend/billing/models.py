"""
billing/models.py

Per-order service fee — see docs/BILLING_SPEC.md. Only sellers pay. Buyers are
never charged until a human turns on the (built but disabled) buyer rate.
Nyakizu never touches buyer->seller payments; only a seller's own prepaid
credit, topped up via M-Pesa (Daraja), is tracked here.
"""

from django.conf import settings
from django.db import models

from accounts.models import SellerProfile
from orders.models import Order

from .utils import account_number_for


class FeeSchedule(models.Model):
    """
    The one place the fee formula lives. `GET /api/billing/fee-schedule/` reads
    this row directly, so the published rate and the charged rate can never
    disagree. Only one row is ever active; is_active lets an admin stage a new
    rate before switching to it.

    fee = clamp(ceil_to(rate_percent% of the order total, round_to_kes), min_fee_kes, max_fee_kes)

    The buyer_* fields are the same formula for a future buyer-side fee.
    buyer_rate_percent defaults to 0, meaning "off" — see services.compute_fee.
    """

    rate_percent = models.DecimalField(max_digits=5, decimal_places=3, default="0.500")
    round_to_kes = models.PositiveIntegerField(default=5)
    min_fee_kes = models.DecimalField(max_digits=8, decimal_places=2, default="10.00")
    max_fee_kes = models.DecimalField(max_digits=8, decimal_places=2, default="250.00")
    free_orders_allowance = models.PositiveIntegerField(default=3)

    buyer_rate_percent = models.DecimalField(max_digits=5, decimal_places=3, default="0.000")
    buyer_round_to_kes = models.PositiveIntegerField(default=5)
    buyer_min_fee_kes = models.DecimalField(max_digits=8, decimal_places=2, default="0.00")
    buyer_max_fee_kes = models.DecimalField(max_digits=8, decimal_places=2, default="0.00")

    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.rate_percent}% (min KES {self.min_fee_kes}, max KES {self.max_fee_kes})"


class SellerAccount(models.Model):
    """
    One per seller (was `Subscription` in the v1 subscription model — see
    docs/BILLING_SPEC.md's v2 rewrite). credit_kes is a prepaid balance that
    can go negative: that is a seller who owes money, not an error state.
    """

    seller = models.OneToOneField(SellerProfile, on_delete=models.CASCADE, related_name="billing_account")
    account_number = models.CharField(max_length=20, unique=True, editable=False)
    credit_kes = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    free_orders_used = models.PositiveIntegerField(default=0)
    # Set the moment credit_kes first goes negative, cleared the moment it
    # returns to >= 0. Drives the enforcement ladder's "or older than N days"
    # trigger — see services.enforcement_level().
    debt_since = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.account_number:
            self.account_number = account_number_for(self.seller_id)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.account_number} — {self.seller.store_name} (KES {self.credit_kes})"


class OrderFee(models.Model):
    """
    One row per order, created the moment the seller locks its price (the
    order's total is final at that point). A cancelled order refunds its fee
    in full, but only if nothing has been paid against it yet.
    """

    STATUS_CHOICES = [
        ("waived_free", "Waived — one of the seller's free orders"),
        ("charged", "Charged"),
        ("refunded", "Refunded — order cancelled before payment"),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="billing_fee")
    amount_kes = models.DecimalField(max_digits=8, decimal_places=2)
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, db_index=True)
    charged_at = models.DateTimeField(auto_now_add=True)
    refunded_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"KES {self.amount_kes} for Order #{self.order_id} [{self.status}]"


class Payment(models.Model):
    """
    A Daraja M-Pesa top-up into a SellerAccount's credit. Nullable `account`
    only exists so a payment is never lost if reconciliation is ever needed;
    in practice every Payment is created already pointing at the account that
    initiated it.
    """

    STATUS_CHOICES = [
        ("initiated", "Waiting for the customer"),
        ("success", "Paid"),
        ("failed", "Failed"),
    ]

    account = models.ForeignKey(SellerAccount, null=True, blank=True, on_delete=models.SET_NULL, related_name="payments")
    # Daraja's CheckoutRequestID -- the one thing that makes a
    # retried/duplicate webhook safe to acknowledge without crediting twice.
    reference = models.CharField(max_length=100, unique=True)
    amount_kes = models.DecimalField(max_digits=10, decimal_places=2)
    phone = models.CharField(max_length=20, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="initiated", db_index=True)
    raw_payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.reference} — KES {self.amount_kes} [{self.status}]"


class ImmutableLedgerError(Exception):
    """Raised on any attempt to edit or delete a CreditEntry."""


class CreditEntry(models.Model):
    """
    One row for every movement of a seller's credit, written only by
    services.apply_credit_change. Append-only: an entry is never edited or
    deleted, so `credit_kes` on the account can always be checked against the sum
    of its entries (see services.ledger_mismatch and `manage.py check_billing_ledger`).

    amount_kes is signed: negative takes credit away (a fee), positive adds it
    (a top-up or refund). `account` is nullable and the account number is copied
    onto the entry, so the record survives a seller being deleted.
    """

    KIND_CHOICES = [
        ("fee_charged", "Fee charged"),
        ("fee_refunded", "Fee refunded"),
        ("top_up", "Top-up"),
        ("adjustment", "Adjustment by Nyakizu staff"),
    ]

    account = models.ForeignKey(SellerAccount, null=True, blank=True, on_delete=models.SET_NULL, related_name="entries")
    account_number = models.CharField(max_length=20, db_index=True)
    kind = models.CharField(max_length=12, choices=KIND_CHOICES, db_index=True)
    amount_kes = models.DecimalField(max_digits=10, decimal_places=2)
    balance_after_kes = models.DecimalField(max_digits=10, decimal_places=2)
    order_fee = models.ForeignKey(OrderFee, null=True, blank=True, on_delete=models.SET_NULL, related_name="entries")
    payment = models.ForeignKey(Payment, null=True, blank=True, on_delete=models.SET_NULL, related_name="entries")
    note = models.CharField(max_length=255, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="+")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at", "-id"]

    def save(self, *args, **kwargs):
        if not self._state.adding:
            raise ImmutableLedgerError("Ledger entries are append-only and cannot be edited.")
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ImmutableLedgerError("Ledger entries are append-only and cannot be deleted.")

    def __str__(self):
        return f"{self.account_number} {self.kind} KES {self.amount_kes} -> {self.balance_after_kes}"
