"""
nyakizu/admin_dashboard.py

Data feed for the custom Django admin dashboard (django-unfold's
UNFOLD["DASHBOARD_CALLBACK"]). Aggregates platform-wide business metrics —
users, orders, GMV, catalog — for the admin homepage at /admin/.

Wired in via templates/admin/index.html, which reads the context keys
this module injects.
"""

import json
from datetime import timedelta
from decimal import Decimal

from django.db.models import Count, DecimalField, Sum
from django.db.models.functions import Coalesce, TruncDate
from django.urls import reverse
from django.utils import timezone
from django.utils.html import format_html

from accounts.models import CustomUser, SellerProfile
from orders.models import Order, OrderStatusEvent
from products.models import Category, Product

GROWTH_DAYS = 90

# Same semantic classes unfold's own unfold/helpers/label.html uses — guaranteed
# present in unfold's compiled CSS bundle since that template ships in the package.
STATUS_BADGE_STYLE = {
    'submitted':   'info',
    'sourcing':    'info',
    'locked':      'info',
    'debt_active': 'warning',
    'cleared':     'success',
    'cancelled':   'danger',
}
BADGE_CLASSES = {
    'info':    'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    'success': 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    'warning': 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
    'danger':  'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
}


def _status_badge(order):
    variant = STATUS_BADGE_STYLE.get(order.status, 'info')
    return format_html(
        '<span class="inline-block font-semibold h-6 leading-6 px-2 rounded-default '
        'text-[11px] uppercase whitespace-nowrap {}">{}</span>',
        BADGE_CLASSES[variant], order.get_status_display(),
    )


def pending_sellers_badge(request):
    """
    Sidebar badge callback (UNFOLD SIDEBAR navigation 'badge' key).

    Always returns a non-empty string (even "0") — unfold's badge template
    renders the literal text "None" if the callback ever returns None.
    """
    count = SellerProfile.objects.filter(approval_status='pending').count()
    return str(count)


def _daily_series(queryset, date_field, since, now, group_field=None):
    """
    Build a {date: {group_value_or_'count': count}} map, gap-filled across
    every day in [since, now], from a queryset filtered/annotated on date_field.
    """
    values_fields = ['day'] + ([group_field] if group_field else [])
    rows = (
        queryset
        .filter(**{f'{date_field}__gte': since})
        .annotate(day=TruncDate(date_field))
        .values(*values_fields)
        .annotate(count=Count('id'))
        .order_by('day')
    )

    by_day = {}
    for row in rows:
        day = row['day']
        key = row[group_field] if group_field else 'count'
        by_day.setdefault(day, {})[key] = row['count']

    days = []
    d = since.date()
    end = now.date()
    while d <= end:
        days.append(d)
        d += timedelta(days=1)

    return days, by_day


def _user_growth_chart(since, now):
    days, by_day = _daily_series(
        CustomUser.objects.all(), 'date_joined', since, now, group_field='role'
    )
    labels = [d.isoformat() for d in days]
    buyers = [by_day.get(d, {}).get('buyer', 0) for d in days]
    sellers = [by_day.get(d, {}).get('seller', 0) for d in days]

    return json.dumps({
        "labels": labels,
        "datasets": [
            {"label": "Buyers", "data": buyers, "borderColor": "#2563eb", "backgroundColor": "#2563eb"},
            {"label": "Sellers", "data": sellers, "borderColor": "#7c3aed", "backgroundColor": "#7c3aed"},
        ],
    })


def _order_volume_chart(since, now):
    days, by_day = _daily_series(
        OrderStatusEvent.objects.filter(status='submitted'), 'created_at', since, now,
    )
    labels = [d.isoformat() for d in days]
    counts = [by_day.get(d, {}).get('count', 0) for d in days]

    return json.dumps({
        "labels": labels,
        "datasets": [
            {"label": "New orders", "data": counts, "borderColor": "#16a34a", "backgroundColor": "#16a34a"},
        ],
    })


def _category_chart():
    rows = list(
        Category.objects.annotate(product_count=Count('products'))
        .values('name', 'product_count')
        .order_by('-product_count')[:10]
    )
    return json.dumps({
        "labels": [row['name'] for row in rows],
        "datasets": [
            {"label": "Products", "data": [row['product_count'] for row in rows], "backgroundColor": "#2563eb"},
        ],
    })


def dashboard_callback(request, context):
    now = timezone.now()
    since = now - timedelta(days=GROWTH_DAYS)

    non_cancelled = Order.objects.exclude(status='cancelled')

    context["kpi_total_users"] = CustomUser.objects.count()
    context["kpi_buyer_seller_split"] = (
        f"{CustomUser.objects.filter(role='buyer').count()} buyers · "
        f"{CustomUser.objects.filter(role='seller').count()} sellers"
    )
    context["kpi_total_orders"] = Order.objects.count()
    gmv = non_cancelled.aggregate(
        gmv=Coalesce(
            Sum(Coalesce('final_total', 'total_price')),
            Decimal('0'),
            output_field=DecimalField(),
        )
    )["gmv"]
    context["kpi_gmv"] = f"KES {gmv:,.0f}"
    context["kpi_active_listings"] = Product.objects.filter(status='available').count()
    context["kpi_pending_approvals"] = SellerProfile.objects.filter(approval_status='pending').count()
    context["kpi_cancelled_orders"] = Order.objects.filter(
        status='cancelled', created_at__gte=since
    ).count()
    context["pending_sellers_url"] = (
        reverse("admin:accounts_sellerprofile_changelist") + "?approval_status__exact=pending"
    )

    context["chart_user_growth"] = _user_growth_chart(since, now)
    context["chart_order_volume"] = _order_volume_chart(since, now)
    context["chart_categories"] = _category_chart()

    top_sellers = (
        non_cancelled.exclude(seller__isnull=True)
        .values('seller__seller_profile__store_name')
        .annotate(
            order_count=Count('id'),
            revenue=Coalesce(
                Sum(Coalesce('final_total', 'total_price')),
                Decimal('0'),
                output_field=DecimalField(),
            ),
        )
        .order_by('-revenue')[:10]
    )
    context["table_top_sellers"] = {
        "headers": ["Store", "Orders", "Revenue (KES)"],
        "rows": [
            [
                row['seller__seller_profile__store_name'] or '—',
                row['order_count'],
                f"{row['revenue']:,.0f}",
            ]
            for row in top_sellers
        ],
    }

    recent_orders = Order.objects.select_related('buyer', 'seller').order_by('-created_at')[:10]
    context["table_recent_orders"] = {
        "headers": ["Order", "Buyer", "Status", "Total (KES)", "Placed"],
        "rows": [
            [
                f"#{order.id}",
                order.buyer.get_full_name() or order.buyer.username,
                _status_badge(order),
                f"{(order.final_total if order.final_total is not None else order.total_price):,.0f}",
                order.created_at.strftime('%Y-%m-%d %H:%M'),
            ]
            for order in recent_orders
        ],
    }

    pending_sellers = (
        SellerProfile.objects.filter(approval_status='pending')
        .select_related('user')
        .order_by('created_at')[:10]
    )
    context["table_pending_sellers"] = {
        "headers": ["Store", "Owner", "Location", "Submitted"],
        "rows": [
            [
                seller.store_name,
                seller.user.get_full_name() or seller.user.username,
                seller.location or '—',
                seller.created_at.strftime('%Y-%m-%d'),
            ]
            for seller in pending_sellers
        ],
    }

    return context
