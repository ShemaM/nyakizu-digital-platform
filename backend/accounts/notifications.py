"""
accounts/notifications.py

Email hooks for account-lifecycle events that need someone's attention:
a new buyer or seller joining (admins), and a buyer asking a seller for
trusted access (that seller). Kept separate from views.py so both the
REST views and django-allauth's Google-signup adapter
(accounts/adapters.py) can call the same logic without importing view
classes.
"""

from django.conf import settings
from django.urls import reverse

from nyakizu.emailing import send_mail_async
from .models import CustomUser


def _admin_url(request, viewname, query=""):
    """
    Absolute URL into the Django admin, built from the current request so
    it reflects whatever host actually served it (Render, local, ...).
    Falls back to a bare path if no request is available (e.g. a
    management command triggering this outside a request/response cycle).
    """
    path = reverse(viewname) + query
    if request is not None:
        return request.build_absolute_uri(path)
    return path


def _frontend_url(path: str) -> str:
    base = getattr(settings, "FRONTEND_VERIFY_BASE_URL", "http://localhost:3000")
    return f"{base.rstrip('/')}/{path.lstrip('/')}"


def notify_admins_new_signup(user: CustomUser, request=None) -> None:
    """
    Alert every active staff account whenever a new buyer or seller
    joins — regardless of whether they signed up through the regular
    form (RegisterView) or Google (SocialAccountAdapter), both of which
    call this.
    """
    staff_emails = list(
        CustomUser.objects.filter(is_staff=True, is_active=True)
        .exclude(email="")
        .values_list("email", flat=True)
    )
    if not staff_emails:
        return

    display_name = user.get_full_name() or user.username
    lines = [
        f"A new {user.role} just joined Nyakizu Digital Market.",
        "",
        f"Name:  {display_name}",
        f"Email: {user.email}",
        f"Phone: {user.phone_number or '—'}",
    ]

    seller_profile = getattr(user, "seller_profile", None)
    if user.role == "seller" and seller_profile is not None:
        lines += [
            f"Store:    {seller_profile.store_name}",
            f"Location: {seller_profile.location or '—'}",
            "",
            "This store is waiting for your approval:",
            _admin_url(
                request,
                "admin:accounts_sellerprofile_changelist",
                "?approval_status__exact=pending",
            ),
        ]
        subject = f"New seller signed up: {seller_profile.store_name}"
    else:
        lines += [
            "",
            "See this member in the admin panel:",
            _admin_url(
                request,
                "admin:accounts_customuser_changelist",
                f"?q={user.username}",
            ),
        ]
        subject = f"New buyer signed up: {display_name}"

    send_mail_async(
        subject=subject,
        message="\n".join(lines),
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
        recipient_list=staff_emails,
    )


def notify_seller_new_access_request(relationship, request=None) -> None:
    """
    Alert the seller when a buyer requests trusted access to their store
    — the gate that lets a buyer place orders with them at all.
    """
    seller_user = relationship.seller.user
    if not seller_user.email:
        return

    buyer = relationship.buyer
    buyer_name = buyer.get_full_name() or buyer.username
    store_name = relationship.seller.store_name

    message = "\n".join([
        f"{buyer_name} wants to become a buyer at your store, \"{store_name}\".",
        "",
        f"Name:  {buyer_name}",
        f"Phone: {buyer.phone_number or '—'}",
        f"Email: {buyer.email}",
        "",
        "Approve or deny this request here:",
        _frontend_url("/seller/dashboard/buyers"),
    ])

    send_mail_async(
        subject=f"{buyer_name} wants to order from {store_name}",
        message=message,
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
        recipient_list=[seller_user.email],
    )
