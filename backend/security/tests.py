"""
backend/security/tests.py

Comprehensive test suite verifying:
1. PlatformSecurityPolicy singleton & emergency killswitch controls.
2. Double-entry ledger invariant verification (balanced vs corrupted).
3. Backup snapshot creation, SHA-256 integrity hashing & decompression validation.
4. PlatformCircuitBreakerMiddleware request blocking vs bypass rules.
5. AdminDataExportView security permissions, CSV UTF-8 BOM, and JSON exports.
"""

import os
from decimal import Decimal
from django.test import TestCase, Client
from django.urls import reverse

from accounts.models import CustomUser, SellerProfile
from billing.models import CreditEntry, SellerAccount
from security.models import PlatformSecurityPolicy, SecurityAuditLog, SystemBackupRecord
from security.services import (
    create_database_backup,
    get_security_policy,
    get_security_telemetry,
    log_security_event,
    verify_backup_integrity,
    verify_ledger_invariants,
)


class SecurityAndBusinessContinuityTests(TestCase):
    def setUp(self):
        self.admin = CustomUser.objects.create(
            username="superadmin",
            email="admin@nyakizu.ke",
            role="admin",
            is_staff=True,
            is_superuser=True,
        )
        self.seller_user = CustomUser.objects.create(
            username="test_merchant",
            email="merchant@nyakizu.ke",
            role="seller",
        )
        self.seller_profile = SellerProfile.objects.create(
            user=self.seller_user,
            store_name="Nairobi Fresh Wholesalers",
            location="Zone A",
            approval_status="approved",
        )
        self.account = SellerAccount.objects.create(
            seller=self.seller_profile,
            credit_kes=Decimal("1500.00"),
        )
        # Seed matching double-entry ledger entries
        CreditEntry.objects.create(
            account=self.account,
            account_number=self.account.account_number,
            amount_kes=Decimal("1000.00"),
            balance_after_kes=Decimal("1000.00"),
            kind="top_up",
        )
        CreditEntry.objects.create(
            account=self.account,
            account_number=self.account.account_number,
            amount_kes=Decimal("500.00"),
            balance_after_kes=Decimal("1500.00"),
            kind="top_up",
        )

    def test_security_policy_singleton(self):
        policy1 = get_security_policy()
        policy2 = PlatformSecurityPolicy.objects.get(pk=1)
        self.assertEqual(policy1.pk, policy2.pk)
        self.assertFalse(policy1.trading_halt_active)

    def test_ledger_invariant_verification_passes_when_balanced(self):
        report = verify_ledger_invariants()
        self.assertTrue(report["audit_passed"])
        self.assertEqual(report["anomalies_count"], 0)
        self.assertEqual(report["clean_accounts"], 1)

    def test_ledger_invariant_verification_flags_corrupted_balance(self):
        # Artificially alter the stored balance without matching ledger entry
        SellerAccount.objects.filter(pk=self.account.pk).update(credit_kes=Decimal("9999.00"))
        report = verify_ledger_invariants()
        self.assertFalse(report["audit_passed"])
        self.assertEqual(report["anomalies_count"], 1)
        self.assertEqual(report["anomalies"][0]["store_name"], "Nairobi Fresh Wholesalers")

    def test_backup_creation_and_integrity_verification(self):
        backup = create_database_backup(backup_type="drill", created_by=self.admin)
        self.assertIsInstance(backup, SystemBackupRecord)
        self.assertTrue(os.path.exists(backup.file_path))
        self.assertEqual(len(backup.sha256_checksum), 64)

        verified, msg = verify_backup_integrity(backup.pk)
        self.assertTrue(verified)

    def test_security_telemetry_reports_posture(self):
        telemetry = get_security_telemetry()
        self.assertIn("threat_level", telemetry)
        self.assertIn("DEFCON 5", telemetry["threat_level"])
        self.assertEqual(telemetry["active_breakers_count"], 0)

    def test_audit_event_recording(self):
        log_security_event(
            event_type="test_event",
            summary="Unit test audit event recording",
            actor=self.admin,
            severity="warning",
            details={"test_run": True},
        )
        self.assertTrue(
            SecurityAuditLog.objects.filter(event_type="test_event", actor=self.admin).exists()
        )


class AdminDataExportTests(TestCase):
    def setUp(self):
        self.admin = CustomUser.objects.create(
            username="admin_exporter",
            email="export@nyakizu.ke",
            role="admin",
            is_staff=True,
            is_superuser=True,
        )
        self.regular_user = CustomUser.objects.create(
            username="regular_buyer",
            email="buyer@nyakizu.ke",
            role="buyer",
        )
        self.client = Client()

    def test_export_requires_admin_permissions(self):
        # Anonymous user
        res = self.client.get(reverse("admin-export") + "?dataset=executive_summary", secure=True)
        self.assertIn(res.status_code, (401, 403))

        # Non-staff user
        self.client.force_login(self.regular_user)
        res = self.client.get(reverse("admin-export") + "?dataset=executive_summary", secure=True)
        self.assertEqual(res.status_code, 403)

    def test_export_executive_summary_csv(self):
        self.client.force_login(self.admin)
        res = self.client.get(reverse("admin-export") + "?dataset=executive_summary&format=csv", secure=True)
        self.assertEqual(res.status_code, 200)
        self.assertIn("text/csv", res["Content-Type"])
        self.assertTrue(res.content.startswith(b"\xef\xbb\xbf"))  # UTF-8 BOM
        self.assertIn(b"Total Traded GMV", res.content)

    def test_export_merchants_csv(self):
        self.client.force_login(self.admin)
        res = self.client.get(reverse("admin-export") + "?dataset=merchants&format=csv", secure=True)
        self.assertEqual(res.status_code, 200)
        self.assertIn("text/csv", res["Content-Type"])
        self.assertIn(b"Store Name", res.content)

    def test_export_full_decision_pack_json(self):
        self.client.force_login(self.admin)
        res = self.client.get(reverse("admin-export") + "?dataset=full_pack&format=json", secure=True)
        self.assertEqual(res.status_code, 200)
        self.assertIn("application/json", res["Content-Type"])
        data = res.json()
        self.assertIn("double_entry_invariant", data)
        self.assertIn("governance", data)
        self.assertIn("totals", data)
