"""
security/admin.py

Unfold admin interface registrations for Security Audit Logs,
Business Continuity Database Backups, and Platform Emergency Circuit Breakers.
"""

from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin

from .models import PlatformSecurityPolicy, SecurityAuditLog, SystemBackupRecord
from .services import verify_backup_integrity, log_security_event


@admin.register(SecurityAuditLog)
class SecurityAuditLogAdmin(ModelAdmin):
    list_display = [
        'created_at_fmt',
        'severity_badge',
        'event_type_display',
        'actor_display',
        'ip_address',
        'summary',
    ]
    list_filter = ['severity', 'event_type', 'created_at']
    search_fields = ['summary', 'actor_email', 'ip_address', 'resource_type', 'resource_id']
    readonly_fields = [
        'created_at',
        'actor',
        'actor_email',
        'event_type',
        'severity',
        'ip_address',
        'user_agent',
        'resource_type',
        'resource_id',
        'summary',
        'details',
    ]

    def has_add_permission(self, request):
        return False  # Audit logs can only be created via system services

    def has_delete_permission(self, request, obj=None):
        return False  # Audit logs are immutable

    def has_change_permission(self, request, obj=None):
        return False  # Read-only audit trail

    def created_at_fmt(self, obj):
        return obj.created_at.strftime('%Y-%m-%d %H:%M:%S')
    created_at_fmt.short_description = 'Timestamp (EAT)'

    def severity_badge(self, obj):
        colors = {
            'info': ('#ECFDF5', '#047857', '#A7F3D0'),
            'warning': ('#FFFBEB', '#B45309', '#FDE68A'),
            'critical': ('#FEF2F2', '#B91C1C', '#FECACA'),
        }
        bg, text, border = colors.get(obj.severity, ('#F1F5F9', '#475569', '#CBD5E1'))
        return format_html(
            '<span style="background:{}; color:{}; border:1px solid {}; padding:2px 8px; border-radius:4px; font-weight:800; font-size:10px; text-transform:uppercase;">● {}</span>',
            bg, text, border, obj.severity
        )
    severity_badge.short_description = 'Severity'

    def event_type_display(self, obj):
        return obj.get_event_type_display()
    event_type_display.short_description = 'Event Classification'

    def actor_display(self, obj):
        if obj.actor:
            return obj.actor.email or obj.actor.username
        return obj.actor_email or 'System Daemon'
    actor_display.short_description = 'Actor'


@admin.register(SystemBackupRecord)
class SystemBackupRecordAdmin(ModelAdmin):
    list_display = [
        'backup_name',
        'backup_type',
        'size_display',
        'status_badge',
        'verified_badge',
        'created_at',
    ]
    list_filter = ['status', 'backup_type', 'is_verified', 'created_at']
    search_fields = ['backup_name', 'sha256_checksum', 'file_path']
    readonly_fields = [
        'backup_name',
        'file_path',
        'file_size_bytes',
        'sha256_checksum',
        'status',
        'backup_type',
        'storage_tier',
        'is_verified',
        'verified_at',
        'verification_notes',
        'created_at',
        'created_by',
    ]
    actions = ['verify_backups_action']

    def size_display(self, obj):
        size_mb = obj.file_size_bytes / (1024 * 1024)
        return f"{size_mb:.2f} MB"
    size_display.short_description = 'Size'

    def status_badge(self, obj):
        if obj.status == 'completed':
            return format_html(
                '<span style="background:#ECFDF5; color:#047857; padding:2px 8px; border-radius:4px; font-weight:700; font-size:11px;">READY</span>'
            )
        return format_html(
            '<span style="background:#FEF2F2; color:#B91C1C; padding:2px 8px; border-radius:4px; font-weight:700; font-size:11px;">FAILED</span>'
        )
    status_badge.short_description = 'Status'

    def verified_badge(self, obj):
        if obj.is_verified:
            return format_html(
                '<span style="color:#059669; font-weight:800; font-size:11px;">✓ SHA-256 MATCH</span>'
            )
        return format_html(
            '<span style="color:#D97706; font-weight:800; font-size:11px;">⚠ UNVERIFIED</span>'
        )
    verified_badge.short_description = 'Integrity'

    @admin.action(description="Verify Cryptographic Integrity of Selected Snapshots")
    def verify_backups_action(self, request, queryset):
        success_count = 0
        fail_count = 0
        for rec in queryset:
            ok, _ = verify_backup_integrity(rec.id, actor=request.user, request=request)
            if ok:
                success_count += 1
            else:
                fail_count += 1

        self.message_user(
            request,
            f"Integrity check completed: {success_count} passed, {fail_count} failed.",
        )


