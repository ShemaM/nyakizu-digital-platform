"""Register orders models in the Django admin panel."""

from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline
from .models import Order, OrderItem, OrderStatusEvent


class OrderItemInline(TabularInline):
    """Show OrderItems inline inside the Order detail page."""
    model = OrderItem
    extra = 0   # don't show empty rows
    readonly_fields = ('subtotal',)

    def subtotal(self, obj):
        # obj.pk is None for the blank "add another" template row rendered by
        # the admin's inline-formset JS — unit_price is None there, so guard.
        if obj.pk is None or obj.unit_price is None:
            return '—'
        return obj.subtotal()


class OrderStatusEventInline(TabularInline):
    """Read-only per-order status timeline — append-only audit log."""
    model = OrderStatusEvent
    extra = 0
    can_delete = False
    fields = ('status', 'created_at')
    readonly_fields = ('status', 'created_at')

    def has_add_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(Order)
class OrderAdmin(ModelAdmin):
    list_display = ('id', 'buyer', 'status', 'total_price', 'created_at')
    list_filter = ('status',)
    search_fields = ('buyer__username',)
    list_select_related = ('buyer',)
    inlines = [OrderItemInline, OrderStatusEventInline]


@admin.register(OrderStatusEvent)
class OrderStatusEventAdmin(ModelAdmin):
    """Append-only audit log — browsable, but not editable/creatable here."""
    list_display  = ('order', 'status', 'created_at')
    list_filter   = ('status',)
    search_fields = ('order__id', 'order__buyer__username')
    ordering      = ('-created_at',)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
