"""
nyakizu/admin_dashboard.py

Data feed for the custom Django admin dashboard (django-unfold's
UNFOLD["DASHBOARD_CALLBACK"]). Aggregates everything an admin needs to
know about the platform at a glance — members, sellers, orders, GMV,
debts, catalog, flags — for the admin homepage at /admin/.

Wired in via templates/admin/index.html, which is a fully custom page
(not unfold's stock component templates) reading the context keys this
module injects. Every KPI is pre-formatted here, including its
empty-state message, so the template never has to decide how to display
a bare "0" — see _kpi().
"""

import json
from datetime import timedelta
from decimal import Decimal

from django.db.models import Count, DecimalField, Sum
from django.db.models.functions import Coalesce, TruncDate, TruncMonth
from django.templatetags.static import static
from django.urls import reverse
from django.utils import timezone

from accounts.models import CustomUser, SellerProfile
from orders.models import Order, OrderStatusEvent
from products.models import Category, Product


def favicon_ico_url(request=None):
    """UNFOLD["SITE_FAVICONS"] href — resolved via `static()` (not a hardcoded
    path) so it still works once collectstatic hashes the filename in prod."""
    return static("admin/favicon.ico")


def favicon_png_url(request=None):
    return static("admin/favicon-192.png")


GROWTH_DAYS = 90
GMV_TREND_MONTHS = 6
TOP_SELLERS_LIMIT = 10
CATEGORY_CHART_LIMIT = 10
VALID_PERIODS = {7: "Last 7 days", 30: "Last 30 days", 90: "Last 90 days"}
DEFAULT_PERIOD = 30

MEMBER_ROLES = ["buyer", "seller"]


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


def _pct_change(current, previous):
    """Returns (direction, formatted_pct) or (None, None) when there's no
    meaningful baseline to compare against — a flat 0% would misleadingly
    imply "no change" when there's actually no prior-period data at all."""
    if previous == 0:
        if current == 0:
            return None, None
        return "up", "New"
    pct = (float(current) - float(previous)) / float(previous) * 100
    if abs(pct) < 0.5:
        return "flat", "No change"
    return ("up" if pct > 0 else "down"), f"{abs(pct):.0f}%"


def _kpi(key, label, value, *, icon, href=None, empty_message=None, display=None,
         tone="neutral", trend=None, suffix=""):
    """
    Builds one KPI card's worth of context. `display` overrides the default
    "{value}{suffix}" formatting (e.g. for currency). `empty_message`
    replaces that display entirely when value == 0 — the dashboard never
    renders a bare "0", per the "don't show 0" requirement: a metric being
    zero is either good news (no debts, nothing flagged) or a call to
    action (no pending approvals) and reads better as a sentence than a
    number.
    """
    is_empty = value == 0 and empty_message is not None
    direction, trend_display = trend if trend else (None, None)
    return {
        "key": key,
        "label": label,
        "icon": icon,
        "href": href,
        "is_empty": is_empty,
        "display": empty_message if is_empty else (display or f"{value:,}{suffix}"),
        "tone": "neutral" if is_empty else tone,
        "trend_direction": direction,
        "trend_display": trend_display,
    }


def _daily_series(queryset, date_field, since, now, group_field=None):
    values_fields = ["day"] + ([group_field] if group_field else [])
    rows = (
        queryset
        .filter(**{f"{date_field}__gte": since})
        .annotate(day=TruncDate(date_field))
        .values(*values_fields)
        .annotate(count=Count("id"))
        .order_by("day")
    )
    by_day = {}
    for row in rows:
        day = row["day"]
        key = row[group_field] if group_field else "count"
        by_day.setdefault(day, {})[key] = row["count"]

    days = []
    d = since.date()
    end = now.date()
    while d <= end:
        days.append(d)
        d += timedelta(days=1)
    return days, by_day


def _user_growth_chart(since, now):
    days, by_day = _daily_series(_members(), "date_joined", since, now, group_field="role")
    labels = [d.strftime("%b %d") for d in days]
    buyers = [by_day.get(d, {}).get("buyer", 0) for d in days]
    sellers = [by_day.get(d, {}).get("seller", 0) for d in days]
    return json.dumps({
        "labels": labels,
        "datasets": [
            {"label": "Buyers", "data": buyers, "borderColor": "#2563eb", "backgroundColor": "#2563eb", "tension": 0.3},
            {"label": "Sellers", "data": sellers, "borderColor": "#7c3aed", "backgroundColor": "#7c3aed", "tension": 0.3},
        ],
    })


