"""
nyakizu/admin_export_view.py

Executive Data Export API for Leadership Decision Making, Treasury Auditing,
and Business Intelligence ingestion (CSV and JSON).
"""

import csv
import io
import json
from decimal import Decimal

from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from rest_framework.views import APIView

from accounts.models import BuyerProfile, CustomUser, SellerProfile
from billing.models import CreditEntry, OrderFee, Payment, SellerAccount
from orders.models import Order
from products.models import Product
from security.models import SecurityAuditLog, SystemBackupRecord
from security.services import get_security_policy, verify_ledger_invariants
from .management_permissions import IsMainAdmin


class AdminDataExportView(APIView):
    """
    GET /api/admin/export/?dataset=<name>&format=<csv|json>
    Authorized for platform staff and administrators only.
    """

    permission_classes = [IsMainAdmin]

    def perform_content_negotiation(self, request, force=False):
        # Bypass DRF's format negotiation so ?format=csv or ?format=json passes directly to get()
        from rest_framework.renderers import JSONRenderer
        return (JSONRenderer(), "application/json")

    def get(self, request):
        dataset = request.query_params.get("dataset", "executive_summary").lower().strip()
        export_format = request.query_params.get("format", "csv").lower().strip()
        timestamp_str = timezone.now().strftime("%Y%m%d_%H%M%S")

        # ── 1. Executive Summary Dataset ───────────────────────────────────────
        if dataset == "executive_summary":
            all_orders = Order.objects.exclude(status="cancelled")
            total_gmv = sum([o.final_total or o.total_price or Decimal("0") for o in all_orders], Decimal("0"))
            gross_fees = CreditEntry.objects.filter(kind="fee_charged").aggregate(total=models_sum("amount_kes"))["total"] or Decimal("0.00")
            fee_refunds = CreditEntry.objects.filter(kind="fee_refunded").aggregate(total=models_sum("amount_kes"))["total"] or Decimal("0.00")
            topups_total = Payment.objects.filter(status="success").aggregate(total=models_sum("amount_kes"))["total"] or Decimal("0.00")
            seller_float = SellerAccount.objects.filter(credit_kes__gt=0).aggregate(total=models_sum("credit_kes"))["total"] or Decimal("0.00")
            seller_debt = abs(SellerAccount.objects.filter(credit_kes__lt=0).aggregate(total=models_sum("credit_kes"))["total"] or Decimal("0.00"))

            rows = [
                ["Metric", "Value", "Unit / Context"],
                ["Total Traded GMV", f"{total_gmv:.2f}", "KES"],
                ["Total Orders Processed", str(all_orders.count()), "Orders"],
                ["Gross Platform Fees Charged", f"{gross_fees:.2f}", "KES"],
                ["Fee Refunds Processed", f"{fee_refunds:.2f}", "KES"],
                ["Net Platform Fee Revenue", f"{gross_fees - fee_refunds:.2f}", "KES"],
                ["Daraja M-Pesa Top-up Inflow", f"{topups_total:.2f}", "KES"],
                ["Prepaid Seller Escrow Float Pool", f"{seller_float:.2f}", "KES"],
                ["Outstanding Merchant Overdraft Debt", f"{seller_debt:.2f}", "KES"],
                ["Verified Retail Buyers", str(BuyerProfile.objects.count()), "Profiles"],
                ["Approved Wholesale Stores", str(SellerProfile.objects.filter(approval_status="approved").count()), "Stores"],
                ["Pending KYC Store Verifications", str(SellerProfile.objects.filter(approval_status="pending").count()), "Stores"],
                ["Audit Generated At", timezone.now().strftime("%Y-%m-%d %H:%M:%S EAT"), "EAT Timestamp"],
            ]
            filename = f"nyakizu_executive_decision_brief_{timestamp_str}"
            return _export_response(rows, filename, export_format)

        # ── 2. Wholesale Merchants & Liquidity Dataset ────────────────────────
        elif dataset in ("merchants", "sellers"):
            sellers = SellerProfile.objects.select_related("user", "billing_account").order_by("-created_at")
            rows = [
                [
                    "Seller ID",
                    "Store Name",
                    "Operator Full Name",
                    "Email",
                    "Phone Number",
                    "Location / Zone",
                    "Approval Status",
                    "Billing Account #",
                    "Escrow Float Balance (KES)",
                    "Free Orders Used",
                    "Store Created At",
                ]
            ]
            for s in sellers:
                acct = getattr(s, "billing_account", None)
                credit = acct.credit_kes if acct else Decimal("0.00")
                acct_num = acct.account_number if acct else "N/A"
                free_used = acct.free_orders_used if acct else 0
                rows.append([
                    str(s.id),
                    s.store_name or "N/A",
                    s.user.get_full_name() or s.user.username,
                    s.user.email,
                    s.user.phone_number or "N/A",
                    s.location or "N/A",
                    s.approval_status,
                    acct_num,
                    f"{credit:.2f}",
                    str(free_used),
                    s.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                ])
            filename = f"nyakizu_merchant_liquidity_{timestamp_str}"
            return _export_response(rows, filename, export_format)

        # ── 3. Retail Buyers & Debt Aging Dataset ─────────────────────────────
        elif dataset in ("buyers", "debt_aging"):
            buyers = BuyerProfile.objects.select_related("user").order_by("-created_at")
            rows = [
                [
                    "Buyer ID",
                    "Full Name",
                    "Username",
                    "Email",
                    "Phone Number",
                    "Business Demographic",
                    "Location / Area",
                    "Registered At",
                ]
            ]
            for b in buyers:
                rows.append([
                    str(b.id),
                    b.user.get_full_name() or b.user.username,
                    b.user.username,
                    b.user.email,
                    b.user.phone_number or "N/A",
                    b.business_type or "Retailer",
                    b.location or "N/A",
                    b.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                ])
            filename = f"nyakizu_retail_buyers_{timestamp_str}"
            return _export_response(rows, filename, export_format)

        # ── 4. Treasury & Immutable Credit Ledger Dataset ─────────────────────
        elif dataset in ("treasury", "ledger"):
            entries = CreditEntry.objects.select_related("account__seller", "payment").order_by("-created_at")[:1000]
            rows = [
                [
                    "Entry ID",
                    "Account Number",
                    "Store Name",
                    "Entry Kind",
                    "Amount (KES)",
                    "Balance After (KES)",
                    "M-Pesa Reference",
                    "Timestamp (EAT)",
                    "Audit Note",
                ]
            ]
            for e in entries:
                store = e.account.seller.store_name if (e.account and e.account.seller) else "N/A"
                mpesa_ref = e.payment.reference if e.payment else "N/A"
                rows.append([
                    str(e.id),
                    e.account_number,
                    store,
                    e.kind,
                    f"{e.amount_kes:.2f}",
                    f"{e.balance_after_kes:.2f}",
                    mpesa_ref,
                    e.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                    e.note or "",
                ])
            filename = f"nyakizu_credit_ledger_{timestamp_str}"
            return _export_response(rows, filename, export_format)

        # ── 5. Orders & Logistics Fulfillment Dataset ─────────────────────────
        elif dataset in ("orders", "fulfillment"):
            orders = Order.objects.select_related("buyer", "seller__seller_profile").order_by("-created_at")[:1000]
            rows = [
                [
                    "Order Ref",
                    "Buyer Name",
                    "Buyer Phone",
                    "Fulfilling Store",
                    "Status",
                    "Is Flagged Dispute",
                    "Flag Reason",
                    "Final Total (KES)",
                    "Amount Paid (KES)",
                    "Balance Owed (KES)",
                    "Delivery Address",
                    "Created Timestamp",
                ]
            ]
            for o in orders:
                store = o.seller.seller_profile.store_name if (o.seller and hasattr(o.seller, "seller_profile")) else "N/A"
                rows.append([
                    f"#{o.id}",
                    o.buyer.get_full_name() or o.buyer.username,
                    o.buyer.phone_number or "N/A",
                    store,
                    o.status,
                    "YES" if o.is_flagged else "NO",
                    o.flag_reason or "",
                    f"{o.final_total or o.total_price:.2f}",
                    f"{o.amount_paid:.2f}",
                    f"{o.balance:.2f}",
                    o.delivery_address or "",
                    o.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                ])
            filename = f"nyakizu_orders_fulfillment_{timestamp_str}"
            return _export_response(rows, filename, export_format)

        # ── 6. Full Decision Pack (JSON) ──────────────────────────────────────
        elif dataset in ("full_pack", "bi_snapshot"):
            invariant_check = verify_ledger_invariants()
            policy = get_security_policy()

            pack = {
                "system": "Nyakizu Digital Platform Executive MIS",
                "cluster": "NAIROBI-EAST-PROD",
                "exported_at": timezone.now().isoformat(),
                "governance": {
                    "trading_halt": policy.trading_halt_active,
                    "daraja_circuit_breaker": policy.daraja_circuit_breaker_active,
                    "enforcement_freeze": policy.enforcement_freeze_active,
                    "maintenance_mode": policy.maintenance_mode_active,
                },
                "double_entry_invariant": {
                    "audit_passed": invariant_check["audit_passed"],
                    "total_accounts": invariant_check["total_accounts"],
                    "clean_accounts": invariant_check["clean_accounts"],
                    "anomalies_count": invariant_check["anomalies_count"],
                    "gross_float_kes": float(invariant_check["gross_float_kes"]),
                    "gross_debt_kes": float(invariant_check["gross_debt_kes"]),
                },
                "totals": {
                    "orders_count": Order.objects.count(),
                    "buyers_count": BuyerProfile.objects.count(),
                    "sellers_count": SellerProfile.objects.count(),
                    "products_count": Product.objects.count(),
                    "credit_entries_count": CreditEntry.objects.count(),
                    "security_audit_logs": SecurityAuditLog.objects.count(),
                    "backups_count": SystemBackupRecord.objects.count(),
                },
            }
            response = HttpResponse(
                json.dumps(pack, indent=2),
                content_type="application/json; charset=utf-8",
            )
            response["Content-Disposition"] = f'attachment; filename="nyakizu_full_decision_pack_{timestamp_str}.json"'
            return response

        return JsonResponse(
            {
                "error": "Unknown dataset",
                "valid_datasets": [
                    "executive_summary",
                    "merchants",
                    "buyers",
                    "treasury",
                    "orders",
                    "full_pack",
                ],
            },
            status=400,
        )


def models_sum(field_name):
    from django.db.models import DecimalField, Sum, Value
    from django.db.models.functions import Coalesce
    return Coalesce(Sum(field_name), Value(Decimal("0.00")), output_field=DecimalField(max_digits=18, decimal_places=2))


def _export_response(rows, filename, export_format):
    if export_format == "json":
        headers = rows[0]
        data = [dict(zip(headers, row)) for row in rows[1:]]
        response = HttpResponse(
            json.dumps(data, indent=2),
            content_type="application/json; charset=utf-8",
        )
        response["Content-Disposition"] = f'attachment; filename="{filename}.json"'
        return response

    # Default CSV with UTF-8 BOM for Microsoft Excel compatibility
    buffer = io.StringIO()
    buffer.write("\ufeff")  # UTF-8 BOM
    writer = csv.writer(buffer, quoting=csv.QUOTE_MINIMAL)
    for row in rows:
        writer.writerow(row)

    response = HttpResponse(buffer.getvalue(), content_type="text/csv; charset=utf-8")
    response["Content-Disposition"] = f'attachment; filename="{filename}.csv"'
    return response
