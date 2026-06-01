"""
Root URL configuration for the Nyakizu backend.

All API routes are prefixed with /api/ so they're easy to
distinguish from any admin or other paths.
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Django admin panel — useful for managing data during development
    path('admin/', admin.site.urls),

    # App-level routes — each app manages its own URL patterns
    path('api/accounts/', include('accounts.urls')),
    path('api/products/', include('products.urls')),
    path('api/orders/', include('orders.urls')),
]
