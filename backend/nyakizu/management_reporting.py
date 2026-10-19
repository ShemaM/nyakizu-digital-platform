"""Shared company reporting queries.

Financial figures here are operational reporting measures, not a general
ledger or a substitute for finance-approved revenue recognition.
"""

from datetime import timedelta
from decimal import Decimal

from django.db.models import DecimalField, Q, Sum, Value
from django.db.models.functions import Coalesce
from django.utils import timezone

from billing.models import CreditEntry, OrderFee, Payment, SellerAccount
from orders.models import Order


MONEY_FIELD = DecimalField(max_digits=18, decimal_places=2)


def _sum(queryset, field, *, condition=None):
    if condition is not None:
        queryset = queryset.filter(condition)
    return queryset.aggregate(
        value=Coalesce(Sum(field), Value(Decimal("0.00")), output_field=MONEY_FIELD)
    )["value"]


def _money(value):
    return f"{value:.2f}"


def build_revenue_report(now=None):
    """Return distinct seller order value, platform fees, top-ups, and balances.

    The three free orders are represented by waived ``OrderFee`` rows. Fee
    revenue is derived from the append-only credit ledger, which records the
    actual fee debit/refund movements; successful top-ups are kept separate.
    """
    now = now or timezone.now()
    period_start = now - timedelta(days=30)

    all_orders = Order.objects.exclude(status="cancelled")
    recent_orders = all_orders.filter(created_at__gte=period_start, created_at__lt=now)
    order_value = lambda qs: _sum(
        qs.annotate(_order_value=Coalesce("final_total", "total_price", output_field=MONEY_FIELD)),
        "_order_value",
    )

    entries = CreditEntry.objects.all()
    recent_entries = entries.filter(created_at__gte=period_start, created_at__lt=now)

    def fee_totals(queryset):
        gross = -_sum(queryset, "amount_kes", condition=Q(kind="fee_charged"))
        refunds = _sum(queryset, "amount_kes", condition=Q(kind="fee_refunded"))
        return {
            "gross_fees_kes": _money(gross),
            "fee_refunds_kes": _money(refunds),
            "net_fees_kes": _money(gross - refunds),
        }

    positive_credit = _sum(
        SellerAccount.objects.all(), "credit_kes", condition=Q(credit_kes__gt=0)
    )
    negative_credit = -_sum(
        SellerAccount.objects.all(), "credit_kes", condition=Q(credit_kes__lt=0)
    )
    successful_payments = Payment.objects.filter(status="success")

    return {
        "currency": "KES",
        "definition": "Platform fees are operational fees charged less fee refunds; seller top-ups are not revenue.",
        "all_time": {
            "seller_order_value_gmv_kes": _money(order_value(all_orders)),
            "platform_fee_revenue": fee_totals(entries),
            "successful_seller_topups_kes": _money(_sum(successful_payments, "amount_kes")),
            "free_orders_waived": OrderFee.objects.filter(status="waived_free").count(),
        },
        "last_30_days": {
            "seller_order_value_gmv_kes": _money(order_value(recent_orders)),
            "platform_fee_revenue": fee_totals(recent_entries),
            "successful_seller_topups_kes": _money(
                _sum(successful_payments.filter(created_at__gte=period_start, created_at__lt=now), "amount_kes")
            ),
            "free_orders_waived": OrderFee.objects.filter(
                status="waived_free", charged_at__gte=period_start, charged_at__lt=now
            ).count(),
        },
        "seller_credit_balances": {
            "unused_credit_liability_kes": _money(positive_credit),
            "seller_receivables_kes": _money(negative_credit),
        },
    }
