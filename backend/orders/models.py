"""
orders/models.py

Models for buyer orders.

An Order is placed by a buyer and contains one or more OrderItems.
Each OrderItem references a Product and records the quantity and price
at the time of purchase (price can change later so we snapshot it here).
"""

from django.db import models
from django.utils import timezone
from accounts.models import CustomUser
from products.models import Product


class Order(models.Model):
    """
    A purchase order placed by a buyer.

    One order contains items from a single seller (per-merchant orders).
    The seller can adjust the final price after reviewing, then lock it.
    Payments are tracked incrementally until the order is cleared.
    """

    STATUS_CHOICES = [
        ('submitted',   'Submitted'),      # buyer placed order, awaiting seller review
        ('sourcing',    'Sourcing'),        # seller is gathering/packing items
        ('locked',      'Locked'),          # price is final, awaiting payment
        ('debt_active', 'Debt Active'),     # partial payment, balance owed
        ('cleared',     'Cleared'),         # fully paid
        ('cancelled',   'Cancelled'),       # order cancelled
    ]

    buyer = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='orders',
    )

    # Seller inferred from products, stored for quick filtering
    seller = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='seller_orders',
        null=True, blank=True,
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted', db_index=True)

    # Initial estimate at time of order
    total_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Final locked price (seller may adjust after sourcing)
    final_total = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    # Payment tracking
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_reference = models.CharField(max_length=100, blank=True, help_text="M-Pesa txn code or other ref")

    # Debt recovery — the buyer's own commitment on when they'll clear the
    # remaining balance (asked as soon as the order first goes into debt).
    # Either side can set/edit it: the buyer from their order page, or the
    # seller if it was agreed by phone/WhatsApp instead. send_debt_reminders
    # (a daily cron-triggered management command) reads this to decide who
    # gets nudged today — see that command for the actual cadence.
    expected_payment_date = models.DateField(null=True, blank=True)
    # The date (not datetime — the cadence is day-granularity) a reminder was
    # last sent for this debt, so the daily command doesn't re-send the same
    # day's reminder if it's run more than once.
    last_debt_reminder_at = models.DateField(null=True, blank=True)
    payment_method = models.CharField(
        max_length=20,
        choices=[
            ('', '—'),
            ('mpesa', 'M-Pesa'),
            ('cash', 'Cash'),
            ('bank_transfer', 'Bank Transfer'),
        ],
        default='',
        blank=True,
    )

    # Delivery address — stored as a simple string for this version
    delivery_address = models.TextField(blank=True)

    # Notes from the buyer (e.g. "call me before delivery")
    buyer_notes = models.TextField(blank=True)

    # Notes from seller (e.g. "had to source from another supplier")
    sourcing_notes = models.TextField(blank=True)

    # Admin escalation — flagged for review (dispute, suspected fraud, a
    # cancellation that needs a human look, etc). Deliberately just a flag,
    # not a full dispute-ticket system: gives admins a way to mark and find
    # orders that need attention without building out a whole workflow.
    is_flagged = models.BooleanField(default=False, db_index=True)
    flag_reason = models.TextField(blank=True)
    flagged_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} by {self.buyer.username} — {self.status}"

    def calculate_total(self):
        """Recalculate total from all OrderItems and save — unpriced (custom_name, not yet sourced) lines don't count until the seller quotes them."""
        total = sum((item.subtotal() or 0) for item in self.items.all())
        self.total_price = total
        self.save()

    @property
    def balance(self):
        """Amount still owed."""
        total = self.final_total if self.final_total is not None else self.total_price
        return max(total - self.amount_paid, 0)

    @property
    def is_fully_paid(self):
        return self.balance <= 0

    @property
    def is_payment_late(self):
        """Past the buyer's own promised date, with money still owing. Purely informational — never changes what the buyer owes or blocks anything."""
        if self.status != "debt_active" or not self.expected_payment_date:
            return False
        return self.expected_payment_date < timezone.now().date()

    class Meta:
        ordering = ['-created_at']   # newest orders first
        indexes = [
            # Covers "this seller's/buyer's orders, newest first" — the
            # exact shape of every list/ledger/debts query below — instead
            # of forcing a filesort over just the single-column buyer/seller
            # index once a merchant's order history grows.
            models.Index(fields=['seller', '-created_at']),
            models.Index(fields=['buyer', '-created_at']),
            # Covers the ledger/debts filters: seller-or-buyer + status IN (...).
            models.Index(fields=['seller', 'status']),
            models.Index(fields=['buyer', 'status']),
        ]


