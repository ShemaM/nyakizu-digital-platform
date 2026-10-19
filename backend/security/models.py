"""
security/models.py

Enterprise security audit logging, business continuity & disaster recovery (BC/DR)
records, and operational circuit breakers for Nyakizu Digital Platform.
"""

from django.conf import settings
from django.db import models
from django.utils import timezone


class SecurityAuditLog(models.Model):
    """
    Immutable audit trail recording administrative actions, authentication events,
    security policy changes, and financial invariant verifications.
    """

    SEVERITY_CHOICES = [
        ('info', 'INFO - Standard Operational Event'),
        ('warning', 'WARNING - Anomaly or Risk Trigger'),
        ('critical', 'CRITICAL - Security Threat or Invariant Violation'),
    ]

    EVENT_TYPE_CHOICES = [
        ('login_success', 'Admin Authentication Success'),
        ('login_failed', 'Admin Authentication Failure'),
        ('logout', 'Admin Session Terminated'),
        ('circuit_breaker', 'Emergency Circuit Breaker Toggled'),
        ('backup_created', 'Database Backup Snapshot Created'),
        ('backup_verified', 'Database Backup Cryptographically Verified'),
        ('invariant_audit', 'Double-Entry Ledger Invariant Audit'),
        ('kyc_action', 'Merchant KYC Verification Decision'),
        ('escrow_override', 'Manual Escrow Balance Adjustment'),
        ('order_flagged', 'Marketplace Order Escalation Flagged'),
        ('security_violation', 'Perimeter or Authorization Violation'),
        ('system_policy', 'Security Policy Modified'),
    ]

    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='security_audit_logs',
    )
    actor_email = models.CharField(max_length=255, blank=True)
    event_type = models.CharField(max_length=60, choices=EVENT_TYPE_CHOICES, db_index=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='info', db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True, db_index=True)
    user_agent = models.TextField(blank=True)
    resource_type = models.CharField(max_length=100, blank=True)
    resource_id = models.CharField(max_length=100, blank=True)
    summary = models.CharField(max_length=255)
    details = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['event_type', 'created_at']),
            models.Index(fields=['severity', 'created_at']),
            models.Index(fields=['ip_address', 'created_at']),
        ]
        verbose_name = 'Security Audit Event'
        verbose_name_plural = 'Security Audit Events'

    def __str__(self):
        return f"[{self.get_severity_display()[:4]}] {self.created_at.strftime('%Y-%m-%d %H:%M:%S')} - {self.summary}"


class SystemBackupRecord(models.Model):
    """
    Business Continuity & Disaster Recovery (BC/DR) tracking record.
    Preserves cryptographic SHA-256 hashes, byte sizes, and verification states
    of automated platform database snapshots.
    """

    STATUS_CHOICES = [
        ('in_progress', 'Snapshot In Progress'),
        ('completed', 'Completed & Available'),
        ('failed', 'Snapshot Generation Failed'),
    ]

    BACKUP_TYPE_CHOICES = [
        ('manual', 'Manual Executive Snapshot'),
        ('scheduled_daily', 'Automated Daily Snapshot'),
        ('pre_deployment', 'Pre-Deployment Release Snapshot'),
        ('disaster_recovery_drill', 'Disaster Recovery Simulation Drill'),
    ]

    STORAGE_TIER_CHOICES = [
        ('local_immutable', 'Local Storage Volume'),
        ('offsite_cloud', 'Offsite Cloud Cold Archive'),
    ]

    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    backup_name = models.CharField(max_length=255, unique=True)
    file_path = models.CharField(max_length=500)
    file_size_bytes = models.BigIntegerField(default=0)
    sha256_checksum = models.CharField(max_length=64, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed', db_index=True)
    backup_type = models.CharField(max_length=30, choices=BACKUP_TYPE_CHOICES, default='manual')
    storage_tier = models.CharField(max_length=50, choices=STORAGE_TIER_CHOICES, default='local_immutable')
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)
    verification_notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'System Backup & DR Snapshot'
        verbose_name_plural = 'System Backups & DR Snapshots'

    def __str__(self):
        size_mb = self.file_size_bytes / (1024 * 1024)
        return f"{self.backup_name} ({size_mb:.2f} MB) - {self.get_status_display()}"


class PlatformSecurityPolicy(models.Model):
    """
    Operational Emergency Circuit Breakers & Risk Governance controls.
    Enforces killswitches for platform trading, payment gateways, and maintenance mode.
    """

    trading_halt_active = models.BooleanField(
        default=False,
        help_text="Marketplace Killswitch: Pauses all new order placements during volatile market emergencies.",
    )
    trading_halt_reason = models.CharField(max_length=255, blank=True)

    daraja_circuit_breaker_active = models.BooleanField(
        default=False,
        help_text="M-Pesa Breaker: Temporarily pause STK push triggers during Safaricom Daraja degradation.",
    )
    daraja_breaker_reason = models.CharField(max_length=255, blank=True)

    enforcement_freeze_active = models.BooleanField(
        default=False,
        help_text="Enforcement Freeze: Temporarily freeze automated account suspensions (e.g. public holidays or banking downtime).",
    )
    enforcement_freeze_reason = models.CharField(max_length=255, blank=True)

    maintenance_mode_active = models.BooleanField(
        default=False,
        help_text="Read-Only Mode: Disables state mutations across all public APIs for zero-downtime maintenance.",
    )
    maintenance_message = models.CharField(
        max_length=255,
        default="System undergoing scheduled maintenance. Please check back shortly.",
    )

    max_failed_logins_before_lock = models.IntegerField(
        default=5,
        help_text="Number of consecutive failed logins from an IP before rate-limiting applies.",
    )

    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )

    class Meta:
        verbose_name = 'Platform Emergency Policy & Circuit Breakers'
        verbose_name_plural = 'Platform Emergency Policy & Circuit Breakers'

    def __str__(self):
        active_breakers = []
        if self.trading_halt_active:
            active_breakers.append("TRADING HALT")
        if self.daraja_circuit_breaker_active:
            active_breakers.append("DARAJA BREAKER")
        if self.enforcement_freeze_active:
            active_breakers.append("ENFORCEMENT FREEZE")
        if self.maintenance_mode_active:
            active_breakers.append("MAINTENANCE MODE")

        if not active_breakers:
            return "Platform Policy: All Circuit Breakers Disarmed (Normal Trading)"
        return f"Platform Policy: ACTIVE KILLSWITCHES ({', '.join(active_breakers)})"

    def save(self, *args, **kwargs):
        # Guarantee singleton row
        self.pk = 1
        super().save(*args, **kwargs)
