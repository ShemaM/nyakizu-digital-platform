"""
Check that the Daraja consumer key/secret in the environment work. Read-only:
it only fetches an OAuth token, never sends an STK push. Prints nothing but
whether it worked and which environment (sandbox/production) is configured —
never the credentials themselves.

Usage:
    python manage.py check_daraja
"""

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from billing.daraja import DarajaError, DarajaNotConfigured, get_access_token


class Command(BaseCommand):
    help = "Verify the Daraja consumer key/secret work (read-only)."

    def handle(self, *args, **options):
        try:
            get_access_token()
        except DarajaNotConfigured:
            raise CommandError("DARAJA_CONSUMER_KEY / DARAJA_CONSUMER_SECRET are not set in this environment.")
        except DarajaError as exc:
            raise CommandError(f"Daraja did not accept the request: {exc}")
        self.stdout.write(f"Daraja credentials OK ({settings.DARAJA_ENV} environment).")
