"""
security/signals.py

Listens to Django auth signals to record administrative and security authentication events.
"""

from django.contrib.auth.signals import user_logged_in, user_login_failed, user_logged_out
from django.dispatch import receiver

from .services import log_security_event


@receiver(user_logged_in)
def on_user_logged_in(sender, request, user, **kwargs):
    if user.is_staff or user.is_superuser or user.role == 'admin':
        log_security_event(
            event_type='login_success',
            summary=f"Administrative session initiated for '{user.email or user.username}'.",
            severity='info',
            actor=user,
            request=request,
            details={'role': user.role, 'is_staff': user.is_staff, 'is_superuser': user.is_superuser},
        )


@receiver(user_login_failed)
def on_user_login_failed(sender, credentials, request, **kwargs):
    username = credentials.get('username') or credentials.get('email') or 'Unknown'
    log_security_event(
        event_type='login_failed',
        summary=f"Failed authentication attempt for credential '{username}'.",
        severity='warning',
        request=request,
        details={'attempted_username': username},
    )


@receiver(user_logged_out)
def on_user_logged_out(sender, request, user, **kwargs):
    if user and (user.is_staff or user.is_superuser or user.role == 'admin'):
        log_security_event(
            event_type='logout',
            summary=f"Administrative session terminated for '{user.email or user.username}'.",
            severity='info',
            actor=user,
            request=request,
        )