class OrderItem(models.Model):
    """
    A single product line inside an Order.

    We store unit_price at the time of purchase — this protects us if
    the seller changes the product's price later.
    """

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',   # lets us do order.items.all()
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,   # keep the order item even if product is deleted
        null=True, blank=True,
        related_name='order_items',
    )

    # Set instead of `product` when the buyer is asking the seller to source
    # something that isn't in their catalog at all (not just out of stock) —
    # e.g. typed in from the cart's "Can't find it? Ask us to source it" box.
    custom_name = models.CharField(max_length=200, blank=True)

    quantity = models.PositiveIntegerField(default=1)

    # Snapshot the price at the moment of purchase. Null for a freshly-added
    # custom_name line — there's no catalog price to snapshot until the
    # seller sources it and quotes one.
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # True when this line needs the seller to source it specially rather than
    # pull from shelf stock — either an existing product with a zero-stock
    # shortfall, or a custom_name line with no catalog product at all. The
    # seller may revise the final invoice total once it's priced.
    is_sourcing = models.BooleanField(default=False)

    # Seller-side packing checklist — toggled from the fulfill screen while
    # an order is in "sourcing" status. Purely operational bookkeeping for
    # the seller; doesn't drive any order-status transition on its own.
    is_packed = models.BooleanField(default=False)

    # A sourcing line the seller tried to get and simply couldn't that day —
    # distinct from still-in-progress sourcing. Excluded from "all packed"
    # and shown to the buyer as unavailable rather than "still sourcing".
    not_found = models.BooleanField(default=False)

    def subtotal(self):
        """Returns quantity × unit_price for this line item, or None if it hasn't been priced yet."""
        if self.unit_price is None:
            return None
        return self.quantity * self.unit_price

    def __str__(self):
        name = self.product.name if self.product else (self.custom_name or '(deleted product)')
        return f"{self.quantity}x {name} in Order #{self.order.id}"


class OrderStatusEvent(models.Model):
    """
    Append-only log of every status an order has passed through.

    Two jobs: gives the buyer-facing tracker real per-step timestamps
    (Order.status alone only tells you the *current* stage), and is the
    hook notifications.record_status_event() writes to before emailing —
    one row per transition, so re-saving an order without changing its
    status never double-sends a notification.
    """

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='status_events',
    )
    status = models.CharField(max_length=20, choices=Order.STATUS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Order #{self.order_id} -> {self.status} at {self.created_at}"


class PaymentClaim(models.Model):
    """
    A buyer's self-reported proof of payment — the M-Pesa confirmation code
    they got after paying the seller directly (there's no payment gateway
    integration here; money always moves phone-to-phone first). This does
    NOT mark the order as paid on its own — the seller still confirms the
    real payment via the existing record-payment action. It just gets the
    buyer's claimed amount and code in front of the seller instead of the
    two of them having to relay it over WhatsApp or a phone call.
    """

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payment_claims')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reference = models.CharField(max_length=100, help_text="M-Pesa code the buyer says they used")
    submitted_at = models.DateTimeField(auto_now_add=True)
    # Set once the seller has checked their M-Pesa against this claim and
    # recorded the matching payment — see RecordPaymentView's claim_id param.
    resolved = models.BooleanField(default=False)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.reference} — KES {self.amount} for Order #{self.order_id}"
