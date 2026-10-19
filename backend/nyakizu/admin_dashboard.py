"""
nyakizu/admin_dashboard.py

Executive Management Information System (MIS) data callback for Django Unfold.
Aggregates enterprise-grade operational, financial, and logistics telemetry
across:
  1. Executive Command Center & Gross Marketplace GMV
  2. Billing & Treasury Operations (The new per-order billing engine, Daraja M-Pesa flows & escrow float)
  3. Wholesale Merchant Network (Sellers, KYC approvals, liquidity & enforcement levels)
  4. Retail Buyer Operations & Credit Exposure (Buyer demographics, repeat purchase rate, madeni aging)
  5. Order Logistics & Fulfillment Pipeline (Fulfillment funnel, status telemetry, escalations)
"""

import json
import sys
from datetime import timedelta
from decimal import Decimal

import django
from django.conf import settings
from django.db.models import Count, DecimalField, Q, Sum
from django.db.models.functions import Coalesce, TruncDate, TruncMonth
from django.templatetags.static import static
from django.urls import reverse
from django.utils import timezone

from accounts.models import (
    BuyerProfile,
    BuyerSellerRelationship,
    BuyerStoreFollow,
    CustomUser,
    SellerProfile,
)
from billing.models import (
    CreditEntry,
    FeeSchedule,
    OrderFee,
    Payment,
    SellerAccount,
)
from billing.services import enforcement_level, get_active_schedule
from orders.models import Order, OrderStatusEvent
from products.models import Category, Product
from security.models import SecurityAuditLog
from security.services import get_security_telemetry, verify_ledger_invariants


def favicon_ico_url(request=None):
    """UNFOLD["SITE_FAVICONS"] href — resolved via static() so it works in prod."""
    return static("admin/favicon.ico")


def favicon_png_url(request=None):
    return static("admin/favicon-192.png")


GROWTH_DAYS = 90
GMV_TREND_MONTHS = 6
TOP_SELLERS_LIMIT = 10
CATEGORY_CHART_LIMIT = 10
VALID_PERIODS = {7: "Last 7 Days (Realtime)", 30: "Last 30 Days (Month-to-Date)", 90: "Last 90 Days (Quarterly)"}
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
    """Returns (direction, formatted_pct) or (None, None) when there's no baseline."""
    if previous == 0:
        if current == 0:
            return None, None
        return "up", "New"
    pct = (float(current) - float(previous)) / float(previous) * 100
    if abs(pct) < 0.5:
        return "flat", "0%"
    return ("up" if pct > 0 else "down"), f"{abs(pct):.1f}%"


def _kpi(key, label, value, *, icon, href=None, empty_message=None, display=None,
         tone="neutral", trend=None, suffix=""):
    """Builds one KPI card context with enterprise typography and tones."""
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
            {
                "label": "Retail Buyers",
                "data": buyers,
                "borderColor": "#3B82F6",
                "backgroundColor": "rgba(59, 130, 246, 0.15)",
                "borderWidth": 2,
                "fill": True,
                "tension": 0.2,
                "pointRadius": 2,
            },
            {
                "label": "Wholesale Sellers",
                "data": sellers,
                "borderColor": "#8B5CF6",
                "backgroundColor": "rgba(139, 92, 246, 0.15)",
                "borderWidth": 2,
                "fill": True,
                "tension": 0.2,
                "pointRadius": 2,
            },
        ],
    })


def _orders_by_status_chart():
    counts = dict(Order.objects.values_list("status").annotate(count=Count("id")))
    colors = {
        "submitted": "#F59E0B", "sourcing": "#3B82F6", "locked": "#64748B",
        "debt_active": "#EF4444", "cleared": "#10B981", "cancelled": "#94A3B8",
    }
    rows = [(label, counts.get(choice, 0), colors[choice]) for choice, label in Order.STATUS_CHOICES]
    rows = [r for r in rows if r[1] > 0]
    return json.dumps({
        "labels": [r[0] for r in rows],
        "datasets": [{
            "data": [r[1] for r in rows],
            "backgroundColor": [r[2] for r in rows],
            "borderWidth": 2,
            "borderColor": "#FFFFFF",
        }],
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
        "datasets": [{
            "label": "GMV (KES)",
            "data": [float(row["volume"]) for row in rows],
            "backgroundColor": "#2563EB",
            "borderRadius": 4,
            "barPercentage": 0.6,
        }],
    })


