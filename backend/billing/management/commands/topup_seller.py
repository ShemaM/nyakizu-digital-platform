"""
Try a real M-Pesa top-up from the command line, end to end, before any screen
exists for it: sends the PIN prompt, then asks Daraja every few seconds until
the payment settles or time runs out, and prints the seller's new balance.

With DARAJA_ENV=sandbox this only exercises Safaricom's test environment. With
DARAJA_ENV=production it moves real money, so it refuses to run unless you add
--confirm-live.

Usage:
    python manage.py topup_seller --seller 1 --amount 50 --phone 0712345678
"""

import time

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from accounts.models import SellerProfile
from billing.daraja import DarajaError, DarajaNotConfigured
from billing.payments import normalize_phone, settle_payment, start_topup
from billing.services import ensure_account


class Command(BaseCommand):
    help = "Start an M-Pesa top-up for a seller and wait for it to settle."

    def add_arguments(self, parser):
        parser.add_argument("--seller", type=int, required=True, help="SellerProfile id.")
        parser.add_argument("--amount", type=int, required=True, help="Whole KES.")
        parser.add_argument("--phone", required=True, help="Safaricom number, e.g. 0712345678.")
        parser.add_argument("--wait", type=int, default=90, help="Seconds to wait for the payment (default 90).")
        parser.add_argument("--confirm-live", action="store_true", help="Required when DARAJA_ENV=production (real money).")

    def handle(self, *args, **options):
        if settings.DARAJA_ENV == "production" and not options["confirm_live"]:
            raise CommandError("DARAJA_ENV is 'production' and this would move real money. Add --confirm-live if you mean it.")

        phone = normalize_phone(options["phone"])
        if phone is None:
            raise CommandError("That is not a Kenyan mobile number.")
        try:
            seller = SellerProfile.objects.select_related("user").get(pk=options["seller"])
        except SellerProfile.DoesNotExist:
            raise CommandError(f"No seller with id {options['seller']}.")

        account = ensure_account(seller)
        try:
            payment = start_topup(account, amount=options["amount"], phone=phone)
        except DarajaNotConfigured:
            raise CommandError("Daraja credentials are not set in this environment.")
        except DarajaError as exc:
            raise CommandError(f"Daraja would not start the payment: {exc}")

        self.stdout.write(f"Started {payment.reference} ({settings.DARAJA_ENV}). Check the phone and enter the PIN...")
        deadline = time.monotonic() + options["wait"]
        while time.monotonic() < deadline:
            time.sleep(3)
            try:
                payment = settle_payment(payment.reference)
            except DarajaError as exc:
                self.stdout.write(f"  could not ask Daraja yet ({exc}); retrying")
                continue
            if payment.status != "initiated":
                break

        account.refresh_from_db()
        self.stdout.write(f"Payment is {payment.status}. Balance: KES {account.credit_kes}.")
        if payment.status == "initiated":
            self.stdout.write("Still waiting. It will be credited when Daraja confirms it (its callback, or the app's status check).")
