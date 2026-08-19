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
        "Your order is ready. Please arrange payment with the seller.",
    ),
    "debt_active": (
        "Payment received. Balance remaining",
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


def send_payment_reminder_email(order):
    """Email the buyer that the seller is asking for the rest of what they owe (best-effort)."""
    if not order.buyer.email:
        return
    store = _seller_store_name(order)
    send_mail_async(
        subject=f"Nyakizu: {store} is asking for the balance on order #{order.id}",
        message=(
            f"{store} wants to remind you: order #{order.id} still has KES {order.balance} owing.\n\n"
            "Please pay via M-Pesa, then tell us the code from your order page.\n\n"
            f"See your order: {_frontend_base_url()}/buyer/orders/{order.id}/"
        ),
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
        recipient_list=[order.buyer.email],
    )


def send_debt_date_reminder_email(order, days_until):
    """
    Nudge the buyer about the payment date they set for themselves — never
    a demand. days_until is (expected_payment_date - today): positive means
    it's coming up, 0 means today, negative means it's passed. Framed purely
    as "we're keeping a note of what you told us", the same trust-first tone
    as the rest of the debt language in this app ("debts can be corrected,
    never erased") — this is bookkeeping between people who already trust
    each other, not a collections notice.
    """
    if not order.buyer.email:
        return
    store = _seller_store_name(order)
    date_str = order.expected_payment_date.strftime("%d %b") if order.expected_payment_date else ""

    if days_until is not None and days_until > 0:
        subject = "A note about your payment"
        opening = f"Just keeping our records straight. You told us you'd pay {store} KES {order.balance} on {date_str}."
    elif days_until == 0:
        subject = "Today's the day you planned to pay"
        opening = f"Just a friendly note. Today is the day you told us you'd pay {store} KES {order.balance}."
    else:
        subject = "A note about your payment"
        opening = f"This is only for our records, not a demand. You told us you'd pay {store} KES {order.balance} by {date_str}."

    send_mail_async(
        subject=f"Nyakizu: {subject}",
        message=(
            f"{opening}\n\n"
            "No need to reply. If your plans changed, you can set a new date anytime from your order page. "
            "There's no penalty for updating it.\n\n"
            f"See your order: {_frontend_base_url()}/buyer/orders/{order.id}/"
        ),
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
        recipient_list=[order.buyer.email],
    )


def send_payment_claim_seller_email(order, claim):
    """Email the seller that the buyer says they've paid (best-effort)."""
    if not order.seller or not order.seller.email:
        return
    buyer_name = order.buyer.get_full_name() or order.buyer.username
    send_mail_async(
        subject="Nyakizu: Buyer says they've paid",
        message=(
            f"{buyer_name} says they sent KES {claim.amount} for order #{order.id}. "
            f"M-Pesa code: {claim.reference}\n\n"
            "Check your M-Pesa messages, then record the payment in the app.\n\n"
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
