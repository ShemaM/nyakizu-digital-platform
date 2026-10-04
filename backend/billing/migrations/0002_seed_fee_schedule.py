"""
Seeds the starting fee schedule from docs/BILLING_SPEC.md §3. Idempotent: only
creates a row if none exists yet, so it never overwrites a rate an admin has
already edited.
"""

from django.db import migrations


def forwards(apps, schema_editor):
    FeeSchedule = apps.get_model("billing", "FeeSchedule")
    if not FeeSchedule.objects.exists():
        FeeSchedule.objects.create(
            rate_percent="0.500", round_to_kes=5,
            min_fee_kes="10.00", max_fee_kes="250.00",
            free_orders_allowance=3,
        )


class Migration(migrations.Migration):

    dependencies = [
        ("billing", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
