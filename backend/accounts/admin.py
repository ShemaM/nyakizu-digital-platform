"""Register accounts models in the Django admin panel."""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, SellerProfile


# Extend the default UserAdmin to show our extra fields
@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    # Columns shown in the user list
    list_display = ('username', 'email', 'role', 'phone_number', 'is_active')
    list_filter = ('role', 'is_active')

    # Add 'role' and 'phone_number' to the edit form
    fieldsets = UserAdmin.fieldsets + (
        ('Nyakizu Fields', {'fields': ('role', 'phone_number')}),
    )


@admin.register(SellerProfile)
class SellerProfileAdmin(admin.ModelAdmin):
    list_display = ('store_name', 'user', 'location', 'is_verified', 'created_at')
    list_filter = ('is_verified',)
    search_fields = ('store_name', 'user__username')
