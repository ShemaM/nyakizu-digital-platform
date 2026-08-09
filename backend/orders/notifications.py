"""
orders/notifications.py

Sends the buyer (and, on a brand-new order, the seller) a plain-English
email whenever an order's status changes, and logs the transition to
OrderStatusEvent so the buyer-facing tracker has real per-step timestamps.

Uses send_mail_async (nyakizu/emailing.py) so a slow/unreachable SMTP
server can never block the request that triggered the notification.
"""

from django.conf import settings

from nyakizu.emailing import send_mail_async
from .models import OrderStatusEvent


def _frontend_base_url():
    return getattr(settings, "FRONTEND_VERIFY_BASE_URL", "http://localhost:3000")


def _seller_store_name(order):
    if not order.seller:
        return "the seller"
    try:
        return order.seller.seller_profile.store_name
    except Exception:
        return order.seller.get_full_name() or order.seller.username


# subject, body template — {id}/{store}/{total}/{balance} are filled in per order
BUYER_STATUS_MESSAGES = {
    "submitted": (
        "We got your order",
        "Thank you! {store} has received your order #{id}. They will start packing it soon.",
    ),
    "sourcing": (
        "Your order is being packed",
        "{store} is now packing order #{id}. We will email you again once the price is confirmed.",
    ),
    "locked": (
        "Your order price is confirmed",
        "{store} has confirmed the final price for order #{id}: KES {total}. "
        "Your order is ready — please arrange payment with the seller.",
    ),
    "debt_active": (
        "Payment received — balance remaining",
        "Thank you for your payment on order #{id}. You still owe KES {balance} to {store}.",
    ),
    "cleared": (
        "Order fully paid",
        "Order #{id} from {store} is fully paid. Thank you for trading with Nyakizu!",
    ),
    "cancelled": (
        "Order cancelled",
        "Order #{id} from {store} has been cancelled.",
    ),
}


def send_order_status_email(order, status):
    """Email the buyer about their order's new status (best-effort)."""
    template = BUYER_STATUS_MESSAGES.get(status)
    if not template or not order.buyer.email:
        return

    subject, body_template = template
    body = body_template.format(
        id=order.id,
        store=_seller_store_name(order),
        total=order.final_total if order.final_total is not None else order.total_price,
        balance=order.balance,
    )
    send_mail_async(
        subject=f"Nyakizu: {subject}",
        message=f"{body}\n\nSee your order: {_frontend_base_url()}/buyer/orders/{order.id}/",
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
        recipient_list=[order.buyer.email],
    )


def send_new_order_seller_email(order):
    """Email the seller that a new order landed (best-effort)."""
    if not order.seller or not order.seller.email:
        return
    buyer_name = order.buyer.get_full_name() or order.buyer.username
    send_mail_async(
        subject="Nyakizu: You have a new order",
        message=(
            f"{buyer_name} placed order #{order.id} with your store. "
            "Please review it and start packing.\n\n"
            f"See the order: {_frontend_base_url()}/seller/dashboard/orders/{order.id}/fulfill/"
        ),
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
        recipient_list=[order.seller.email],
    )


def record_status_event(order, status):
    """Log a status transition and fire the notification(s) that go with it."""
    OrderStatusEvent.objects.create(order=order, status=status)
    send_order_status_email(order, status)
    if status == "submitted":
        send_new_order_seller_email(order)
