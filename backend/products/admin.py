"""products/admin.py — Categories and product catalog."""

from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin, TabularInline
from .models import AttributeValue, Category, CategoryAttribute, Product


class AttributeValueInline(TabularInline):
    model = AttributeValue
    extra = 1


@admin.register(CategoryAttribute)
class CategoryAttributeAdmin(ModelAdmin):
    list_display  = ('name', 'category', 'value_count')
    list_filter   = ('category',)
    search_fields = ('name', 'category__name')
    inlines       = [AttributeValueInline]

    @admin.display(description='Values')
    def value_count(self, obj):
        return obj.values.count()


class CategoryAttributeInline(TabularInline):
    model = CategoryAttribute
    extra = 1
    show_change_link = True


@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display        = ('name', 'slug', 'product_count', 'attribute_count')
    prepopulated_fields = {'slug': ('name',)}
    search_fields       = ('name',)
    inlines             = [CategoryAttributeInline]

    @admin.display(description='Products')
    def product_count(self, obj):
        return obj.products.count()

    @admin.display(description='Attributes')
    def attribute_count(self, obj):
        return obj.attributes.count()


@admin.action(description='Mark selected products as Available')
def make_available(modeladmin, request, queryset):
    updated = queryset.update(status='available')
    modeladmin.message_user(request, f'{updated} product(s) marked as available.')


@admin.action(description='Mark selected products as Out of Stock')
def make_out_of_stock(modeladmin, request, queryset):
    updated = queryset.update(status='out_of_stock')
    modeladmin.message_user(request, f'{updated} product(s) marked as out of stock.')


@admin.register(Product)
class ProductAdmin(ModelAdmin):
    list_display   = ('name', 'seller_store', 'category', 'price_display',
                      'stock_quantity', 'status_badge', 'created_at')
    list_filter    = ('status', 'category', 'seller__seller_profile__approval_status')
    search_fields  = ('name', 'description', 'seller__username',
                      'seller__seller_profile__store_name')
    list_editable  = ('stock_quantity',)
    ordering       = ('-created_at',)
    actions        = [make_available, make_out_of_stock]
    list_select_related = ('category', 'seller', 'seller__seller_profile')

    fieldsets = (
        ('Product details', {
            'fields': ('seller', 'category', 'name', 'description'),
        }),
        ('Pricing & inventory', {
            'fields': ('price', 'stock_quantity', 'status', 'image'),
        }),
    )

    @admin.display(description='Store')
    def seller_store(self, obj):
        try:
            return obj.seller.seller_profile.store_name
        except Exception:
            return obj.seller.username

    @admin.display(description='Price')
    def price_display(self, obj):
        return f'KES {obj.price:,.0f}'

    @admin.display(description='Status', ordering='status')
    def status_badge(self, obj):
        styles = {
            'available':    ('background:#dcfce7;color:#15803d', 'Available'),
            'out_of_stock': ('background:#fee2e2;color:#b91c1c', 'Out of stock'),
            'draft':        ('background:#f1f5f9;color:#475569', 'Draft'),
        }
        style, label = styles.get(obj.status, ('', obj.status))
        return format_html(
            '<span style="display:inline-block;padding:2px 10px;border-radius:999px;'
            'font-size:12px;font-weight:600;{}">{}</span>', style, label
        )
