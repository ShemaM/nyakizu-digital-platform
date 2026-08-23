"""
Root URL configuration for the Nyakizu backend.

All API routes are prefixed with /api/ so they're easy to
distinguish from any admin or other paths.
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from .admin_metrics_view import AdminMetricsView
from .csrf_view import CsrfCookieView

urlpatterns = [
    # Django admin panel — useful for managing data during development
    path('admin/', admin.site.urls),

    # django-allauth — handles Google OAuth2 at /accounts/google/login/
    path('accounts/', include('allauth.urls')),

    # App-level REST API routes
    path('api/csrf/', CsrfCookieView.as_view(), name='csrf'),
    path('api/accounts/', include('accounts.urls')),
    path('api/products/', include('products.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/admin/metrics/', AdminMetricsView.as_view(), name='admin-metrics'),

    # API docs — raw OpenAPI schema plus a browsable Swagger UI over it.
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='docs'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
