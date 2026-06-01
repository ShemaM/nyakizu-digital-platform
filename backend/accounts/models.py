"""
accounts/models.py

Models for user authentication and profiles.

We extend Django's built-in AbstractUser so we keep all the
password hashing and authentication logic for free, and just
add the fields our platform needs.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """
    A user account on the Nyakizu platform.

    Both buyers and sellers share this model.
    The 'role' field tells us which type they are.
    """

    ROLE_CHOICES = [
        ('buyer', 'Buyer'),
        ('seller', 'Seller'),
        ('admin', 'Admin'),
    ]

    # Extra fields on top of Django's default username/email/password
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='buyer')
    phone_number = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"

    def is_seller(self):
        return self.role == 'seller'

    def is_buyer(self):
        return self.role == 'buyer'


class BuyerProfile(models.Model):
    """
    Extra information for buyers.

    Stores where they sell, their usual supplier, and how they trade.
    Matches the BuyerDetailsForm fields in the frontend.
    """

    BUSINESS_TYPE_CHOICES = [
        ('Hawker', 'Hawker / Street vendor'),
        ('Retail shop', 'Retail shop owner'),
        ('Repair shop', 'Phone repair shop'),
        ('Online seller', 'Online seller (WhatsApp / social media)'),
    ]

    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='buyer_profile',
    )

    # "Where do you sell from?" — matches the frontend's 'location' field
    location = models.CharField(max_length=150, blank=True)

    # "Usual supplier" — optional, matches frontend's 'mainSupplier'
    main_supplier = models.CharField(max_length=200, blank=True)

    # "How do you trade?" — matches frontend's 'businessType' pills
    business_type = models.CharField(
        max_length=20,
        choices=BUSINESS_TYPE_CHOICES,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Buyer: {self.user.get_full_name() or self.user.username}"

    class Meta:
        ordering = ['-created_at']


class SellerProfile(models.Model):
    """
    Extra information for users who are sellers (wholesalers).

    Stores shop name, location, and the categories they sell.
    Matches the SellerDetailsForm fields in the frontend.
    """

    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='seller_profile',
    )

    store_name = models.CharField(max_length=150)
    store_description = models.TextField(blank=True)
    location = models.CharField(max_length=150, blank=True, help_text="City, street, or district")

    # Categories they sell — stored as a JSON list of strings,
    # e.g. ["Screen protectors", "Chargers"].
    # Matches the multi-select chip UI in the frontend's SellerDetailsForm.
    categories = models.JSONField(default=list, blank=True)

    # Admin must verify a seller before they appear in buyer searches
    is_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.store_name} — {self.user.get_full_name() or self.user.username}"

    class Meta:
        ordering = ['-created_at']
