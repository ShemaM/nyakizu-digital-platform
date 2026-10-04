"""
billing/admin.py — the fee schedule, seller balances, and the record of
Daraja M-Pesa top-ups, per-order fees and every credit movement.

A seller's credit can't be edited directly: staff use the "Adjust credit" field
on the account page, which requires a reason and writes a ledger entry.
"""

from django import forms
from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html
from unfold.admin import ModelAdmin

from .models import CreditEntry, FeeSchedule, OrderFee, Payment, SellerAccount
from .services import apply_credit_change, enforcement_level


class ViewOnlyAdmin(ModelAdmin):
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(FeeSchedule)
class FeeScheduleAdmin(ModelAdmin):
    list_display = ("rate_percent", "round_to_kes", "min_fee_kes", "max_fee_kes", "free_orders_allowance", "is_active", "updated_at")
    list_filter = ("is_active",)


class SellerAccountForm(forms.ModelForm):
    adjust_credit_by = forms.DecimalField(
        required=False, max_digits=10, decimal_places=2,
        help_text="Add (positive) or remove (negative) credit, in KES. For example after a seller pays you outside the app.",
    )
    adjust_reason = forms.CharField(
        required=False, max_length=255,
        help_text="Required with an adjustment. Shown to the seller on their statement.",
    )

    class Meta:
        model = SellerAccount
        fields = "__all__"

    def clean(self):
        cleaned = super().clean()
        amount = cleaned.get("adjust_credit_by")
        if amount and not (cleaned.get("adjust_reason") or "").strip():
            self.add_error("adjust_reason", "Say why you are adjusting this seller's credit.")
        return cleaned


@admin.register(SellerAccount)
class SellerAccountAdmin(ModelAdmin):
    form = SellerAccountForm
    # "Enforcement now" is worked out from credit_kes/debt_since, so it's
    # always right even between the times something actually re-evaluates it.
    list_display = (
        "store_name", "account_number", "credit_kes", "enforcement_now",
        "free_orders_used", "debt_since",
    )
    list_filter = ("debt_since",)
    search_fields = (
        "account_number", "seller__store_name",
        "seller__user__email", "seller__user__phone_number",
    )
    list_select_related = ("seller",)
    ordering = ("-created_at",)
    readonly_fields = ("account_number", "credit_kes", "debt_since", "ledger_link", "created_at", "updated_at")

    def get_readonly_fields(self, request, obj=None):
        fields = super().get_readonly_fields(request, obj)
        # The seller a SellerAccount belongs to is picked once, when it is created.
        return (*fields, "seller") if obj else fields

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        amount = form.cleaned_data.get("adjust_credit_by")
        if amount:
            apply_credit_change(
                obj, amount, "adjustment",
                note=form.cleaned_data["adjust_reason"].strip(), user=request.user,
            )

    @admin.display(description="Store", ordering="seller__store_name")
    def store_name(self, obj):
        return obj.seller.store_name

    @admin.display(description="Enforcement now")
    def enforcement_now(self, obj):
        return enforcement_level(obj)

    @admin.display(description="Ledger")
    def ledger_link(self, obj):
        if not obj.pk:
            return "—"
        url = f"{reverse('admin:billing_creditentry_changelist')}?q={obj.account_number}"
        return format_html('<a href="{}">See every credit movement for {}</a>', url, obj.account_number)


@admin.register(CreditEntry)
class CreditEntryAdmin(ViewOnlyAdmin):
    list_display = ("created_at", "account_number", "kind", "amount_kes", "balance_after_kes", "order_fee", "created_by")
    list_filter = ("kind",)
    search_fields = ("account_number", "note")
    date_hierarchy = "created_at"


@admin.register(OrderFee)
class OrderFeeAdmin(ViewOnlyAdmin):
    list_display = ("order", "amount_kes", "status", "charged_at", "refunded_at")
    list_filter = ("status",)
    search_fields = ("order__id",)


@admin.register(Payment)
class PaymentAdmin(ViewOnlyAdmin):
    list_display = ("reference", "amount_kes", "phone", "status", "store_name", "created_at")
    list_filter = ("status",)
    search_fields = ("reference", "phone", "account__seller__store_name")
    list_select_related = ("account__seller",)
    date_hierarchy = "created_at"

    @admin.display(description="Store")
    def store_name(self, obj):
        return obj.account.seller.store_name if obj.account else "—"
