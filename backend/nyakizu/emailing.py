"""
nyakizu/emailing.py

Shared helper for every outbound email in the project (verification links,
seller approval/rejection, order status updates, admin alerts).

Why this exists: `django.core.mail.send_mail` was being called inline, in
the request/response cycle, at ~7 call sites. In production the backend
runs a single gunicorn worker (see Procfile), so any one of those calls
blocking on a slow or unreachable SMTP server — Python's smtplib has no
socket timeout by default — froze that worker completely, and with it
every other request in flight (login, order actions, everything), until
the OS finally killed the socket. That is almost certainly why "everything
is slow" and actions had to be retried: the retry just got lucky and hit
a worker that wasn't stuck in a stalled email call.

Sending in a background thread means a slow/broken SMTP config can no
longer stall the HTTP response — the request finishes immediately and the
email either lands a moment later or fails and gets logged, but neither
outcome blocks the site.
"""

import logging
import smtplib
import socket
from concurrent.futures import ThreadPoolExecutor

from django.conf import settings
from django.core.mail import send_mail
from django.core.mail.backends.smtp import EmailBackend as DjangoSMTPBackend

logger = logging.getLogger("nyakizu.emailing")

# A bare `threading.Thread(...).start()` per email has no ceiling — a
# signup burst or an admin notification fan-out could spin up dozens of
# concurrent threads on the single gunicorn worker this runs behind (see
# module docstring). A small fixed-size pool bounds that: excess sends
# queue up and go out a little later instead of piling on more OS threads.
_EXECUTOR = ThreadPoolExecutor(max_workers=4, thread_name_prefix="email-send")

# Django's test runner forces EMAIL_BACKEND to this in-memory backend so
# tests can assert against mail.outbox. Sending from a background thread
# would make that assertion racy (the request can return, and the test can
# check mail.outbox, before the thread finishes) — inline is both safe and
# instant there, since locmem never touches the network.
_LOCMEM_BACKEND = "django.core.mail.backends.locmem.EmailBackend"


class _IPv4SMTP(smtplib.SMTP):
    """
    smtplib.SMTP that only ever connects over IPv4.

    Some hosts (Render's containers, notably) have an IPv6 address
    configured with no actual route to the internet. smtp.gmail.com
    resolves to both an A and an AAAA record, and smtplib tries whatever
    getaddrinfo() returns first — when that's the unroutable IPv6 address,
    connect() fails immediately with "Network is unreachable", well before
    TLS/auth are ever attempted. Restricting resolution to AF_INET sidesteps
    it entirely; the hostname (and therefore TLS SNI/cert check) is
    unaffected since self._host is unchanged.
    """

    def _get_socket(self, host, port, timeout):
        family, socktype, proto, _canonname, sockaddr = socket.getaddrinfo(
            host, port, socket.AF_INET, socket.SOCK_STREAM
        )[0]
        sock = socket.socket(family, socktype, proto)
        if timeout is not None:
            sock.settimeout(timeout)
        sock.connect(sockaddr)
        return sock


class IPv4EmailBackend(DjangoSMTPBackend):
    """Django SMTP backend that forces the IPv4-only connection above."""
    connection_class = _IPv4SMTP


def send_mail_async(subject, message, recipient_list, from_email=None):
    """Fire-and-forget an email in a background thread; never blocks the request."""
    recipient_list = [r for r in (recipient_list or []) if r]
    if not recipient_list:
        return

    backend = getattr(settings, "EMAIL_BACKEND", "")
    is_smtp = backend in (
        "django.core.mail.backends.smtp.EmailBackend",
        "nyakizu.emailing.IPv4EmailBackend",
    )
    if is_smtp and not (settings.EMAIL_HOST and settings.EMAIL_HOST_USER and settings.EMAIL_HOST_PASSWORD):
        # Fails fast with a specific, searchable log line instead of a bare
        # SMTPException three network hops later — this is exactly what's
        # missing when EMAIL_HOST_USER/EMAIL_HOST_PASSWORD were set in a
        # local .env (gitignored, never deployed) but never added to the
        # hosting platform's own environment variables.
        logger.error(
            "Cannot send email %r: EMAIL_HOST/EMAIL_HOST_USER/EMAIL_HOST_PASSWORD "
            "is not fully configured in this environment (EMAIL_HOST=%r, "
            "EMAIL_HOST_USER set=%s, EMAIL_HOST_PASSWORD set=%s).",
            subject, settings.EMAIL_HOST, bool(settings.EMAIL_HOST_USER), bool(settings.EMAIL_HOST_PASSWORD),
        )
        return

    def _send():
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=from_email,
                recipient_list=recipient_list,
                fail_silently=False,
            )
        except Exception:
            # logger.exception at ERROR level is auto-forwarded to Sentry by
            # the LoggingIntegration wired in settings.py (once SENTRY_DSN is
            # set) — a persistently broken SMTP config surfaces as repeated
            # Sentry events, not just log lines nobody's tailing.
            logger.exception("Failed to send email %r to %r", subject, recipient_list)

    if getattr(settings, "EMAIL_BACKEND", "") == _LOCMEM_BACKEND:
        _send()
    else:
        _EXECUTOR.submit(_send)
