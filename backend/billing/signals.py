import logging

from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from orders.models import OrderStatusEvent

from .services import charge_order_fee, refund_order_fee

logger = logging.getLogger("billing")


@receiver(post_save, sender=OrderStatusEvent)
def charge_or_refund_order_fee(sender, instance, created, raw=False, **kwargs):
    if raw or not created:
        return
    # Trade never stops: whatever goes wrong here must not fail the order update
    # that triggered it (locking a price, cancelling an order).
    try:
        # Only *charging* is switched off before go-live. Refunds always run, so a
        # fee that was already charged can still be given back.
        if instance.status == "locked" and settings.BILLING_CHARGING_ENABLED:
            charge_order_fee(instance.order)
        elif instance.status == "cancelled":
            refund_order_fee(instance.order)
    except Exception:
        logger.exception("Could not update the billing fee for order %s (%s)", instance.order_id, instance.status)
