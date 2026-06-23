"""
orders/models.py

Models for buyer orders.

An Order is placed by a buyer and contains one or more OrderItems.
Each OrderItem references a Product and records the quantity and price
at the time of purchase (price can change later so we snapshot it here).
"""

from django.db import models
from accounts.models import CustomUser
from products.models import Product


class Order(models.Model):
    """
    A purchase order placed by a buyer.

    One order can contain items from multiple sellers.
    """

    STATUS_CHOICES = [
        ('pending', 'Pending'),         # order created, payment not confirmed
        ('confirmed', 'Confirmed'),     # payment confirmed
        ('shipped', 'Shipped'),         # seller has dispatched the order
        ('delivered', 'Delivered'),     # buyer received the order
        ('cancelled', 'Cancelled'),     # order was cancelled
    ]

    buyer = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='orders',
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # Total price is stored so it doesn't change if product prices change later
    total_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Delivery address — stored as a simple string for this version
    delivery_address = models.TextField(blank=True)

    # Notes from the buyer (e.g. "call me before delivery")
    buyer_notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} by {self.buyer.username} — {self.status}"

    def calculate_total(self):
        """Recalculate total from all OrderItems and save."""
        total = sum(item.subtotal() for item in self.items.all())
        self.total_price = total
        self.save()

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

    def subtotal(self):
        """Returns quantity × unit_price for this line item."""
        return self.quantity * self.unit_price

    def __str__(self):
        product_name = self.product.name if self.product else '(deleted product)'
        return f"{self.quantity}x {product_name} in Order #{self.order.id}"
