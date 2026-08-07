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

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')

    # Initial estimate at time of order
    total_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Final locked price (seller may adjust after sourcing)
    final_total = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    # Payment tracking
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_reference = models.CharField(max_length=100, blank=True, help_text="M-Pesa txn code or other ref")
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
        """Recalculate total from all OrderItems and save."""
        total = sum(item.subtotal() for item in self.items.all())
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

    class Meta:
        ordering = ['-created_at']   # newest orders first


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
        null=True,
        related_name='order_items',
    )

    quantity = models.PositiveIntegerField(default=1)

    # Snapshot the price at the moment of purchase
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    # True when this line was placed against a zero-stock "can be sourced"
    # product — the seller sources it specially rather than pulling from
    # shelf stock, and may revise the final invoice total accordingly.
    is_sourcing = models.BooleanField(default=False)

    def subtotal(self):
        """Returns quantity × unit_price for this line item."""
        return self.quantity * self.unit_price

    def __str__(self):
        product_name = self.product.name if self.product else '(deleted product)'
        return f"{self.quantity}x {product_name} in Order #{self.order.id}"


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
