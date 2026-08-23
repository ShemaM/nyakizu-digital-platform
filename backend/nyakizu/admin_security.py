"""
nyakizu/admin_security.py

Restricts /admin/ to an IP allowlist, on top of Django admin's own
staff-login requirement — a compromised admin credential shouldn't be
usable from anywhere on the internet. Opt-in: does nothing unless
ADMIN_ALLOWED_IPS is set, so it can't lock out local dev or a fresh
deploy that hasn't configured it yet.
"""

import ipaddress

from decouple import Csv, config
from django.http import HttpResponseForbidden

_ALLOWED_NETWORKS = [
    ipaddress.ip_network(entry.strip(), strict=False)
    for entry in config('ADMIN_ALLOWED_IPS', default='', cast=Csv())
    if entry.strip()
]


def _client_ip(request):
    # Whatever PaaS this runs on (Render, Heroku, ...) sits as a single
    # reverse proxy in front of the app and sets X-Forwarded-For to the
    # real client IP as the first entry — same single-hop trust model as
    # SECURE_PROXY_SSL_HEADER in settings.py. If that ever changes (e.g. a
    # CDN/WAF added in front of the PaaS's own proxy), this needs a second
    # look — an extra untrusted hop could let a client forge its own IP.
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '')


class AdminIPAllowlistMiddleware:
    """Blocks /admin/ requests from outside ADMIN_ALLOWED_IPS.

    ADMIN_ALLOWED_IPS is a comma-separated list of IPs and/or CIDR ranges,
    e.g. "41.90.12.4,102.68.0.0/16". Left unset, this middleware is a no-op.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if _ALLOWED_NETWORKS and request.path.startswith('/admin'):
            try:
                addr = ipaddress.ip_address(_client_ip(request))
            except ValueError:
                return HttpResponseForbidden('Forbidden')
            if not any(addr in network for network in _ALLOWED_NETWORKS):
                return HttpResponseForbidden('Forbidden')
        return self.get_response(request)
