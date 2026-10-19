"""
security/middleware.py

Enforces operational emergency circuit breakers & risk governance controls
across incoming HTTP requests.
"""

from django.http import JsonResponse
from .services import get_security_policy


class PlatformCircuitBreakerMiddleware:
    """
    Evaluates runtime emergency killswitches before request handling:
    1. Maintenance Mode: Blocks non-admin state mutations during planned downtime.
    2. Trading Halt: Blocks new order creations during marketplace volatility/investigations.
    3. Daraja Circuit Breaker: Blocks outgoing STK push triggers during Safaricom degradation.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path

        # Always bypass circuit breakers for admin UI, static files, and CSRF token initialization
        user = getattr(request, 'user', None)
        if (
            path.startswith(('/admin', '/management', '/static', '/media', '/api/csrf', '/favicon'))
            or (user and user.is_authenticated and (user.is_staff or user.is_superuser))
        ):
            return self.get_response(request)

        policy = get_security_policy()

        # 1. Maintenance Mode
        if policy.maintenance_mode_active and not request.method == 'GET':
            return JsonResponse(
                {
                    'status': 'error',
                    'code': 'platform_maintenance_mode',
                    'message': policy.maintenance_message or 'The platform is currently undergoing scheduled maintenance.',
                },
                status=503,
            )

        # 2. Trading Halt Killswitch
        if policy.trading_halt_active and request.method == 'POST' and path.startswith('/api/orders'):
            return JsonResponse(
                {
                    'status': 'error',
                    'code': 'trading_halt_active',
                    'message': f"Marketplace orders are temporarily paused: {policy.trading_halt_reason or 'Risk governance freeze in effect.'}",
                },
                status=423,
            )

        # 3. Daraja M-Pesa Circuit Breaker
        if policy.daraja_circuit_breaker_active and request.method == 'POST' and '/billing/topup' in path:
            return JsonResponse(
                {
                    'status': 'error',
                    'code': 'daraja_circuit_breaker_active',
                    'message': f"M-Pesa payment gateway is temporarily paused: {policy.daraja_breaker_reason or 'Upstream payment gateway maintenance.'}",
                },
                status=503,
            )

        return self.get_response(request)
