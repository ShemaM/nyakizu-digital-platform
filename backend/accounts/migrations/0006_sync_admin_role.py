from django.db import migrations


def sync_admin_role(apps, schema_editor):
    CustomUser = apps.get_model('accounts', 'CustomUser')
    CustomUser.objects.filter(is_staff=True).exclude(role='admin').update(role='admin')
    CustomUser.objects.filter(is_superuser=True).exclude(role='admin').update(role='admin')


def noop_reverse(apps, schema_editor):
    # One-way data fix — there's no meaningful "previous role" to restore.
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_buyerstorefollow'),
    ]

    operations = [
        migrations.RunPython(sync_admin_role, noop_reverse),
    ]