def _finance_chart(since):
    """Platform Net Fees vs M-Pesa Top-ups by month."""
    fee_months = (
        CreditEntry.objects.filter(created_at__gte=since, kind="fee_charged")
        .annotate(month=TruncMonth("created_at"))
        .values("month")
        .annotate(total=Coalesce(Sum("amount_kes"), Decimal("0"), output_field=DecimalField()))
        .order_by("month")
    )
    topup_months = (
        Payment.objects.filter(created_at__gte=since, status="success")
        .annotate(month=TruncMonth("created_at"))
        .values("month")
        .annotate(total=Coalesce(Sum("amount_kes"), Decimal("0"), output_field=DecimalField()))
        .order_by("month")
    )
    all_months = sorted(list(set(
        [r["month"] for r in fee_months] + [r["month"] for r in topup_months]
    )))
    labels = [m.strftime("%b %Y") for m in all_months]
    fees_map = {r["month"]: abs(float(r["total"])) for r in fee_months}
    topups_map = {r["month"]: float(r["total"]) for r in topup_months}

    return json.dumps({
        "labels": labels,
        "datasets": [
            {
                "label": "Platform Fee Revenue (KES)",
                "data": [fees_map.get(m, 0.0) for m in all_months],
                "backgroundColor": "#2563EB",
                "borderRadius": 4,
                "barPercentage": 0.45,
            },
            {
                "label": "Daraja Top-up Inflow (KES)",
                "data": [topups_map.get(m, 0.0) for m in all_months],
                "backgroundColor": "#10B981",
                "borderRadius": 4,
                "barPercentage": 0.45,
            },
        ],
    })


def _buyer_type_chart():
    """Distribution of retail buyers by registered business type."""
    counts = dict(BuyerProfile.objects.values_list("business_type").annotate(count=Count("id")))
    items = [(choice[1], counts.get(choice[0], 0)) for choice in BuyerProfile.BUSINESS_TYPE_CHOICES if counts.get(choice[0], 0) > 0]
    if not items:
        items = [("General Retailers", CustomUser.objects.filter(role="buyer").count())]
    colors = ["#2563EB", "#7C3AED", "#059669", "#D97706", "#475569"]
    return json.dumps({
        "labels": [item[0] for item in items],
        "datasets": [{
            "data": [item[1] for item in items],
            "backgroundColor": colors[:len(items)],
            "borderWidth": 2,
            "borderColor": "#FFFFFF",
        }],
    })


def _repeat_buyer_rate():
    """% of buyers (with >= 1 non-cancelled order) who placed > 1 order."""
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


DEBT_AGE_BUCKETS = [("0-7 days (Current)", 0, 7), ("8-30 days (Watch)", 8, 30), ("31+ days (Delinquent)", 31, None)]


def _debt_aging_chart(now):
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
            "label": "Outstanding Debt (KES)",
            "data": [float(v) for v in buckets.values()],
            "backgroundColor": ["#F59E0B", "#F97316", "#DC2626"],
            "borderRadius": 4,
            "barPercentage": 0.5,
        }],
    })


FUNNEL_STAGES = [("submitted", "Submitted"), ("sourcing", "Sourcing"), ("locked", "Locked"), ("cleared", "Cleared")]


def _order_funnel_chart(since):
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
            "label": "Orders Reaching Stage",
            "data": [counts.get(stage, 0) for stage, _ in FUNNEL_STAGES],
            "backgroundColor": "#2563EB",
            "borderRadius": 4,
            "barPercentage": 0.5,
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
        "datasets": [{
            "label": "Product SKUs",
            "data": [row["product_count"] for row in rows],
            "backgroundColor": "#7C3AED",
            "borderRadius": 4,
            "barPercentage": 0.6,
        }],
    })


def pending_sellers_badge(request):
    """Sidebar badge for pending seller approvals."""
    return str(SellerProfile.objects.filter(approval_status="pending").count())


