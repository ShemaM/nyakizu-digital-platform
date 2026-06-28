"""
nyakizu/auth.py

Custom authentication class that skips Django's CSRF enforcement.
This lets Next.js call the DRF API during development without needing
to pass a CSRF token in every request.

In production (HTTPS), replace this with standard SessionAuthentication
and enforce CSRF via the SameSite=Strict cookie policy instead.
"""

from rest_framework.authentication import SessionAuthentication 


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """SessionAuthentication without CSRF enforcement."""

    def enforce_csrf(self, request):
        # Skip CSRF check — safe during development behind localhost
        return
