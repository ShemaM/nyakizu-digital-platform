"""
nyakizu/admin_metrics_view.py

JSON metrics feed for the frontend admin dashboard/analytics pages
(GET /api/admin/metrics/). Mirrors the aggregation logic in
admin_dashboard.py (the server-rendered Django admin dashboard) but as
a small REST payload so the Next.js admin UI never has to show
fabricated placeholder numbers.
"""

from datetime import timedelta
from decimal import Decimal

from django.db.models import DecimalField, Sum
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import CustomUser
from orders.models import Order
from products.models import Product


def _period_metrics(since, now):
    orders_in_period = Order.objects.filter(created_at__gte=since, created_at__lte=now)
    non_cancelled = orders_in_period.exclude(status="cancelled")
    volume = non_cancelled.aggregate(
        total=Coalesce(
            Sum(Coalesce("final_total", "total_price")),
            Decimal("0"),
            output_field=DecimalField(),
        )
    )["total"]
    return {
        "new_users": CustomUser.objects.filter(date_joined__gte=since, date_joined__lte=now).count(),
        "transactions": non_cancelled.count(),
        "volume": float(volume),
    }


class AdminMetricsView(APIView):
    """
    GET /api/admin/metrics/
    Admin only. Platform-wide totals plus 7/30-day rollups for the
    admin analytics page.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        now = timezone.now()

        gmv = Order.objects.exclude(status="cancelled").aggregate(
            total=Coalesce(
                Sum(Coalesce("final_total", "total_price")),
                Decimal("0"),
                output_field=DecimalField(),
            )
        )["total"]

        return Response({
            "total_users": CustomUser.objects.count(),
            "total_buyers": CustomUser.objects.filter(role="buyer").count(),
            "total_sellers": CustomUser.objects.filter(role="seller").count(),
            "total_orders": Order.objects.count(),
            "total_volume": float(gmv),
            "active_listings": Product.objects.filter(status="available").count(),
            "last_7_days": _period_metrics(now - timedelta(days=7), now),
            "last_30_days": _period_metrics(now - timedelta(days=30), now),
        })
