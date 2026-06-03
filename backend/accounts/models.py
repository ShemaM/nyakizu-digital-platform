import secrets
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta


class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('buyer',  'Buyer'),
        ('seller', 'Seller'),
        ('admin',  'Admin'),
    ]

    role         = models.CharField(max_length=10, choices=ROLE_CHOICES, default='buyer')
    phone_number = models.CharField(max_length=20, blank=True)
    email        = models.EmailField(unique=True)

    # Email verification
    is_email_verified   = models.BooleanField(default=False)
    email_verify_token  = models.CharField(max_length=64, blank=True, db_index=True)
    email_verify_sent   = models.DateTimeField(null=True, blank=True)

    def generate_verify_token(self):
        self.email_verify_token = secrets.token_urlsafe(32)
        self.email_verify_sent  = timezone.now()
        self.save(update_fields=["email_verify_token", "email_verify_sent"])
        return self.email_verify_token

    def verify_email_token_valid(self, token: str) -> bool:
        if not self.email_verify_token or self.email_verify_token != token:
            return False
        expiry = self.email_verify_sent + timedelta(hours=24)
        return timezone.now() < expiry

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"

    def is_seller(self):  return self.role == 'seller'
    def is_buyer(self):   return self.role == 'buyer'


class BuyerProfile(models.Model):
    BUSINESS_TYPE_CHOICES = [
        ('Hawker',       'Hawker / Street vendor'),
        ('Retail shop',  'Retail shop owner'),
        ('Repair shop',  'Phone repair shop'),
        ('Online seller','Online seller (WhatsApp / social media)'),
    ]

    user          = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='buyer_profile')
    location      = models.CharField(max_length=150, blank=True)
    main_supplier = models.CharField(max_length=200, blank=True)
    business_type = models.CharField(max_length=20, choices=BUSINESS_TYPE_CHOICES, blank=True)
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Buyer: {self.user.get_full_name() or self.user.username}"

    class Meta:
        ordering = ['-created_at']


class SellerProfile(models.Model):
    """
    Wholesaler store profile. Requires admin approval before going live.
    """
    APPROVAL_CHOICES = [
        ('pending',  'Pending review'),
        ('approved', 'Approved — live'),
        ('rejected', 'Rejected'),
    ]

    user              = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='seller_profile')
    store_name        = models.CharField(max_length=150)
    store_description = models.TextField(blank=True)
    location          = models.CharField(max_length=150, blank=True)
    categories        = models.JSONField(default=list, blank=True)

    # Approval flow
    approval_status   = models.CharField(max_length=10, choices=APPROVAL_CHOICES, default='pending', db_index=True)
    approval_note     = models.TextField(blank=True, help_text="Admin note shown to seller on rejection")
    approved_at       = models.DateTimeField(null=True, blank=True)

    # Legacy — kept for backwards compatibility
    is_verified       = models.BooleanField(default=False)

    created_at        = models.DateTimeField(auto_now_add=True)
    updated_at        = models.DateTimeField(auto_now=True)

    @property
    def is_live(self):
        return self.approval_status == 'approved'

    def approve(self):
        self.approval_status = 'approved'
        self.is_verified     = True
        self.approved_at     = timezone.now()
        self.save(update_fields=["approval_status", "is_verified", "approved_at"])

    def reject(self, note: str = ""):
        self.approval_status = 'rejected'
        self.approval_note   = note
        self.save(update_fields=["approval_status", "approval_note"])

    def __str__(self):
        return f"{self.store_name} [{self.approval_status}]"

    class Meta:
        ordering = ['-created_at']


class BuyerSellerRelationship(models.Model):
    """
    A buyer must be approved by a specific seller before placing orders.
    """
    STATUS_CHOICES = [
        ('pending',  'Pending approval'),
        ('approved', 'Approved'),
        ('denied',   'Denied'),
    ]

    buyer   = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='seller_relationships')
    seller  = models.ForeignKey(SellerProfile, on_delete=models.CASCADE, related_name='buyer_relationships')
    status  = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending', db_index=True)
    note    = models.TextField(blank=True)

    requested_at = models.DateTimeField(auto_now_add=True)
    resolved_at  = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('buyer', 'seller')
        ordering = ['-requested_at']

    def __str__(self):
        return f"{self.buyer} → {self.seller.store_name} [{self.status}]"

    def approve(self):
        self.status      = 'approved'
        self.resolved_at = timezone.now()
        self.save(update_fields=["status", "resolved_at"])

    def deny(self, note: str = ""):
        self.status      = 'denied'
        self.note        = note
        self.resolved_at = timezone.now()
        self.save(update_fields=["status", "note", "resolved_at"])
