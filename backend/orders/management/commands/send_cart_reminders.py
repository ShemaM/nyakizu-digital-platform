"""
management/commands/send_cart_reminders.py

Meant to be triggered periodically (e.g. hourly) by Heroku Scheduler, the
same way send_debt_reminders.py is meant to be — no Celery beat, this is
just another short-lived job on a timer.

Emails a buyer once when their CartDraft has sat untouched for 24h+.
reminder_sent_at guards against double-sending on repeat runs; it's
cleared on every genuine edit (see CartDraftView.put), so touching the
cart again after a reminder re-arms it for a later nudge instead of going
silent forever after the first email.

Usage: python manage.py send_cart_reminders
"""

from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from orders.models import CartDraft
from orders.notifications import send_abandoned_cart_email

ABANDONED_AFTER = timedelta(hours=24)


class Command(BaseCommand):
    help = "Email buyers whose cart has sat untouched for 24h+ (python manage.py send_cart_reminders)."

    def handle(self, *args, **options):
        cutoff = timezone.now() - ABANDONED_AFTER
        stale = CartDraft.objects.filter(
            updated_at__lt=cutoff,
            reminder_sent_at__isnull=True,
        ).select_related("buyer", "seller")

        sent = 0
        for draft in stale:
            send_abandoned_cart_email(draft)
            draft.reminder_sent_at = timezone.now()
            draft.save(update_fields=["reminder_sent_at"])
            sent += 1

        self.stdout.write(self.style.SUCCESS(f"Sent {sent} abandoned-cart reminder(s)."))
