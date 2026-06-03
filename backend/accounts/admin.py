"""
accounts/admin.py — Users, seller stores, buyer profiles, relationships.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import CustomUser, BuyerProfile, SellerProfile, BuyerSellerRelationship

# ── Admin site branding ───────────────────────────────────────────────────────

admin.site.site_header = "Nyakizu Admin"
admin.site.site_title  = "Nyakizu Digital Market"
admin.site.index_title = "Platform management"


# ── CustomUser ────────────────────────────────────────────────────────────────

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display   = ('full_name_display', 'email', 'phone_number', 'role',
                      'email_verified_badge', 'is_active', 'date_joined')
    list_filter    = ('role', 'is_active', 'is_email_verified')
    search_fields  = ('first_name', 'last_name', 'username', 'email', 'phone_number')
    ordering       = ('-date_joined',)

    fieldsets = UserAdmin.fieldsets + (
        ('Nyakizu', {
            'fields': ('role', 'phone_number', 'is_email_verified',
                       'email_verify_token', 'email_verify_sent'),
        }),
    )

    actions = ['verify_emails_action']

    @admin.display(description='Name')
    def full_name_display(self, obj):
        return obj.get_full_name() or obj.username

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
class SellerProfileAdmin(admin.ModelAdmin):
    list_display   = ('store_name', 'owner_name', 'owner_phone', 'owner_email',
                      'location', 'categories_display', 'status_badge', 'created_at')
    list_filter    = ('approval_status',)
    search_fields  = ('store_name', 'user__first_name', 'user__last_name',
                      'user__phone_number', 'user__email', 'location')
    actions        = [approve_stores, reject_stores]
    ordering       = ('approval_status', '-created_at')
    readonly_fields = ('created_at', 'updated_at', 'approved_at', 'is_live')

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
class BuyerProfileAdmin(admin.ModelAdmin):
    list_display   = ('buyer_name', 'buyer_phone', 'location', 'business_type',
                      'main_supplier', 'created_at')
    list_filter    = ('business_type',)
    search_fields  = ('user__first_name', 'user__last_name',
                      'user__phone_number', 'location')
    ordering       = ('-created_at',)

    @admin.display(description='Buyer')
    def buyer_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    @admin.display(description='Phone')
    def buyer_phone(self, obj):
        return obj.user.phone_number or '—'


# ── BuyerSellerRelationship ───────────────────────────────────────────────────

@admin.action(description='✓ Approve selected access requests')
def approve_access(modeladmin, request, queryset):
    count = 0
    for rel in queryset.filter(status='pending'):
        rel.approve()
        count += 1
    modeladmin.message_user(request, f'{count} access request(s) approved.')


@admin.register(BuyerSellerRelationship)
class BuyerSellerRelationshipAdmin(admin.ModelAdmin):
    list_display  = ('buyer_name', 'store_name', 'status_badge', 'requested_at', 'resolved_at')
    list_filter   = ('status',)
    search_fields = ('buyer__first_name', 'buyer__last_name', 'seller__store_name')
    ordering      = ('-requested_at',)
    actions       = [approve_access]

    @admin.display(description='Buyer')
    def buyer_name(self, obj):
        return obj.buyer.get_full_name() or obj.buyer.username

    @admin.display(description='Store')
    def store_name(self, obj):
        return obj.seller.store_name

    @admin.display(description='Status')
    def status_badge(self, obj):
        styles = {
            'approved': ('background:#dcfce7;color:#15803d', '✓ Approved'),
            'pending':  ('background:#fef9c3;color:#a16207', '⏳ Pending'),
            'denied':   ('background:#fee2e2;color:#b91c1c', '✗ Denied'),
        }
        style, label = styles.get(obj.status, ('', obj.status))
        return format_html(
            '<span style="display:inline-block;padding:2px 10px;border-radius:999px;'
            'font-size:12px;font-weight:600;{}">{}</span>', style, label
        )
