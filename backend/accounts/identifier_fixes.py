"""
accounts/identifier_fixes.py

Shared logic for backfilling blank usernames / seller store names. Used by
both `manage.py fix_user_identifiers` (for anyone with DB/shell access) and
the "Fix blank usernames" / "Fix blank store names" admin actions on
CustomUserAdmin / SellerProfileAdmin (for admin-only access — no shell or
DB credentials needed, since it runs as a normal admin action click).
"""

import re


def _slug_base(*candidates: str) -> str:
    """First non-empty candidate, lowercased and squashed to [a-z0-9_]."""
    for candidate in candidates:
        cleaned = re.sub(r"[^a-z0-9]+", "_", (candidate or "").lower()).strip("_")
        if cleaned:
            return cleaned
    return "user"


def fix_blank_usernames(apply: bool) -> list[str]:
    from django.db import transaction
    from django.db.models import Q

    from .models import CustomUser

    report = []
    taken_usernames = set(
        CustomUser.objects.exclude(username="").values_list("username", flat=True)
    )
    broken_users = CustomUser.objects.filter(Q(username__isnull=True) | Q(username=""))

    for user in broken_users:
        base = _slug_base(user.email.split("@")[0] if user.email else "", user.get_full_name())
        candidate = base
        n = 1
        while candidate in taken_usernames:
            n += 1
            candidate = f"{base}_{n}"
        taken_usernames.add(candidate)

        report.append(f"user #{user.id} ({user.email or 'no email'}) -> username {candidate!r}")
        if apply:
            with transaction.atomic():
                user.username = candidate
                user.save(update_fields=["username"])

    return report


def fix_blank_store_names(apply: bool) -> list[str]:
    from django.db import transaction
    from django.db.models import Q

    from .models import SellerProfile

    report = []
    broken_sellers = SellerProfile.objects.filter(
        Q(store_name__isnull=True) | Q(store_name="")
    ).select_related("user")

    for seller in broken_sellers:
        owner = seller.user
        name = owner.get_full_name() or owner.username or "Nyakizu Seller"
        candidate = f"{name}'s Store"

        report.append(f"seller #{seller.id} (user: {owner.username}) -> store_name {candidate!r}")
        if apply:
            with transaction.atomic():
                seller.store_name = candidate
                seller.save(update_fields=["store_name"])

    return report
