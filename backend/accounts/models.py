"""
accounts/models.py

Models for user authentication and seller profiles.

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
        return f"{self.username} ({self.role})"

    def is_seller(self):
        """Helper method — returns True if this user is a seller."""
        return self.role == 'seller'


class SellerProfile(models.Model):
    """
    Extra information for users who are sellers.

    Each seller has exactly one profile (OneToOneField).
    Buyers do NOT have a SellerProfile.
    """

    # OneToOneField means one user <-> one seller profile
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,   # delete profile if user is deleted
        related_name='seller_profile',
    )

    store_name = models.CharField(max_length=150)
    store_description = models.TextField(blank=True)
    location = models.CharField(max_length=100, blank=True, help_text="City or district in Rwanda")

    # Whether the admin has approved this seller
    is_verified = models.BooleanField(default=False)

    # Timestamps — Django fills these in automatically
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.store_name} — {self.user.username}"

    class Meta:
        ordering = ['-created_at']   # newest sellers first
