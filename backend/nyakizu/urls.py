"""
Root URL configuration for the Nyakizu backend.

All API routes are prefixed with /api/ so they're easy to
distinguish from any admin or other paths.
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

from .admin_metrics_view import AdminMetricsView

urlpatterns = [
    # Django admin panel — useful for managing data during development
    path('admin/', admin.site.urls),

    # django-allauth — handles Google OAuth2 at /accounts/google/login/
    path('accounts/', include('allauth.urls')),

    # App-level REST API routes
    path('api/accounts/', include('accounts.urls')),
    path('api/products/', include('products.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/admin/metrics/', AdminMetricsView.as_view(), name='admin-metrics'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
