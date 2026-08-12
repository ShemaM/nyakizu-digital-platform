"""
management/commands/fix_user_identifiers.py

Every current signup path (RegisterSerializer, allauth's Google adapter)
already requires a non-blank, unique username, and seller onboarding
already requires a non-blank store_name — so this is a defensive audit,
not a fix for a known live bug. It exists to catch anything that slipped
through outside those paths (a manual DB edit, an old data migration,
a row created directly via the Django admin/shell).

Usage:
    python manage.py fix_user_identifiers            # report only, no writes
    python manage.py fix_user_identifiers --apply     # write the backfilled values
"""

import re

from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Q


def _slug_base(*candidates: str) -> str:
    """First non-empty candidate, lowercased and squashed to [a-z0-9_]."""
    for candidate in candidates:
        cleaned = re.sub(r"[^a-z0-9]+", "_", (candidate or "").lower()).strip("_")
        if cleaned:
            return cleaned
    return "user"


class Command(BaseCommand):
    help = "Backfill blank usernames and seller store names for existing accounts."

    def add_arguments(self, parser):
        parser.add_argument(
            "--apply",
            action="store_true",
            help="Write the fixes. Without this flag, only reports what would change.",
        )

    def handle(self, *args, **options):
        from accounts.models import CustomUser, SellerProfile

        apply = options["apply"]
        mode = "APPLYING" if apply else "DRY RUN (pass --apply to write changes)"
        self.stdout.write(self.style.MIGRATE_HEADING(f"\n=== fix_user_identifiers — {mode} ===\n"))

        taken_usernames = set(
            CustomUser.objects.exclude(username="").values_list("username", flat=True)
        )

        broken_users = CustomUser.objects.filter(Q(username__isnull=True) | Q(username=""))
        self.stdout.write(f"Users with a blank username: {broken_users.count()}")
        for user in broken_users:
            base = _slug_base(user.email.split("@")[0] if user.email else "", user.get_full_name())
            candidate = base
            n = 1
            while candidate in taken_usernames:
                n += 1
                candidate = f"{base}_{n}"
            taken_usernames.add(candidate)

            self.stdout.write(f"  user #{user.id} ({user.email or 'no email'}) -> username {candidate!r}")
            if apply:
                with transaction.atomic():
                    user.username = candidate
                    user.save(update_fields=["username"])

        broken_sellers = SellerProfile.objects.filter(Q(store_name__isnull=True) | Q(store_name="")).select_related("user")
        self.stdout.write(f"\nSellers with a blank store name: {broken_sellers.count()}")
        for seller in broken_sellers:
            owner = seller.user
            name = owner.get_full_name() or owner.username or "Nyakizu Seller"
            candidate = f"{name}'s Store"

            self.stdout.write(f"  seller #{seller.id} (user: {owner.username}) -> store_name {candidate!r}")
            if apply:
                with transaction.atomic():
                    seller.store_name = candidate
                    seller.save(update_fields=["store_name"])

        if not apply and (broken_users.exists() or broken_sellers.exists()):
            self.stdout.write(self.style.WARNING("\nNo changes written. Re-run with --apply to fix the accounts above."))
        elif not broken_users.exists() and not broken_sellers.exists():
            self.stdout.write(self.style.SUCCESS("\nNothing to fix — every account already has a usable username and store name."))
        else:
            self.stdout.write(self.style.SUCCESS("\nDone."))
