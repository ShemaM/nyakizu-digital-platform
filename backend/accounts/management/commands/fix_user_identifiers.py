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

Same fix logic is also available as admin actions ("Fix blank usernames" /
"Fix blank store names" on the Users / Seller stores admin pages) for
anyone who can reach /admin/ but not a shell or the database directly.
"""

from django.core.management.base import BaseCommand

from accounts.identifier_fixes import fix_blank_store_names, fix_blank_usernames


class Command(BaseCommand):
    help = "Backfill blank usernames and seller store names for existing accounts."

    def add_arguments(self, parser):
        parser.add_argument(
            "--apply",
            action="store_true",
            help="Write the fixes. Without this flag, only reports what would change.",
        )

    def handle(self, *args, **options):
        apply = options["apply"]
        mode = "APPLYING" if apply else "DRY RUN (pass --apply to write changes)"
        self.stdout.write(self.style.MIGRATE_HEADING(f"\n=== fix_user_identifiers — {mode} ===\n"))

        user_report = fix_blank_usernames(apply)
        self.stdout.write(f"Users with a blank username: {len(user_report)}")
        for line in user_report:
            self.stdout.write(f"  {line}")

        seller_report = fix_blank_store_names(apply)
        self.stdout.write(f"\nSellers with a blank store name: {len(seller_report)}")
        for line in seller_report:
            self.stdout.write(f"  {line}")

        if not apply and (user_report or seller_report):
            self.stdout.write(self.style.WARNING("\nNo changes written. Re-run with --apply to fix the accounts above."))
        elif not user_report and not seller_report:
            self.stdout.write(self.style.SUCCESS("\nNothing to fix — every account already has a usable username and store name."))
        else:
            self.stdout.write(self.style.SUCCESS("\nDone."))
