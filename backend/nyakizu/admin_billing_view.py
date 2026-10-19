"""Main-admin billing history API for the company management workspace."""

from datetime import datetime, time, timedelta

from django.db.models import Q
from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from billing.models import CreditEntry, Payment
from .management_reporting import build_revenue_report
from .management_permissions import IsMainAdmin


class AdminBillingPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


def _date_bounds(request):
    start_raw = request.query_params.get("date_from")
    end_raw = request.query_params.get("date_to")
    start_date = parse_date(start_raw) if start_raw else None
    end_date = parse_date(end_raw) if end_raw else None
    if start_raw and not start_date:
        raise ValidationError({"date_from": "Use an ISO date such as 2026-10-01."})
    if end_raw and not end_date:
        raise ValidationError({"date_to": "Use an ISO date such as 2026-10-31."})
    if start_date and end_date and end_date < start_date:
        raise ValidationError({"date_to": "End date must be on or after start date."})

    bounds = {}
    if start_date:
        bounds["created_at__gte"] = timezone.make_aware(datetime.combine(start_date, time.min))
    if end_date:
        bounds["created_at__lt"] = timezone.make_aware(datetime.combine(end_date + timedelta(days=1), time.min))
    return bounds


def _paginate(queryset, request):
    paginator = AdminBillingPagination()
    page = paginator.paginate_queryset(queryset, request)
    return paginator, page


def _seller_name(account):
    if not account or not account.seller_id:
        return "Seller account unavailable"
    profile = account.seller
    return profile.store_name or profile.user.get_full_name() or profile.user.username


class AdminBillingHistoryView(APIView):
    """GET /api/admin/billing/ — separate immutable ledger and M-Pesa history."""

    permission_classes = [IsMainAdmin]

    def get(self, request):
        search = (request.query_params.get("search") or "").strip()
        entry_kind = request.query_params.get("kind")
        payment_status = request.query_params.get("payment_status")
        date_bounds = _date_bounds(request)

        entries = CreditEntry.objects.select_related(
            "account__seller__user", "order_fee__order", "payment", "created_by"
        ).filter(**date_bounds)
        payments = Payment.objects.select_related("account__seller__user").filter(**date_bounds)

        valid_kinds = {value for value, _ in CreditEntry.KIND_CHOICES}
        if entry_kind:
            if entry_kind not in valid_kinds:
                raise ValidationError({"kind": "Unknown credit ledger entry type."})
            entries = entries.filter(kind=entry_kind)

        valid_payment_statuses = {value for value, _ in Payment.STATUS_CHOICES}
        if payment_status:
            if payment_status not in valid_payment_statuses:
                raise ValidationError({"payment_status": "Unknown payment status."})
            payments = payments.filter(status=payment_status)

        if search:
            entry_search = (
                Q(account_number__icontains=search)
                | Q(note__icontains=search)
                | Q(account__seller__store_name__icontains=search)
                | Q(account__seller__user__email__icontains=search)
            )
            if search.isdecimal():
                entry_search |= Q(order_fee__order_id=int(search))
            entries = entries.filter(entry_search)
            payments = payments.filter(
                Q(reference__icontains=search)
                | Q(phone__icontains=search)
                | Q(account__account_number__icontains=search)
                | Q(account__seller__store_name__icontains=search)
                | Q(account__seller__user__email__icontains=search)
            )

        entry_paginator, entry_page = _paginate(entries.order_by("-created_at", "-id"), request)
        payment_paginator, payment_page = _paginate(payments.order_by("-created_at", "-id"), request)

        ledger_results = [
            {
                "id": item.id,
                "created_at": item.created_at,
                "account_number": item.account_number,
                "seller": _seller_name(item.account),
                "kind": item.kind,
                "amount_kes": f"{item.amount_kes:.2f}",
                "balance_after_kes": f"{item.balance_after_kes:.2f}",
                "order_id": item.order_fee.order_id if item.order_fee_id else None,
                "payment_reference": item.payment.reference if item.payment_id else None,
                "note": item.note,
                "created_by": item.created_by.get_full_name() or item.created_by.username if item.created_by_id else None,
            }
            for item in entry_page
        ]
        payment_results = [
            {
                "id": item.id,
                "created_at": item.created_at,
                "reference": item.reference,
                "account_number": item.account.account_number if item.account_id else None,
                "seller": _seller_name(item.account),
                "amount_kes": f"{item.amount_kes:.2f}",
                "status": item.status,
                "phone_masked": f"••••{item.phone[-3:]}" if item.phone else "—",
            }
            for item in payment_page
        ]

        response = Response({
            "revenue": build_revenue_report(),
            "ledger": {
                "count": entry_paginator.page.paginator.count,
                "num_pages": entry_paginator.page.paginator.num_pages,
                "page": entry_paginator.page.number,
                "results": ledger_results,
            },
            "payments": {
                "count": payment_paginator.page.paginator.count,
                "num_pages": payment_paginator.page.paginator.num_pages,
                "page": payment_paginator.page.number,
                "results": payment_results,
            },
        })
        response["Cache-Control"] = "private, no-store"
        return response
