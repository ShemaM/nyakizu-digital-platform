"""
Check that every seller's credit balance equals the sum of their ledger entries.

They always should: credit only ever moves through services.apply_credit_change,
which writes an entry each time. A mismatch means credit was changed some other
way (a direct database edit, a bug). Exits with an error if any account is off,
so it can run from Heroku Scheduler and raise an alert.

Usage:
    python manage.py check_billing_ledger
"""

from django.core.management.base import BaseCommand, CommandError

from billing.models import SellerAccount
from billing.services import ledger_mismatch


class Command(BaseCommand):
    help = "Verify every SellerAccount's credit_kes equals the sum of its credit ledger entries."

    def handle(self, *args, **options):
        bad = []
        checked = 0
        for account in SellerAccount.objects.all().iterator():
            checked += 1
            difference = ledger_mismatch(account)
            if difference is not None:
                bad.append(f"{account.account_number}: credit is off by KES {difference} compared with its ledger")

        if bad:
            raise CommandError("Ledger mismatch on %d of %d account(s):\n  %s" % (len(bad), checked, "\n  ".join(bad)))
        self.stdout.write(f"Ledger OK: {checked} account(s) reconcile.")
