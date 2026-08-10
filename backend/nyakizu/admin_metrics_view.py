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

from django.db.models import Count, DecimalField, Sum
from django.db.models.functions import Coalesce, TruncDate, TruncMonth
from django.utils import timezone
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import CustomUser, SellerProfile
from orders.models import Order, OrderStatusEvent
from products.models import Category, Product

# "Users" in every metric on this endpoint means platform members (buyers/
# sellers) — staff/superuser accounts are internal, not something the
# business dashboard should count alongside real trade participants.
MEMBER_ROLES = ["buyer", "seller"]

USER_GROWTH_DAYS = 90
GMV_TREND_MONTHS = 6
TOP_SELLERS_LIMIT = 10
CATEGORY_CHART_LIMIT = 10


def _members():
    return CustomUser.objects.filter(role__in=MEMBER_ROLES, is_staff=False, is_superuser=False)


def _gmv_total(queryset):
    return queryset.aggregate(
        total=Coalesce(
            Sum(Coalesce("final_total", "total_price")),
            Decimal("0"),
            output_field=DecimalField(),
        )
    )["total"]


def _period_metrics(since, until):
    orders_in_period = Order.objects.filter(created_at__gte=since, created_at__lt=until)
    non_cancelled = orders_in_period.exclude(status="cancelled")
    transactions = non_cancelled.count()
    volume = float(_gmv_total(non_cancelled))
    return {
        "new_users": _members().filter(date_joined__gte=since, date_joined__lt=until).count(),
        "transactions": transactions,
        "volume": volume,
        "avg_order_value": (volume / transactions) if transactions else 0.0,
    }


def _repeat_buyer_rate():
    """% of buyers (with at least one non-cancelled order) who have placed more than one."""
    buyer_order_counts = (
        Order.objects.exclude(status="cancelled")
        .values("buyer")
        .annotate(count=Count("id"))
    )
    total_buyers = len(buyer_order_counts)
    if not total_buyers:
        return 0.0
    repeat_buyers = sum(1 for row in buyer_order_counts if row["count"] > 1)
    return repeat_buyers / total_buyers * 100


DEBT_AGE_BUCKETS = [("0-7 days", 0, 7), ("8-30 days", 8, 30), ("31+ days", 31, None)]


def _debt_aging(now):
    """Outstanding balance bucketed by how long ago the order was placed."""
    orders = Order.objects.filter(status__in=["locked", "debt_active"])
    buckets = {label: Decimal("0") for label, _, _ in DEBT_AGE_BUCKETS}
    for order in orders:
        balance = order.balance
        if balance <= 0:
            continue
        age_days = (now - order.created_at).days
        for label, lo, hi in DEBT_AGE_BUCKETS:
            if age_days >= lo and (hi is None or age_days <= hi):
                buckets[label] += balance
                break
    return [{"label": label, "amount": float(amount)} for label, amount in buckets.items()]


FUNNEL_STAGES = [("submitted", "Submitted"), ("sourcing", "Sourcing"), ("locked", "Locked"), ("cleared", "Cleared")]


def _order_funnel(since):
    """How many orders (placed since `since`) ever reached each stage, via
    OrderStatusEvent rather than the order's current status."""
    reached = (
        OrderStatusEvent.objects
        .filter(order__created_at__gte=since, status__in=[s for s, _ in FUNNEL_STAGES])
        .values("status")
        .annotate(order_count=Count("order", distinct=True))
    )
    counts = {row["status"]: row["order_count"] for row in reached}
    return [{"stage": label, "orders": counts.get(stage, 0)} for stage, label in FUNNEL_STAGES]


def _user_growth_series(since, now):
    """Daily new-buyer/new-seller counts for the last USER_GROWTH_DAYS days,
    gap-filled so every day has an entry even with zero signups."""
    rows = (
        _members()
        .filter(date_joined__gte=since)
        .annotate(day=TruncDate("date_joined"))
        .values("day", "role")
        .annotate(count=Count("id"))
    )
    by_day = {}
    for row in rows:
        by_day.setdefault(row["day"], {})[row["role"]] = row["count"]

    series = []
    d = since.date()
    end = now.date()
    while d <= end:
        bucket = by_day.get(d, {})
        series.append({
            "date": d.isoformat(),
            "buyers": bucket.get("buyer", 0),
            "sellers": bucket.get("seller", 0),
        })
        d += timedelta(days=1)
    return series