def _orders_by_status_chart():
    counts = dict(Order.objects.values_list("status").annotate(count=Count("id")))
    colors = {
        "submitted": "#f59e0b", "sourcing": "#2563eb", "locked": "#64748b",
        "debt_active": "#dc2626", "cleared": "#16a34a", "cancelled": "#cbd5e1",
    }
    rows = [(label, counts.get(choice, 0), colors[choice]) for choice, label in Order.STATUS_CHOICES]
    rows = [r for r in rows if r[1] > 0]
    return json.dumps({
        "labels": [r[0] for r in rows],
        "datasets": [{"data": [r[1] for r in rows], "backgroundColor": [r[2] for r in rows]}],
    })


def _gmv_by_month_chart(since):
    rows = (
        Order.objects.exclude(status="cancelled")
        .filter(created_at__gte=since)
        .annotate(month=TruncMonth("created_at"))
        .values("month")
        .annotate(volume=Coalesce(Sum(Coalesce("final_total", "total_price")), Decimal("0"), output_field=DecimalField()))
        .order_by("month")
    )
    return json.dumps({
        "labels": [row["month"].strftime("%b %Y") for row in rows],
        "datasets": [{"label": "GMV (KES)", "data": [float(row["volume"]) for row in rows], "backgroundColor": "#2563eb"}],
    })


def _repeat_buyer_rate():
    """% of buyers (with at least one non-cancelled order) who have placed
    more than one — a wholesaler cares about this separately from raw order
    count because it's the number that tells them whether buyers are
    actually coming back, not just whether the platform is getting orders."""
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


def _debt_aging_chart(now):
    """
    Buckets every order's outstanding balance by how long ago it was
    placed. A single "total debt" KPI can't distinguish a wholesaler with
    KES 50,000 owed from last week (normal, still being collected) from
    the same total owed from a month ago (a real collection problem) —
    this splits it apart.
    """
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
    return json.dumps({
        "labels": list(buckets.keys()),
        "datasets": [{
            "label": "Outstanding debt (KES)",
            "data": [float(v) for v in buckets.values()],
            "backgroundColor": ["#fbbf24", "#f97316", "#dc2626"],
        }],
    })


FUNNEL_STAGES = [("submitted", "Submitted"), ("sourcing", "Sourcing"), ("locked", "Locked"), ("cleared", "Cleared")]


def _order_funnel_chart(since):
    """
    How many orders (placed in the selected period) ever reached each
    stage — via OrderStatusEvent, not the order's *current* status, so an
    order that's already `cleared` still counts toward "Submitted" and
    "Locked" instead of only showing up in the last stage it reached.
    """
    reached = (
        OrderStatusEvent.objects
        .filter(order__created_at__gte=since, status__in=[s for s, _ in FUNNEL_STAGES])
        .values("status")
        .annotate(order_count=Count("order", distinct=True))
    )
    counts = {row["status"]: row["order_count"] for row in reached}
    return json.dumps({
        "labels": [label for _, label in FUNNEL_STAGES],
        "datasets": [{
            "label": "Orders reaching this stage",
            "data": [counts.get(stage, 0) for stage, _ in FUNNEL_STAGES],
            "backgroundColor": "#2563eb",
        }],
    })


def _category_chart():
    rows = list(
        Category.objects.annotate(product_count=Count("products"))
        .filter(product_count__gt=0)
        .values("name", "product_count")
        .order_by("-product_count")[:CATEGORY_CHART_LIMIT]
    )
    return json.dumps({
        "labels": [row["name"] for row in rows],
        "datasets": [{"label": "Products", "data": [row["product_count"] for row in rows], "backgroundColor": "#7c3aed"}],
    })


def pending_sellers_badge(request):
    """Sidebar badge — always a non-empty string, unfold renders literal
    "None" text if this ever returns None."""
    return str(SellerProfile.objects.filter(approval_status="pending").count())


