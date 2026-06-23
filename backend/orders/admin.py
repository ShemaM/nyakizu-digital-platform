"""Register orders models in the Django admin panel."""

from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    """Show OrderItems inline inside the Order detail page."""
    model = OrderItem
    extra = 0   # don't show empty rows
    readonly_fields = ('subtotal',)

    def subtotal(self, obj):
        return obj.subtotal()


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'buyer', 'status', 'total_price', 'created_at')
    list_filter = ('status',)
    search_fields = ('buyer__username',)
    inlines = [OrderItemInline]
