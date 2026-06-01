"""Register accounts models in the Django admin panel."""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, BuyerProfile, SellerProfile


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'get_full_name', 'role', 'phone_number', 'is_active', 'date_joined')
    list_filter = ('role', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Nyakizu Fields', {'fields': ('role', 'phone_number')}),
    )


@admin.register(BuyerProfile)
class BuyerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'location', 'business_type', 'main_supplier', 'created_at')
    list_filter = ('business_type',)
    search_fields = ('user__first_name', 'user__last_name', 'user__username', 'location')


@admin.register(SellerProfile)
class SellerProfileAdmin(admin.ModelAdmin):
    list_display = ('store_name', 'user', 'location', 'is_verified', 'created_at')
    list_filter = ('is_verified',)
    search_fields = ('store_name', 'user__username')
