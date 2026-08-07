"""
accounts/admin.py — Users, seller stores, buyer profiles, relationships.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from unfold.admin import ModelAdmin
from .models import (
    CustomUser, BuyerProfile, SellerProfile, BuyerStoreFollow,
    BuyerSellerRelationship,
)

# ── Admin site branding ───────────────────────────────────────────────────────

admin.site.site_header = "Nyakizu Digital Marketplace"
admin.site.site_title  = "Nyakizu Digital"
admin.site.index_title = "Platform Management"


# ── CustomUser ────────────────────────────────────────────────────────────────

@admin.register(CustomUser)
class CustomUserAdmin(ModelAdmin, UserAdmin):
    list_display   = ('full_name_display', 'email', 'phone_number', 'role_badge',
                      'email_verified_badge', 'is_active', 'date_joined')
    list_filter    = ('role', 'is_active', 'is_email_verified')
    search_fields  = ('first_name', 'last_name', 'username', 'email', 'phone_number')
    ordering       = ('-date_joined',)

    fieldsets = UserAdmin.fieldsets + (
        ('Nyakizu', {
            'fields': ('role', 'phone_number', 'avatar', 'is_email_verified',
                       'email_verify_token', 'email_verify_sent'),
        }),
    )

    actions = ['verify_emails_action']

    @admin.display(description='Name')
    def full_name_display(self, obj):
        return obj.get_full_name() or obj.username

    # Role is a category, not a status — colors mirror the buyer/seller/admin
    # role-accent system used across the platform's frontend (not the
    # green/yellow/red used for order status elsewhere in this admin), so an
    # "admin" row doesn't visually read as an error state.
    _ROLE_STYLES = {
        'buyer':  ('background:#eff6ff;color:#1d4ed8', 'Buyer'),
        'seller': ('background:#f5f3ff;color:#6d28d9', 'Seller'),
        'admin':  ('background:#f4f1ea;color:#44403c', 'Admin'),
    }

    @admin.display(description='Role', ordering='role')
    def role_badge(self, obj):
        style, label = self._ROLE_STYLES.get(obj.role, ('', obj.role))
        return format_html(
            '<span style="display:inline-block;padding:2px 10px;border-radius:999px;'
            'font-size:12px;font-weight:600;{}">{}</span>', style, label
        )

    @admin.display(description='Email verified', boolean=True)
    def email_verified_badge(self, obj):
        return obj.is_email_verified

    @admin.action(description='✓ Mark selected users as email-verified')
    def verify_emails_action(self, request, queryset):
        updated = queryset.update(is_email_verified=True, email_verify_token='')
        self.message_user(request, f'{updated} user(s) marked as email-verified.')


# ── Seller approval actions ───────────────────────────────────────────────────

@admin.action(description='✓ Approve selected stores')
def approve_stores(modeladmin, request, queryset):
    count = 0
    for store in queryset.filter(approval_status='pending'):
        store.approve()
        count += 1
    modeladmin.message_user(
        request,
        f'{count} store{"s" if count != 1 else ""} approved and now live.',
    )


@admin.action(description='✗ Reject selected stores')
def reject_stores(modeladmin, request, queryset):
    count = 0
    for store in queryset.exclude(approval_status='rejected'):
        store.reject(note='Rejected from bulk admin action.')
        count += 1
    modeladmin.message_user(request, f'{count} store(s) rejected.')


# ── SellerProfile ─────────────────────────────────────────────────────────────

@admin.register(SellerProfile)
class SellerProfileAdmin(ModelAdmin):
    list_display   = ('store_name', 'owner_name', 'owner_phone', 'owner_email',
                      'location', 'categories_display', 'status_badge', 'created_at')
    list_filter    = ('approval_status',)
    search_fields  = ('store_name', 'user__first_name', 'user__last_name',
                      'user__phone_number', 'user__email', 'location')
    actions        = [approve_stores, reject_stores]
    ordering       = ('approval_status', '-created_at')
    readonly_fields = ('created_at', 'updated_at', 'approved_at', 'is_live')
    list_select_related = ('user',)

    fieldsets = (
        ('Store details', {
            'fields': ('user', 'store_name', 'store_description', 'location', 'categories'),
        }),
        ('Approval', {
            'fields': ('approval_status', 'approval_note', 'approved_at', 'is_live'),
            'description': (
                'Use "Approve selected stores" bulk action, or change approval_status '
                'directly and save. Approved stores are visible to buyers.'
            ),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    @admin.display(description='Owner')
    def owner_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    @admin.display(description='Phone')
    def owner_phone(self, obj):
        return obj.user.phone_number or '—'

    @admin.display(description='Email')
    def owner_email(self, obj):
        return obj.user.email or '—'

    @admin.display(description='Categories')
    def categories_display(self, obj):
        cats = obj.categories or []
        if not cats:
            return format_html('<span style="color:#9ca3af">None</span>')
        preview = ', '.join(cats[:3])
        return preview + (f' +{len(cats) - 3} more' if len(cats) > 3 else '')

    @admin.display(description='Status', ordering='approval_status')
    def status_badge(self, obj):
        styles = {
            'approved': ('background:#dcfce7;color:#15803d', '✓ Approved'),
            'pending':  ('background:#fef9c3;color:#a16207', '⏳ Pending'),
            'rejected': ('background:#fee2e2;color:#b91c1c', '✗ Rejected'),
        }
        style, label = styles.get(obj.approval_status, ('', obj.approval_status))
        return format_html(
            '<span style="display:inline-block;padding:2px 10px;border-radius:999px;'
            'font-size:12px;font-weight:600;{}">{}</span>', style, label
        )


# ── BuyerProfile ──────────────────────────────────────────────────────────────

@admin.register(BuyerProfile)
class BuyerProfileAdmin(ModelAdmin):
    list_display   = ('buyer_name', 'buyer_phone', 'location', 'business_type',
                      'main_supplier', 'created_at')
    list_filter    = ('business_type',)
    search_fields  = ('user__first_name', 'user__last_name',
                      'user__phone_number', 'location')
    ordering       = ('-created_at',)
    list_select_related = ('user',)

    @admin.display(description='Buyer')
    def buyer_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    @admin.display(description='Phone')
    def buyer_phone(self, obj):
        return obj.user.phone_number or '—'


# ── Buyer Store Follows ───────────────────────────────────────────────────────

@admin.register(BuyerStoreFollow)
class BuyerStoreFollowAdmin(ModelAdmin):
    list_display = (
        'buyer_name',
        'store_name',
        'created_at',
    )

    search_fields = (
        'buyer__first_name',
        'buyer__last_name',
        'buyer__email',
        'seller__store_name',
    )

    ordering = ('-created_at',)
    list_select_related = ('buyer', 'seller')

    @admin.display(description='Buyer')
    def buyer_name(self, obj):
        return obj.buyer.get_full_name() or obj.buyer.username

    @admin.display(description='Store')
    def store_name(self, obj):
        return obj.seller.store_name


# ── Buyer-Seller Relationships ────────────────────────────────────────────────

@admin.register(BuyerSellerRelationship)
class BuyerSellerRelationshipAdmin(ModelAdmin):
    list_display  = ('buyer_name', 'store_name', 'status', 'requested_at', 'resolved_at')
    list_filter   = ('status',)
    search_fields = ('buyer__first_name', 'buyer__last_name', 'buyer__email',
                      'seller__store_name')
    ordering      = ('-requested_at',)
    list_select_related = ('buyer', 'seller')

    @admin.display(description='Buyer')
    def buyer_name(self, obj):
        return obj.buyer.get_full_name() or obj.buyer.username

    @admin.display(description='Store')
    def store_name(self, obj):
        return obj.seller.store_name
