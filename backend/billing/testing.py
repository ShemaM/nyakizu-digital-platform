"""Helpers shared by the billing tests."""

from decimal import Decimal

from accounts.models import BuyerSellerRelationship, CustomUser, SellerProfile
from billing.models import SellerAccount
from orders.models import Order


def make_seller(n, approval_status="approved"):
    # create(), not create_user(): password hashing is slow and irrelevant here.
    user = CustomUser.objects.create(username=f"seller{n}", email=f"seller{n}@example.com", role="seller")
    return SellerProfile.objects.create(user=user, store_name=f"Store {n}", approval_status=approval_status)


def make_buyer(name):
    return CustomUser.objects.create(
        username=f"buyer_{name}", email=f"buyer_{name}@example.com", role="buyer", is_email_verified=True
    )


def approve_buyer(seller, buyer):
    BuyerSellerRelationship.objects.create(buyer=buyer, seller=seller, status="approved")
    return buyer


def make_order(seller, buyer=None, total="1000.00", status="submitted"):
    """A plain Order row, no items — enough for anything that only reads total_price/final_total/status/seller/buyer."""
    return Order.objects.create(
        buyer=buyer or make_buyer(f"o{Order.objects.count()}"),
        seller=seller.user,
        status=status,
        total_price=Decimal(str(total)),
        final_total=Decimal(str(total)) if status not in ("submitted", "sourcing") else None,
    )


def set_account(account, **fields):
    """Set fields straight in the database (bypassing save()) and reload the instance."""
    SellerAccount.objects.filter(pk=account.pk).update(**fields)
    account.refresh_from_db()
    return account