@admin.register(PlatformSecurityPolicy)
class PlatformSecurityPolicyAdmin(ModelAdmin):
    list_display = [
        'policy_status',
        'trading_halt_status',
        'daraja_breaker_status',
        'enforcement_freeze_status',
        'maintenance_mode_status',
        'updated_at',
    ]

    fieldsets = (
        ("Emergency Circuit Breakers & Killswitches", {
            "description": (
                "CRITICAL GOVERNANCE: Activating these switches immediately impacts live platform operations. "
                "All changes are logged in the immutable security audit log."
            ),
            "fields": (
                ("trading_halt_active", "trading_halt_reason"),
                ("daraja_circuit_breaker_active", "daraja_breaker_reason"),
                ("enforcement_freeze_active", "enforcement_freeze_reason"),
                ("maintenance_mode_active", "maintenance_message"),
            ),
        }),
        ("Brute-Force & Perimeter Defense", {
            "fields": ("max_failed_logins_before_lock",),
        }),
        ("Audit Metadata", {
            "fields": ("updated_at", "updated_by"),
        }),
    )
    readonly_fields = ['updated_at', 'updated_by']

    def policy_status(self, obj):
        return "Active Security Policy"
    policy_status.short_description = "Policy Configuration"

    def trading_halt_status(self, obj):
        if obj.trading_halt_active:
            return format_html('<span style="color:#DC2626; font-weight:800;">⛔ TRADING HALTED</span>')
        return format_html('<span style="color:#059669; font-weight:700;">NORMAL</span>')
    trading_halt_status.short_description = "Market Trading"

    def daraja_breaker_status(self, obj):
        if obj.daraja_circuit_breaker_active:
            return format_html('<span style="color:#DC2626; font-weight:800;">⚡ BREAKER OPEN (PAUSED)</span>')
        return format_html('<span style="color:#059669; font-weight:700;">NORMAL</span>')
    daraja_breaker_status.short_description = "Daraja Gateway"

    def enforcement_freeze_status(self, obj):
        if obj.enforcement_freeze_active:
            return format_html('<span style="color:#D97706; font-weight:800;">⏸ ENFORCEMENT FROZEN</span>')
        return format_html('<span style="color:#059669; font-weight:700;">NORMAL</span>')
    enforcement_freeze_status.short_description = "Account Suspension"

    def maintenance_mode_status(self, obj):
        if obj.maintenance_mode_active:
            return format_html('<span style="color:#DC2626; font-weight:800;">🛠 MAINTENANCE MODE</span>')
        return format_html('<span style="color:#059669; font-weight:700;">NORMAL</span>')
    maintenance_mode_status.short_description = "Maintenance Mode"

    def save_model(self, request, obj, form, change):
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)
        log_security_event(
            event_type='circuit_breaker' if any([
                obj.trading_halt_active,
                obj.daraja_circuit_breaker_active,
                obj.enforcement_freeze_active,
                obj.maintenance_mode_active,
            ]) else 'system_policy',
            summary=f"Platform security policy modified by '{request.user.email or request.user.username}'.",
            severity='warning',
            actor=request.user,
            request=request,
            details={
                'trading_halt': obj.trading_halt_active,
                'daraja_breaker': obj.daraja_circuit_breaker_active,
                'enforcement_freeze': obj.enforcement_freeze_active,
                'maintenance_mode': obj.maintenance_mode_active,
            },
        )