def dashboard_callback(request, context):
    """Powerhouse MIS Dashboard data callback with enterprise command center telemetry."""
    now = timezone.now()

    try:
        period = int(request.GET.get("period", DEFAULT_PERIOD))
    except (TypeError, ValueError):
        period = DEFAULT_PERIOD
    if period not in VALID_PERIODS:
        period = DEFAULT_PERIOD

    since = now - timedelta(days=period)
    previous_since = now - timedelta(days=period * 2)

    # Orders & GMV
    all_orders = Order.objects.all()
    non_cancelled = all_orders.exclude(status="cancelled")
    current_orders = non_cancelled.filter(created_at__gte=since)
    previous_orders = non_cancelled.filter(created_at__gte=previous_since, created_at__lt=since)

    gmv_total = _gmv_total(non_cancelled)
    gmv_current = _gmv_total(current_orders)
    gmv_previous = _gmv_total(previous_orders)

    # Members
    members_total = _members().count()
    members_current = _members().filter(date_joined__gte=since).count()
    members_previous = _members().filter(date_joined__gte=previous_since, date_joined__lt=since).count()

    total_buyers = CustomUser.objects.filter(role="buyer").count()
    total_approved_sellers = SellerProfile.objects.filter(approval_status="approved").count()
    pending_sellers_count = SellerProfile.objects.filter(approval_status="pending").count()

    # ── Billing & Treasury Operations (The NEW Billing System) ────────────────
    charged_agg = OrderFee.objects.filter(status="charged").aggregate(
        total=Coalesce(Sum("amount_kes"), Decimal("0"), output_field=DecimalField()),
        count=Count("id")
    )
    refunded_agg = OrderFee.objects.filter(status="refunded").aggregate(
        total=Coalesce(Sum("amount_kes"), Decimal("0"), output_field=DecimalField()),
        count=Count("id")
    )
    waived_agg = OrderFee.objects.filter(status="waived_free").aggregate(
        total=Coalesce(Sum("amount_kes"), Decimal("0"), output_field=DecimalField()),
        count=Count("id")
    )
    gross_fees = charged_agg["total"]
    fee_refunds = refunded_agg["total"]
    net_fees = gross_fees - fee_refunds

    # Daraja M-Pesa Top-ups
    payments_agg = Payment.objects.filter(status="success").aggregate(
        total=Coalesce(Sum("amount_kes"), Decimal("0"), output_field=DecimalField()),
        count=Count("id")
    )
    topup_total = payments_agg["total"]
    topup_count = payments_agg["count"]

    # Seller balances (Escrow Float vs Negative Debts)
    seller_float = SellerAccount.objects.filter(credit_kes__gt=0).aggregate(
        total=Coalesce(Sum("credit_kes"), Decimal("0"), output_field=DecimalField())
    )["total"]
    seller_debt_raw = SellerAccount.objects.filter(credit_kes__lt=0).aggregate(
        total=Coalesce(Sum("credit_kes"), Decimal("0"), output_field=DecimalField())
    )["total"]
    seller_debt = abs(seller_debt_raw)
    sellers_in_debt_count = SellerAccount.objects.filter(credit_kes__lt=0).count()
    total_seller_accounts = SellerAccount.objects.count()

    total_free_orders_used = SellerAccount.objects.aggregate(
        total=Coalesce(Sum("free_orders_used"), 0)
    )["total"]

    active_schedule = get_active_schedule()
    rate_display = (
        f"{active_schedule.rate_percent}% (min KES {active_schedule.min_fee_kes:.0f}, max KES {active_schedule.max_fee_kes:.0f})"
        if active_schedule else "0.500% standard"
    )

    # ── Buyer Department Metrics ──────────────────────────────────────────────
    approved_trade_links = BuyerSellerRelationship.objects.filter(status="approved").count()
    pending_trade_links = BuyerSellerRelationship.objects.filter(status="pending").count()
    total_follows = BuyerStoreFollow.objects.count()

    debt_balances = [o.balance for o in Order.objects.filter(status__in=["locked", "debt_active"])]
    debt_total = sum(debt_balances, Decimal("0"))
    debt_orders_with_balance = sum(1 for b in debt_balances if b > 0)

    repeat_buyer_rate = _repeat_buyer_rate()

    # ── Seller & Catalog Department Metrics ───────────────────────────────────
    out_of_stock_count = Product.objects.filter(status="out_of_stock").count()
    active_products_count = Product.objects.filter(status="available").count()
    total_categories = Category.objects.count()

    # ── Order Fulfillment & Logistics Metrics ─────────────────────────────────
    flagged_count = Order.objects.filter(is_flagged=True).count()
    cancelled_recent = Order.objects.filter(status="cancelled", created_at__gte=since).count()
    total_orders_recent = Order.objects.filter(created_at__gte=since).count()
    cancellation_rate = (cancelled_recent / total_orders_recent * 100) if total_orders_recent else 0

    current_order_count = current_orders.count()
    previous_order_count = previous_orders.count()
    aov_current = (float(gmv_current) / current_order_count) if current_order_count else 0.0
    aov_previous = (float(gmv_previous) / previous_order_count) if previous_order_count else 0.0

    pipeline_orders_count = Order.objects.filter(status__in=["submitted", "sourcing", "locked"]).count()

    # Security & Business Continuity (BC/DR) Telemetry
    security_telemetry = get_security_telemetry()
    invariant_report = verify_ledger_invariants()

    # System Health Telemetry
    context["system_telemetry"] = {
        "server_time": now.strftime("%Y-%m-%d %H:%M:%S UTC"),
        "local_time": timezone.localtime(now).strftime("%Y-%m-%d %H:%M:%S EAT"),
        "total_records": (
            all_orders.count() +
            Product.objects.count() +
            CustomUser.objects.count() +
            CreditEntry.objects.count() +
            Payment.objects.count() +
            SecurityAuditLog.objects.count()
        ),
        "cluster": "NAIROBI-EAST-PROD",
        "currency": "KES",
        "enforcement_active": True,
        "threat_level": security_telemetry["threat_level"],
        "rpo_status": security_telemetry["rpo_status"],
        "invariant_status": "PASS (0 Anomalies)" if invariant_report["audit_passed"] else f"FAIL ({invariant_report['anomalies_count']} Anomalies)",
    }

    # Context basics
    context["period"] = period
    context["period_label"] = VALID_PERIODS[period]
    context["period_options"] = [
        {"value": p, "label": label, "active": p == period, "url": f"?period={p}"}
        for p, label in VALID_PERIODS.items()
    ]

    # Departmental Key Performance Indicators
    context["kpi_sections"] = [
        {
            "title": "Executive Summary & Core Market Metrics",
            "kpis": [
                _kpi(
                    "gmv", "Gross Merchandise Value (GMV)", float(gmv_total), icon="payments", tone="primary",
                    display=f"KES {gmv_total:,.0f}", empty_message="No GMV yet.",
                    href=reverse("admin:orders_order_changelist"),
                    trend=_pct_change(gmv_current, gmv_previous),
                ),
                _kpi(
                    "net_fees", "Platform Net Fee Revenue", float(net_fees), icon="account_balance", tone="primary",
                    display=f"KES {net_fees:,.2f}", empty_message="KES 0.00",
                    href=reverse("admin:billing_orderfee_changelist"),
                ),
                _kpi(
                    "topups", "M-Pesa Top-up Inflow", float(topup_total), icon="phone_android", tone="primary",
                    display=f"KES {topup_total:,.0f} ({topup_count} payments)",
                    href=reverse("admin:billing_payment_changelist"),
                ),
                _kpi(
                    "orders", "Total Orders Processed", all_orders.count(), icon="shopping_cart", tone="primary",
                    empty_message="No orders placed.",
                    href=reverse("admin:orders_order_changelist"),
                    trend=_pct_change(current_orders.count(), previous_orders.count()),
                ),
                _kpi(
                    "members", "Trading Platform Members", members_total, icon="group", tone="primary",
                    display=f"{members_total:,} ({total_buyers} buyers · {total_approved_sellers} sellers)",
                    href=reverse("admin:accounts_customuser_changelist"),
                    trend=_pct_change(members_current, members_previous),
                ),
                _kpi(
                    "debt", "Total Outstanding Market Debt", float(debt_total), icon="wallet", tone="danger" if debt_total > 0 else "neutral",
                    display=f"KES {debt_total:,.0f} ({debt_orders_with_balance} orders)", empty_message="No open debts.",
                    href=reverse("admin:orders_order_changelist") + "?status__exact=debt_active",
                ),
            ],
        },
        {
            "title": "Billing & Treasury Department (New Billing Engine)",
            "kpis": [
                _kpi(
                    "gross_fees", "Gross Fees Charged", float(gross_fees), icon="receipt_long", tone="neutral",
                    display=f"KES {gross_fees:,.2f} ({charged_agg['count']} fees)",
                    href=reverse("admin:billing_orderfee_changelist") + "?status__exact=charged",
                ),
                _kpi(
                    "fee_refunds", "Fee Refunds Processed", float(fee_refunds), icon="currency_exchange", tone="neutral",
                    display=f"KES {fee_refunds:,.2f} ({refunded_agg['count']} refunds)",
                    href=reverse("admin:billing_orderfee_changelist") + "?status__exact=refunded",
                ),
                _kpi(
                    "seller_float", "Seller Escrow Deposit Float", float(seller_float), icon="savings", tone="primary",
                    display=f"KES {seller_float:,.2f}",
                    href=reverse("admin:billing_selleraccount_changelist"),
                ),
                _kpi(
                    "waived_subsidy", "Free Orders Platform Subsidy", float(waived_agg["total"]), icon="redeem", tone="neutral",
                    display=f"KES {waived_agg['total']:,.2f} ({waived_agg['count']} waived)",
                    href=reverse("admin:billing_orderfee_changelist") + "?status__exact=waived_free",
                ),
                _kpi(
                    "sellers_debt", "Sellers in Negative Debt", sellers_in_debt_count, icon="money_off",
                    tone="danger" if sellers_in_debt_count > 0 else "neutral",
                    display=f"{sellers_in_debt_count} seller(s) owing KES {seller_debt:,.2f}",
                    empty_message="No sellers in debt.",
                    href=reverse("admin:billing_selleraccount_changelist"),
                ),
                _kpi(
                    "fee_rate", "Active Billing Schedule", 1, icon="sell", tone="neutral",
                    display=rate_display,
                    href=reverse("admin:billing_feeschedule_changelist"),
                ),
            ],
        },
        {
            "title": "Buyer Operations Department (Retail Network)",
            "kpis": [
                _kpi(
                    "buyers", "Verified Retail Buyers", total_buyers, icon="person", tone="primary",
                    display=f"{total_buyers:,} buyers",
                    href=reverse("admin:accounts_buyerprofile_changelist"),
                ),
                _kpi(
                    "repeat_rate", "Repeat Purchase Loyalty", repeat_buyer_rate, icon="repeat", tone="neutral",
                    display=f"{repeat_buyer_rate:.1f}% repeat buyers",
                    href=reverse("admin:orders_order_changelist"),
                ),
                _kpi(
                    "trade_links", "Approved Trade Permissions", approved_trade_links, icon="handshake", tone="neutral",
                    display=f"{approved_trade_links} active links ({pending_trade_links} pending)",
                    href=reverse("admin:accounts_buyersellerrelationship_changelist"),
                ),
                _kpi(
                    "store_follows", "Store Follower Connections", total_follows, icon="favorite", tone="neutral",
                    display=f"{total_follows} follows",
                    href=reverse("admin:accounts_buyerstorefollow_changelist"),
                ),
            ],
        },
        {
            "title": "Wholesale Merchant Department & Catalog",
            "kpis": [
                _kpi(
                    "sellers_active", "Live Wholesale Stores", total_approved_sellers, icon="storefront", tone="primary",
                    display=f"{total_approved_sellers} approved stores",
                    href=reverse("admin:accounts_sellerprofile_changelist") + "?approval_status__exact=approved",
                ),
                _kpi(
                    "pending_approvals", "Pending KYC Verification", pending_sellers_count, icon="pending_actions",
                    tone="warning" if pending_sellers_count > 0 else "neutral",
                    display=f"{pending_sellers_count} pending verification",
                    empty_message="KYC queue caught up.",
                    href=reverse("admin:accounts_sellerprofile_changelist") + "?approval_status__exact=pending",
                ),
                _kpi(
                    "active_listings", "Active Catalog SKUs", active_products_count, icon="inventory_2", tone="neutral",
                    display=f"{active_products_count:,} SKUs listed",
                    href=reverse("admin:products_product_changelist") + "?status__exact=available",
                ),
                _kpi(
                    "out_of_stock", "Stockout Risk SKUs", out_of_stock_count, icon="production_quantity_limits",
                    tone="warning" if out_of_stock_count > 0 else "neutral",
                    display=f"{out_of_stock_count} SKUs out of stock",
                    empty_message="Zero stockout SKUs.",
                    href=reverse("admin:products_product_changelist") + "?status__exact=out_of_stock",
                ),
                _kpi(
                    "categories", "Product Categories", total_categories, icon="category", tone="neutral",
                    display=f"{total_categories} categories",
                    href=reverse("admin:products_category_changelist"),
                ),
            ],
        },
        {
            "title": "Order Fulfillment & Logistics Pipeline",
            "kpis": [
                _kpi(
                    "pipeline", "Fulfillment Pipeline Active", pipeline_orders_count, icon="hourglass_top", tone="primary",
                    display=f"{pipeline_orders_count} orders in progress",
                    href=reverse("admin:orders_order_changelist"),
                ),
                _kpi(
                    "aov", "Average Order Value (AOV)", aov_current, icon="calculate", tone="neutral",
                    display=f"KES {aov_current:,.0f}", empty_message="No orders in period.",
                    href=reverse("admin:orders_order_changelist"),
                    trend=_pct_change(aov_current, aov_previous),
                ),
                _kpi(
                    "flagged_orders", "Dispute & Escalation Flags", flagged_count, icon="flag",
                    tone="danger" if flagged_count > 0 else "neutral",
                    display=f"{flagged_count} order(s) flagged",
                    empty_message="Zero flagged escalations.",
                    href=reverse("admin:orders_order_changelist") + "?is_flagged__exact=1",
                ),
                _kpi(
                    "cancel_rate", "Order Cancellation Rate", cancellation_rate, icon="cancel",
                    tone="warning" if cancellation_rate > 15 else "neutral",
                    display=f"{cancellation_rate:.1f}% cancelled",
                    href=reverse("admin:orders_order_changelist") + "?status__exact=cancelled",
                ),
            ],
        },
        {
            "title": "Security, Risk Governance & Business Continuity (BC/DR)",
            "kpis": [
                _kpi(
                    "threat_posture", "System Threat Posture", 1, icon="shield",
                    tone="primary" if security_telemetry['active_breakers_count'] == 0 else "danger",
                    display=security_telemetry['threat_level'],
                    href=reverse("admin:security_platformsecuritypolicy_changelist"),
                ),
                _kpi(
                    "rpo_telemetry", "BC/DR Recovery Point (RPO)", 1, icon="backup",
                    tone="primary" if security_telemetry['rpo_tone'] == 'normal' else "warning",
                    display=f"RPO: {security_telemetry['rpo_status']}",
                    href=reverse("admin:security_systembackuprecord_changelist"),
                ),
                _kpi(
                    "invariant_audit", "Double-Entry Invariant Audit", 1 if invariant_report['audit_passed'] else 0,
                    icon="verified_user",
                    tone="primary" if invariant_report['audit_passed'] else "danger",
                    display="100% Invariant Pass (0 Anomalies)" if invariant_report['audit_passed'] else f"DISCREPANCY DETECTED ({invariant_report['anomalies_count']})",
                    href=reverse("admin:billing_creditentry_changelist"),
                ),
                _kpi(
                    "audit_events", "Security Audit Trail", SecurityAuditLog.objects.count(), icon="policy",
                    tone="neutral",
                    display=f"{SecurityAuditLog.objects.count()} Audited Events",
                    href=reverse("admin:security_securityauditlog_changelist"),
                ),
            ],
        },
    ]

    # Real-Time Operational Alerts
    alerts = []
    if not invariant_report['audit_passed']:
        alerts.append({
            "tone": "danger",
            "message": f"CRITICAL SECURITY: Financial ledger invariant violation detected! {invariant_report['anomalies_count']} account(s) have discrepancy between stored balance and immutable ledger.",
            "href": reverse("admin:billing_creditentry_changelist"),
        })
    if security_telemetry['active_breakers_count'] > 0:
        alerts.append({
            "tone": "danger",
            "message": "EMERGENCY GOVERNANCE: Platform emergency circuit breakers / killswitches are currently ACTIVE.",
            "href": reverse("admin:security_platformsecuritypolicy_changelist"),
        })
    if security_telemetry['rpo_tone'] == 'frozen':
        alerts.append({
            "tone": "warning",
            "message": f"BUSINESS CONTINUITY: Database backup snapshot is stale ({security_telemetry['rpo_status']}). Trigger an automated backup.",
            "href": reverse("admin:security_systembackuprecord_changelist"),
        })
    if pending_sellers_count > 0:
        alerts.append({
            "tone": "info",
            "message": f"CRITICAL KYC: {pending_sellers_count} wholesale seller store(s) are awaiting verification and review.",
            "href": reverse("admin:accounts_sellerprofile_changelist") + "?approval_status__exact=pending",
        })
    if flagged_count > 0:
        alerts.append({
            "tone": "danger",
            "message": f"DISPUTE ALERT: {flagged_count} order(s) have been flagged for administrative dispute resolution.",
            "href": reverse("admin:orders_order_changelist") + "?is_flagged__exact=1",
        })
    if sellers_in_debt_count > 0:
        alerts.append({
            "tone": "warning",
            "message": f"TREASURY ALERT: {sellers_in_debt_count} seller account(s) have negative balance (KES {seller_debt:,.2f} debt). Automated enforcement applies.",
            "href": reverse("admin:billing_selleraccount_changelist"),
        })
    gmv_direction, _ = _pct_change(gmv_current, gmv_previous)
    if gmv_direction == "down" and gmv_previous > 0 and gmv_current < gmv_previous * Decimal("0.8"):
        drop = (1 - float(gmv_current) / float(gmv_previous)) * 100
        alerts.append({"tone": "warning", "message": f"Trade volume dropped {drop:.0f}% vs. the previous period.", "href": None})
    if cancellation_rate > 15:
        alerts.append({
            "tone": "warning",
            "message": f"LOGISTICS WARNING: {cancellation_rate:.0f}% of orders in this period were cancelled.",
            "href": reverse("admin:orders_order_changelist") + "?status__exact=cancelled",
        })
    context["alerts"] = alerts

    # Charts JSON
    context["chart_user_growth"] = _user_growth_chart(now - timedelta(days=GROWTH_DAYS), now)
    context["chart_gmv_by_month"] = _gmv_by_month_chart(now - timedelta(days=30 * GMV_TREND_MONTHS))
    context["chart_finance"] = _finance_chart(now - timedelta(days=30 * GMV_TREND_MONTHS))
    context["chart_buyer_type"] = _buyer_type_chart()
    context["chart_orders_by_status"] = _orders_by_status_chart()
    context["chart_categories"] = _category_chart()
    context["chart_debt_aging"] = _debt_aging_chart(now)
    context["chart_order_funnel"] = _order_funnel_chart(since)

    context["has_orders"] = all_orders.exists()
    context["has_products"] = Product.objects.exists()
    context["has_debt"] = debt_total > 0
    context["has_funnel_data"] = total_orders_recent > 0
    context["has_finance_data"] = (gross_fees > 0 or topup_total > 0)

    # Streamlined card-free executive telemetry summary
    gmv_dir, gmv_pct = _pct_change(gmv_current, gmv_previous)
    aov_dir, aov_pct = _pct_change(aov_current, aov_previous)
    context["stats_summary"] = {
        "gmv": f"KES {gmv_current:,.0f}",
        "gmv_direction": gmv_dir,
        "gmv_pct": gmv_pct,
        "net_fees": f"KES {gross_fees:,.2f}",
        "escrow_float": f"KES {seller_float:,.2f}",
        "market_debt": f"KES {debt_total:,.0f}",
        "sellers_in_debt": sellers_in_debt_count,
        "seller_debt_total": f"KES {seller_debt:,.2f}",
        "orders_count": total_orders_recent,
        "orders_pipeline": pipeline_orders_count,
        "members_count": members_total,
        "total_buyers": total_buyers,
        "total_sellers": total_approved_sellers,
        "pending_kyc": pending_sellers_count,
        "active_skus": active_products_count,
        "stockout_skus": out_of_stock_count,
        "total_categories": total_categories,
        "flagged_orders": flagged_count,
        "cancellation_rate": f"{cancellation_rate:.1f}%",
        "repeat_buyer_rate": f"{repeat_buyer_rate:.1f}%",
        "aov": f"KES {aov_current:,.0f}",
        "aov_direction": aov_dir,
        "aov_pct": aov_pct,
        "fee_rate_display": rate_display,
        "topup_total": f"KES {topup_total:,.2f}",
        "topup_count": topup_count,
        "waived_total": f"KES {waived_agg['total']:,.2f}",
        "waived_count": waived_agg['count'],
    }

    # Top Sellers Leaderboard (With live Billing balance & account # & enforcement level)
    top_sellers_qs = (
        non_cancelled.exclude(seller__isnull=True)
        .values(
            "seller_id",
            "seller__seller_profile__store_name",
            "seller__first_name",
            "seller__last_name",
            "seller__phone_number",
            "seller__seller_profile__location",
            "seller__seller_profile__billing_account__credit_kes",
            "seller__seller_profile__billing_account__account_number",
            "seller__seller_profile__billing_account__debt_since",
            "seller__seller_profile__billing_account__free_orders_used",
        )
        .annotate(
            order_count=Count("id"),
            revenue=Coalesce(Sum(Coalesce("final_total", "total_price")), Decimal("0"), output_field=DecimalField()),
        )
        .order_by("-revenue")[:TOP_SELLERS_LIMIT]
    )
    gmv_total_f = float(gmv_total)
    
    ENFORCEMENT_MAP = {
        0: ("Normal", "#10B981"),
        1: ("Notice", "#F59E0B"),
        2: ("Restricted", "#F97316"),
        3: ("Frozen", "#EF4444"),
    }
    
    top_sellers_list = []
    for row in top_sellers_qs:
        credit = row["seller__seller_profile__billing_account__credit_kes"] or Decimal("0.00")
        debt_since = row["seller__seller_profile__billing_account__debt_since"]
        # Determine rough enforcement level
        if credit >= 0:
            enf_level = 0
        else:
            days = (now - debt_since).days if debt_since else 0
            if days >= 7 or credit <= -1500:
                enf_level = 3
            elif days >= 3 or credit <= -500:
                enf_level = 2
            else:
                enf_level = 1
        enf_name, enf_color = ENFORCEMENT_MAP[enf_level]

        top_sellers_list.append({
            "seller_id": row["seller_id"],
            "store_name": row["seller__seller_profile__store_name"] or "—",
            "owner_name": f"{row['seller__first_name'] or ''} {row['seller__last_name'] or ''}".strip() or "—",
            "phone": row["seller__phone_number"] or "—",
            "location": row["seller__seller_profile__location"] or "Nairobi",
            "account_number": row["seller__seller_profile__billing_account__account_number"] or "—",
            "credit_kes": credit,
            "free_orders_used": row["seller__seller_profile__billing_account__free_orders_used"] or 0,
            "enforcement_level": enf_level,
            "enforcement_name": enf_name,
            "enforcement_color": enf_color,
            "order_count": row["order_count"],
            "revenue": row["revenue"],
            "share_pct": round(float(row["revenue"]) / gmv_total_f * 100, 1) if gmv_total_f else 0.0,
        })
    context["top_sellers"] = top_sellers_list

    # Top Buyers Leaderboard
    top_buyers_qs = (
        non_cancelled.exclude(buyer__isnull=True)
        .values(
            "buyer_id",
            "buyer__first_name",
            "buyer__last_name",
            "buyer__username",
            "buyer__phone_number",
            "buyer__buyer_profile__business_type",
            "buyer__buyer_profile__location",
        )
        .annotate(
            order_count=Count("id"),
            total_spent=Coalesce(Sum(Coalesce("final_total", "total_price")), Decimal("0"), output_field=DecimalField()),
        )
        .order_by("-total_spent")[:5]
    )
    context["top_buyers"] = [
        {
            "buyer_id": row["buyer_id"],
            "name": f"{row['buyer__first_name'] or ''} {row['buyer__last_name'] or ''}".strip() or row["buyer__username"],
            "phone": row["buyer__phone_number"] or "—",
            "business_type": row["buyer__buyer_profile__business_type"] or "Retailer",
            "location": row["buyer__buyer_profile__location"] or "Nairobi",
            "order_count": row["order_count"],
            "total_spent": row["total_spent"],
        }
        for row in top_buyers_qs
    ]

    # Recent Orders Stream
    context["recent_orders"] = (
        Order.objects.select_related("buyer", "seller__seller_profile")
        .order_by("-created_at")[:12]
    )

    # Pending Seller Verification List
    context["pending_sellers"] = (
        SellerProfile.objects.filter(approval_status="pending")
        .select_related("user")
        .order_by("created_at")[:10]
    )

    # Security & Business Continuity Deep Telemetry
    context["security_telemetry"] = security_telemetry
    context["invariant_report"] = invariant_report

    # Comprehensive Enterprise Settings Registry for the Settings Console
    sched = get_active_schedule()
    context["settings_registry"] = {
        "platform": {
            "cluster": "NAIROBI-EAST-PROD",
            "django_version": django.get_version(),
            "python_version": sys.version.split()[0],
            "environment": "Development / Testing" if settings.DEBUG else "Production (Live)",
            "debug_mode": settings.DEBUG,
            "timezone": getattr(settings, "TIME_ZONE", "Africa/Nairobi"),
            "frontend_url": getattr(settings, "FRONTEND_VERIFY_BASE_URL", "http://localhost:3001"),
            "database_engine": "PostgreSQL (ACID Double-Entry)",
        },
        "billing": {
            "rate_percent": f"{sched.rate_percent}%" if sched else "0.5%",
            "min_fee": f"KES {sched.min_fee_kes:,.2f}" if sched else "KES 10.00",
            "max_fee": f"KES {sched.max_fee_kes:,.2f}" if sched else "KES 250.00",
            "free_orders_quota": 3,
            "grace_period_days": 3,
            "enforcement_freeze": security_telemetry["policy"].enforcement_freeze_active,
            "double_entry_mode": "Strict Append-Only (CreditEntry)",
        },
        "daraja": {
            "environment": str(getattr(settings, "DARAJA_ENVIRONMENT", "sandbox")).upper(),
            "shortcode": getattr(settings, "DARAJA_SHORTCODE", "174379"),
            "key_status": "Configured (Active)" if getattr(settings, "DARAJA_CONSUMER_KEY", None) else "Live Mock (Sandbox)",
            "circuit_breaker": security_telemetry["policy"].daraja_circuit_breaker_active,
            "webhook_url": "/api/billing/webhooks/daraja/",
            "allowlist_count": len(getattr(settings, "DARAJA_WEBHOOK_IPS", [])),
        },
        "security": {
            "trading_halt": security_telemetry["policy"].trading_halt_active,
            "maintenance_mode": security_telemetry["policy"].maintenance_mode_active,
            "threat_level": security_telemetry["threat_level"],
            "rpo_status": security_telemetry["rpo_status"],
            "rto_target": "< 2.0 Hours",
            "invariant_verdict": "100% PASS" if invariant_report["audit_passed"] else "ANOMALY DETECTED",
        },
        "communications": {
            "default_from_email": getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@nyakizudigital.me"),
            "server_email": getattr(settings, "SERVER_EMAIL", "noreply@nyakizudigital.me"),
            "push_notifications": "Active (WebPush VAPID Protocol)",
        },
    }

    return context
