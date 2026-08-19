"""
management/commands/send_debt_reminders.py

Meant to be triggered once a day by the hosting platform's own cron
(Render/Railway both offer this) — deliberately not Celery beat or any
other always-running scheduler process, since this is the only job in the
whole project that needs to run on a timer and a second long-lived worker
process is a real ongoing cost for one daily task.

Cadence per debt (a "debt" = an order with status "debt_active" and an
expected_payment_date the buyer or seller set):
  - 2 days before the date: one reminder.
  - On the date itself: one reminder.
  - Once it's passed: a reminder every 3 days until the debt clears or
    someone sets a new date (setting a new date resets the clock — see
    OrderDetailView.perform_update).
last_debt_reminder_at is a plain date (not datetime) so re-running this
command twice in the same day never double-sends.

Usage: python manage.py send_debt_reminders
"""

from django.core.management.base import BaseCommand
from django.utils import timezone

from orders.models import Order
from orders.notifications import send_debt_date_reminder_email
from nyakizu.push import send_push_notification


def _push_body(store, order, days_until):
    if days_until > 0:
        return f"You said you'd pay {store} KES {order.balance} soon."
    if days_until == 0:
        return f"Today's the day you planned to pay {store}."
    return f"A note about your payment to {store} — no rush, just keeping records."


class Command(BaseCommand):
    help = "Send the day's debt-payment-date reminders (email + push) to buyers who set an expected payment date."

    def handle(self, *args, **options):
        today = timezone.now().date()
        debts = Order.objects.filter(
            status="debt_active",
            expected_payment_date__isnull=False,
        ).select_related("buyer", "seller")

        sent = 0
        for order in debts:
            if order.last_debt_reminder_at == today:
                continue

            days_until = (order.expected_payment_date - today).days

            should_send = False
            if days_until in (2, 0):
                should_send = True
            elif days_until < 0:
                should_send = (
                    order.last_debt_reminder_at is None
                    or (today - order.last_debt_reminder_at).days >= 3
                )

            if not should_send:
                continue

            send_debt_date_reminder_email(order, days_until)

            if order.seller:
                try:
                    store = order.seller.seller_profile.store_name
                except Exception:
                    store = order.seller.get_full_name() or order.seller.username
                send_push_notification(
                    order.buyer,
                    title="Nyakizu",
                    body=_push_body(store, order, days_until),
                    url=f"/buyer/orders/{order.id}/",
                    tag=f"debt-{order.id}",
                )

            order.last_debt_reminder_at = today
            order.save(update_fields=["last_debt_reminder_at"])
            sent += 1

        self.stdout.write(self.style.SUCCESS(f"Sent {sent} debt reminder(s) out of {debts.count()} open debt(s) with a date set."))
