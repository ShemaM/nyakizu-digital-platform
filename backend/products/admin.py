"""Register products models in the Django admin panel."""

from django.contrib import admin
from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}   # auto-fill slug from name


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'seller', 'category', 'price', 'stock_quantity', 'status', 'created_at')
    list_filter = ('status', 'category')
    search_fields = ('name', 'seller__username')
