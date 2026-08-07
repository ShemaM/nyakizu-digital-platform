"""
nyakizu/auth.py

Skips CSRF enforcement only in dev (DEBUG=True), so Next.js can call the
API from localhost without needing a CSRF token on every request.

In production the frontend and backend are on different sites (e.g.
*.vercel.app vs *.onrender.com), which forces SESSION_COOKIE_SAMESITE to
"None" for the session cookie to be sent at all (see settings.py) — and
SameSite=None provides zero CSRF protection by itself, unlike Lax/Strict.
So production can't skip this the way dev does: real CSRF enforcement via
DRF's standard SessionAuthentication kicks in, and the frontend sends the
token back as an X-CSRFToken header (see lib/api.ts's fetchWithSession
and the GET /api/csrf/ endpoint that primes the cookie on load).
"""

from django.conf import settings
from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """SessionAuthentication that only skips CSRF enforcement in dev."""

    def enforce_csrf(self, request):
        if settings.DEBUG:
            return
        return super().enforce_csrf(request)
