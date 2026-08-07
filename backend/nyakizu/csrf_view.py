"""
nyakizu/csrf_view.py

GET /api/csrf/ — has no purpose other than making sure a csrftoken cookie
is set on the response. django-rest-framework's SessionAuthentication
enforces CSRF on every unsafe request (POST/PUT/PATCH/DELETE) once
DEBUG=False (see nyakizu/auth.py), and that check needs the browser to
already be holding a csrftoken cookie to send back as the X-CSRFToken
header — Django only sets/rotates that cookie as a side effect of calling
get_token() during a request, so the frontend calls this once on load
(see auth-context.tsx) before attempting anything that mutates state.
"""

from django.middleware.csrf import get_token
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class CsrfCookieView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        get_token(request)  # forces Set-Cookie: csrftoken=... on the response
        return Response({"detail": "ok"})