def dashboard_callback(request, context):
    now = timezone.now()

    try:
        period = int(request.GET.get("period", DEFAULT_PERIOD))
    except (TypeError, ValueError):
        period = DEFAULT_PERIOD
    if period not in VALID_PERIODS:
        period = DEFAULT_PERIOD

    since = now - timedelta(days=period)
    previous_since = now - timedelta(days=period * 2)

    non_cancelled = Order.objects.exclude(status="cancelled")
    current_orders = non_cancelled.filter(created_at__gte=since)
    previous_orders = non_cancelled.filter(created_at__gte=previous_since, created_at__lt=since)

    gmv_total = _gmv_total(non_cancelled)
    gmv_current = _gmv_total(current_orders)
    gmv_previous = _gmv_total(previous_orders)

    members_current = _members().filter(date_joined__gte=since).count()
    members_previous = _members().filter(date_joined__gte=previous_since, date_joined__lt=since).count()

    seller_status_counts = dict(SellerProfile.objects.values_list("approval_status").annotate(c=Count("id")))
    pending_sellers_count = seller_status_counts.get("pending", 0)

    # Computed in Python via Order.balance (not a DB-level aggregate) so it
    # exactly matches the model's own fallback logic — final_total is
    # nullable, and a raw SQL Sum(final_total - amount_paid) would silently
    # drop any order that hasn't been priced yet instead of falling back to
    # total_price like .balance does.
    debt_balances = [o.balance for o in Order.objects.filter(status__in=["locked", "debt_active"])]
    debt_total = sum(debt_balances, Decimal("0"))
    debt_orders_with_balance = sum(1 for b in debt_balances if b > 0)

    flagged_count = Order.objects.filter(is_flagged=True).count()
    out_of_stock_count = Product.objects.filter(status="out_of_stock").count()
    cancelled_recent = Order.objects.filter(status="cancelled", created_at__gte=since).count()
    total_orders_recent = Order.objects.filter(created_at__gte=since).count()
    cancellation_rate = (cancelled_recent / total_orders_recent * 100) if total_orders_recent else 0

    current_order_count = current_orders.count()
    previous_order_count = previous_orders.count()
    aov_current = (float(gmv_current) / current_order_count) if current_order_count else 0.0
    aov_previous = (float(gmv_previous) / previous_order_count) if previous_order_count else 0.0
    repeat_buyer_rate = _repeat_buyer_rate()

    context["period"] = period
    context["period_label"] = VALID_PERIODS[period]
    context["period_options"] = [
        {"value": p, "label": label, "active": p == period, "url": f"?period={p}"}
        for p, label in VALID_PERIODS.items()
    ]

    context["kpi_sections"] = [
        {
            "title": "Overview",
            "kpis": [
                _kpi(
                    "gmv", "Total Trade Volume (GMV)", float(gmv_total), icon="payments", tone="primary",
                    display=f"KES {gmv_total:,.0f}", empty_message="No trade volume yet — no orders have been placed.",
                    href=reverse("admin:orders_order_changelist"),
                    trend=_pct_change(gmv_current, gmv_previous),
                ),
                _kpi(
                    "orders", "Total Orders", Order.objects.count(), icon="shopping_cart", tone="primary",
                    empty_message="No orders placed yet.",
                    href=reverse("admin:orders_order_changelist"),
                    trend=_pct_change(current_orders.count(), previous_orders.count()),
                ),
                _kpi(
                    "members", "Platform Members", _members().count(), icon="group", tone="primary",
                    display=f"{_members().count():,}", empty_message="No buyers or sellers have joined yet.",
                    href=reverse("admin:accounts_customuser_changelist"),
                    trend=_pct_change(members_current, members_previous),
                ),
            ],
        },
        {
            "title": "Needs Attention",
            "kpis": [
                _kpi(
                    "pending_approvals", "Pending Seller Approvals", pending_sellers_count, icon="pending_actions",
                    tone="warning", empty_message="No sellers waiting for approval — you're all caught up.",
                    href=reverse("admin:accounts_sellerprofile_changelist") + "?approval_status__exact=pending",
                ),
                _kpi(
                    "flagged_orders", "Flagged Orders", flagged_count, icon="flag", tone="danger",
                    empty_message="No orders flagged for review.",
                    href=reverse("admin:orders_order_changelist") + "?is_flagged__exact=1",
                ),
                _kpi(
                    "debt", "Outstanding Debt", float(debt_total), icon="account_balance_wallet", tone="danger",
                    empty_message="No outstanding debts — every order is settled.",
                    display=f"KES {debt_total:,.0f} across {debt_orders_with_balance} order(s)",
                    href=reverse("admin:orders_order_changelist") + "?status__exact=debt_active",
                ),
            ],
        },
        {
            "title": "Advanced Analytics",
            "kpis": [
                _kpi(
                    "aov", "Average Order Value", aov_current, icon="receipt_long", tone="primary",
                    display=f"KES {aov_current:,.0f}", empty_message="No orders yet in this period to average.",
                    href=reverse("admin:orders_order_changelist"),
                    trend=_pct_change(aov_current, aov_previous),
                ),
                _kpi(
                    "repeat_buyer_rate", "Repeat Buyer Rate", repeat_buyer_rate, icon="repeat", tone="neutral",
                    display=f"{repeat_buyer_rate:.0f}% of buyers order more than once",
                    empty_message="Not enough order history yet.",
                    href=reverse("admin:accounts_customuser_changelist") + "?role__exact=buyer",
                ),
            ],
        },
        {
            "title": "Catalog",
            "kpis": [
                _kpi(
                    "active_listings", "Active Listings", Product.objects.filter(status="available").count(),
                    icon="inventory_2", tone="neutral", empty_message="No products currently listed.",
                    href=reverse("admin:products_product_changelist") + "?status__exact=available",
                ),
                _kpi(
                    "out_of_stock", "Out of Stock", out_of_stock_count, icon="production_quantity_limits",
                    tone="warning", empty_message="Nothing is out of stock right now.",
                    href=reverse("admin:products_product_changelist") + "?status__exact=out_of_stock",
                ),
                _kpi(
                    "categories", "Categories", Category.objects.count(), icon="category", tone="neutral",
                    empty_message="No categories set up yet.",
                    href=reverse("admin:products_category_changelist"),
                ),
            ],
        },
    ]

    # Alerts — plain, explainable anomaly rules, not statistical forecasting.
    alerts = []
    if pending_sellers_count > 0:
        alerts.append({
            "tone": "info",
            "message": f"{pending_sellers_count} seller(s) waiting for approval.",
            "href": reverse("admin:accounts_sellerprofile_changelist") + "?approval_status__exact=pending",
        })
    if flagged_count > 0:
        alerts.append({
            "tone": "danger",
            "message": f"{flagged_count} order(s) flagged for review.",
            "href": reverse("admin:orders_order_changelist") + "?is_flagged__exact=1",
        })
    gmv_direction, _ = _pct_change(gmv_current, gmv_previous)
    if gmv_direction == "down" and gmv_previous > 0 and gmv_current < gmv_previous * 0.8:
        drop = (1 - float(gmv_current) / float(gmv_previous)) * 100
        alerts.append({"tone": "warning", "message": f"Trade volume dropped {drop:.0f}% vs. the previous period.", "href": None})
    if cancellation_rate > 15:
        alerts.append({
            "tone": "warning",
            "message": f"{cancellation_rate:.0f}% of orders in this period were cancelled.",
            "href": reverse("admin:orders_order_changelist") + "?status__exact=cancelled",
        })
    context["alerts"] = alerts

    context["chart_user_growth"] = _user_growth_chart(now - timedelta(days=GROWTH_DAYS), now)
    context["chart_orders_by_status"] = _orders_by_status_chart()
    context["chart_gmv_by_month"] = _gmv_by_month_chart(now - timedelta(days=30 * GMV_TREND_MONTHS))
    context["chart_categories"] = _category_chart()
    context["chart_debt_aging"] = _debt_aging_chart(now)
    context["chart_order_funnel"] = _order_funnel_chart(since)
    context["has_orders"] = Order.objects.exists()
    context["has_products"] = Product.objects.exists()
    context["has_debt"] = debt_total > 0
    context["has_funnel_data"] = total_orders_recent > 0

    top_sellers = (
        non_cancelled.exclude(seller__isnull=True)
        .values("seller__seller_profile__store_name")
        .annotate(
            order_count=Count("id"),
            revenue=Coalesce(Sum(Coalesce("final_total", "total_price")), Decimal("0"), output_field=DecimalField()),
        )
        .order_by("-revenue")[:TOP_SELLERS_LIMIT]
    )
    gmv_total_f = float(gmv_total)
    context["top_sellers"] = [
        {
            "store_name": row["seller__seller_profile__store_name"] or "—",
            "order_count": row["order_count"],
            "revenue": row["revenue"],
            "share_pct": round(float(row["revenue"]) / gmv_total_f * 100, 1) if gmv_total_f else 0.0,
        }
        for row in top_sellers
    ]

    context["recent_orders"] = (
        Order.objects.select_related("buyer", "seller__seller_profile")
        .order_by("-created_at")[:10]
    )

    context["pending_sellers"] = (
        SellerProfile.objects.filter(approval_status="pending")
        .select_related("user")
        .order_by("created_at")[:10]
    )

    return context
