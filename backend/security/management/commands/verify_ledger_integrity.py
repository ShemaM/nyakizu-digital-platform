"""
security/management/commands/verify_ledger_integrity.py

Audits all seller escrow balances against immutable CreditEntry rows.
"""

from django.core.management.base import BaseCommand
from security.services import verify_ledger_invariants


class Command(BaseCommand):
    help = "Run an algorithmic and cryptographic audit of all seller escrow balances against ledger entries."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Running Double-Entry Ledger Invariant Audit..."))
        result = verify_ledger_invariants()

        self.stdout.write(f"Total Accounts Audited: {result['total_accounts']}")
        self.stdout.write(f"Verified Clean Accounts: {result['clean_accounts']}")
        self.stdout.write(f"Gross Float Pool: KES {result['gross_float_kes']:,.2f}")
        self.stdout.write(f"Gross Merchant Debt: KES {result['gross_debt_kes']:,.2f}")

        if result['audit_passed']:
            self.stdout.write(
                self.style.SUCCESS("AUDIT PASSED: 0 balance discrepancies detected. Ledger integrity verified 100%.")
            )
        else:
            self.stdout.write(
                self.style.ERROR(
                    f"CRITICAL WARNING: {result['anomalies_count']} discrepancy anomaly(ies) detected!"
                )
            )
            for anom in result['anomalies']:
                self.stdout.write(
                    self.style.WARNING(
                        f" - Account {anom['account_number']} ({anom['store_name']}): "
                        f"Stored={anom['stored_balance']}, Ledger={anom['ledger_sum']}, Delta={anom['discrepancy']}"
                    )
                )