def _gmv_by_month(since):
    rows = (
        Order.objects.exclude(status="cancelled")
        .filter(created_at__gte=since)
        .annotate(month=TruncMonth("created_at"))
        .values("month")
        .annotate(
            volume=Coalesce(
                Sum(Coalesce("final_total", "total_price")),
                Decimal("0"),
                output_field=DecimalField(),
            )
        )
        .order_by("month")
    )
    return [{"month": row["month"].strftime("%Y-%m"), "volume": float(row["volume"])} for row in rows]


def _top_sellers(total_gmv):
    rows = (
        Order.objects.exclude(status="cancelled")
        .exclude(seller__isnull=True)
        .values("seller__seller_profile__store_name")
        .annotate(
            order_count=Count("id"),
            revenue=Coalesce(
                Sum(Coalesce("final_total", "total_price")),
                Decimal("0"),
                output_field=DecimalField(),
            ),
        )
        .order_by("-revenue")[:TOP_SELLERS_LIMIT]
    )
    return [
        {
            "store_name": row["seller__seller_profile__store_name"] or "—",
            "order_count": row["order_count"],
            "revenue": float(row["revenue"]),
            "share_pct": round(float(row["revenue"]) / total_gmv * 100, 1) if total_gmv else 0.0,
        }
        for row in rows
    ]


def _products_by_category():
    rows = (
        Category.objects.annotate(product_count=Count("products"))
        .filter(product_count__gt=0)
        .values("name", "product_count")
        .order_by("-product_count")[:CATEGORY_CHART_LIMIT]
    )
    return [{"category": row["name"], "count": row["product_count"]} for row in rows]


class AdminMetricsView(APIView):
    """
    GET /api/admin/metrics/
    Admin only. Platform-wide totals, period-over-period rollups, and the
    chart series behind the analytics page.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        now = timezone.now()

        non_cancelled_orders = Order.objects.exclude(status="cancelled")
        gmv = _gmv_total(non_cancelled_orders)

        # Single source of truth for every seller-count breakdown shown in
        # the admin UI — previously the dashboard KPI, the users page, and
        # this endpoint each counted sellers a different way (one of them,
        # via two separately-fetched lists, silently dropped anyone in
        # "needs_info" status). Every seller row falls into exactly one of
        # these four buckets, so they always sum to total_sellers.
        seller_status_counts = dict(
            SellerProfile.objects.values_list("approval_status").annotate(count=Count("id"))
        )
        sellers_by_status = {
            "pending": seller_status_counts.get("pending", 0),
            "approved": seller_status_counts.get("approved", 0),
            "rejected": seller_status_counts.get("rejected", 0),
            "needs_info": seller_status_counts.get("needs_info", 0),
        }

        order_status_counts = dict(Order.objects.values_list("status").annotate(count=Count("id")))
        orders_by_status = {choice: order_status_counts.get(choice, 0) for choice, _ in Order.STATUS_CHOICES}

        return Response({
            # total_users = buyers + sellers only — staff/superuser accounts
            # are deliberately excluded (they're internal, not platform
            # members). total_admins is still reported separately for
            # anywhere that wants to show it, but it's never folded into
            # total_users.
            "total_users": _members().count(),
            "total_buyers": CustomUser.objects.filter(role="buyer").count(),
            "total_sellers": CustomUser.objects.filter(role="seller").count(),
            "total_admins": CustomUser.objects.filter(role="admin").count(),
            "sellers_by_status": sellers_by_status,
            "total_orders": Order.objects.count(),
            "orders_by_status": orders_by_status,
            "total_volume": float(gmv),
            "active_listings": Product.objects.filter(status="available").count(),
            "flagged_orders": Order.objects.filter(is_flagged=True).count(),
            "last_7_days": _period_metrics(now - timedelta(days=7), now),
            "previous_7_days": _period_metrics(now - timedelta(days=14), now - timedelta(days=7)),
            "last_30_days": _period_metrics(now - timedelta(days=30), now),
            "previous_30_days": _period_metrics(now - timedelta(days=60), now - timedelta(days=30)),
            "user_growth_90d": _user_growth_series(now - timedelta(days=USER_GROWTH_DAYS), now),
            "gmv_by_month": _gmv_by_month(now - timedelta(days=30 * GMV_TREND_MONTHS)),
            "top_sellers": _top_sellers(float(gmv)),
            "products_by_category": _products_by_category(),
            "repeat_buyer_rate": _repeat_buyer_rate(),
            "debt_aging": _debt_aging(now),
            "order_funnel_30d": _order_funnel(now - timedelta(days=30)),
        })
