"""
security/management/commands/backup_database.py

Command-line and cron runner to generate cryptographic, compressed
database backup snapshots for business continuity & disaster recovery (BC/DR).
"""

from django.core.management.base import BaseCommand
from security.services import create_database_backup, verify_backup_integrity


class Command(BaseCommand):
    help = "Generate an automated compressed database snapshot with cryptographic SHA-256 validation."

    def add_arguments(self, parser):
        parser.add_argument(
            '--type',
            default='scheduled_daily',
            choices=['manual', 'scheduled_daily', 'pre_deployment', 'disaster_recovery_drill'],
            help="Type classification for the backup record.",
        )
        parser.add_argument(
            '--verify',
            action='store_true',
            help="Immediately verify cryptographic integrity of the created snapshot.",
        )

    def handle(self, *args, **options):
        backup_type = options['type']
        verify = options['verify']

        self.stdout.write(self.style.NOTICE(f"Initiating {backup_type} database snapshot..."))
        record = create_database_backup(backup_type=backup_type)

        self.stdout.write(
            self.style.SUCCESS(
                f"Backup successful: {record.backup_name} ({record.file_size_bytes / (1024*1024):.2f} MB)"
            )
        )
        self.stdout.write(f"SHA-256: {record.sha256_checksum}")
        self.stdout.write(f"Location: {record.file_path}")

        if verify:
            ok, msg = verify_backup_integrity(record.id)
            if ok:
                self.stdout.write(self.style.SUCCESS(f"Integrity Check: {msg}"))
            else:
                self.stdout.write(self.style.ERROR(f"Integrity Check Failed: {msg}"))

