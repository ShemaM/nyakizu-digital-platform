"""
accounts/admin.py

Admin configuration for users, buyer profiles, and seller profiles.

To approve a seller:
  1. Click "Seller profiles" in the left menu.
  2. Tick the checkbox next to one or more pending sellers.
  3. Choose "Approve selected sellers" from the Action dropdown.
  4. Click "Go".
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import CustomUser, BuyerProfile, SellerProfile

# ── Admin site branding ───────────────────────────────────────────────────────

admin.site.site_header = "Nyakizu Admin"
admin.site.site_title  = "Nyakizu Digital Market"
admin.site.index_title = "Platform management"


# ── CustomUser ────────────────────────────────────────────────────────────────

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display  = ('full_name_display', 'phone_number', 'role', 'is_active', 'date_joined')
    list_filter   = ('role', 'is_active')
    search_fields = ('first_name', 'last_name', 'username', 'phone_number')
    ordering      = ('-date_joined',)

    fieldsets = UserAdmin.fieldsets + (
        ('Nyakizu fields', {'fields': ('role', 'phone_number')}),
    )

    @admin.display(description='Name')
    def full_name_display(self, obj):
        return obj.get_full_name() or obj.username


# ── Seller approval action ────────────────────────────────────────────────────

@admin.action(description='✓  Approve selected sellers')
def approve_sellers(modeladmin, request, queryset):
    """
    Bulk action: tick one or more sellers and choose this action to approve them.
    Approved sellers appear in buyer searches and can receive orders.
    """
    updated = queryset.filter(is_verified=False).update(is_verified=True)
    modeladmin.message_user(
        request,
        f'{updated} seller{"s" if updated != 1 else ""} approved successfully. '
        'They can now receive orders from buyers.',
    )


# ── SellerProfile ─────────────────────────────────────────────────────────────

@admin.register(SellerProfile)
class SellerProfileAdmin(admin.ModelAdmin):
    list_display  = ('store_name', 'owner_name', 'owner_phone', 'location', 'categories_display', 'status_badge', 'created_at')
    list_filter   = ('is_verified',)
    search_fields = ('store_name', 'user__first_name', 'user__last_name', 'user__phone_number', 'location')
    actions       = [approve_sellers]
    # Show pending (unverified) sellers at the top so they are easy to find
    ordering      = ('is_verified', '-created_at')

    # Directly toggle verification status from the list (saves opening each record)
    list_editable = ('is_verified',) if False else ()   # kept off; bulk action is cleaner

    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Shop details', {
            'fields': ('user', 'store_name', 'store_description', 'location', 'categories'),
        }),
        ('Verification', {
            'fields': ('is_verified',),
            'description': (
                'Tick "Is verified" and save to approve this seller. '
                'Or use the bulk action to approve multiple sellers at once.'
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

    @admin.display(description='Categories')
    def categories_display(self, obj):
        cats = obj.categories
        if not cats:
            return format_html('<span style="color:#9ca3af">None selected</span>')
        return ', '.join(cats[:3]) + (f' +{len(cats) - 3} more' if len(cats) > 3 else '')

    @admin.display(description='Status', ordering='is_verified')
    def status_badge(self, obj):
        if obj.is_verified:
            return format_html(
                '<span style="display:inline-flex;align-items:center;gap:4px;'
                'padding:2px 10px;border-radius:999px;background:#dcfce7;'
                'color:#15803d;font-size:12px;font-weight:600">✓ Approved</span>'
            )
        return format_html(
            '<span style="display:inline-flex;align-items:center;gap:4px;'
            'padding:2px 10px;border-radius:999px;background:#fef9c3;'
            'color:#a16207;font-size:12px;font-weight:600">⏳ Pending</span>'
        )


# ── BuyerProfile ──────────────────────────────────────────────────────────────

@admin.register(BuyerProfile)
class BuyerProfileAdmin(admin.ModelAdmin):
    list_display  = ('buyer_name', 'buyer_phone', 'location', 'business_type', 'main_supplier', 'created_at')
    list_filter   = ('business_type',)
    search_fields = ('user__first_name', 'user__last_name', 'user__phone_number', 'location')
    ordering      = ('-created_at',)

    @admin.display(description='Buyer')
    def buyer_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    @admin.display(description='Phone')
    def buyer_phone(self, obj):
        return obj.user.phone_number or '—'
