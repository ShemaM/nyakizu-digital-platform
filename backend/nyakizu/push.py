"""
nyakizu/push.py

Sends a Web Push notification (a real OS-level notification — lock screen,
sound, tap-to-open — on Android/Chrome/desktop; requires the PWA to be
installed to the home screen on iOS 16.4+, a platform limit, not something
this code can work around) to every device a user has subscribed from.

Same shape as nyakizu/emailing.py: fire-and-forget on a small bounded
thread pool so a slow/unreachable push service can never stall the request
that triggered it, and silently no-ops (with a clear log line) if
VAPID_PRIVATE_KEY isn't configured for this environment.
"""

import json
import logging
from concurrent.futures import ThreadPoolExecutor

from django.conf import settings
from pywebpush import webpush, WebPushException

logger = logging.getLogger("nyakizu.push")

_EXECUTOR = ThreadPoolExecutor(max_workers=4, thread_name_prefix="push-send")


def _send_one(subscription, payload):
    from accounts.models import PushSubscription

    try:
        webpush(
            subscription_info={
                "endpoint": subscription.endpoint,
                "keys": {"p256dh": subscription.p256dh_key, "auth": subscription.auth_key},
            },
            data=json.dumps(payload),
            vapid_private_key=settings.VAPID_PRIVATE_KEY,
            vapid_claims={"sub": settings.VAPID_CLAIMS_EMAIL},
        )
    except WebPushException as exc:
        status_code = getattr(exc.response, "status_code", None)
        if status_code in (404, 410):
            # The browser itself has told us this endpoint will never accept
            # another push (uninstalled, permission revoked, storage cleared)
            # — keeping it around would just fail the same way every time.
            PushSubscription.objects.filter(pk=subscription.pk).delete()
        else:
            logger.exception("Push send failed for subscription %s: %s", subscription.pk, exc)
    except Exception:
        logger.exception("Push send failed for subscription %s", subscription.pk)


def send_push_notification(user, title, body, url=None, tag=None):
    """
    Fire-and-forget a push notification to every device `user` has
    subscribed from. `url` is where tapping the notification opens (see
    sw-src/sw.ts's notificationclick handler); `tag` collapses multiple
    notifications about the same thing (e.g. the same order) into one
    instead of stacking duplicates.
    """
    if not settings.VAPID_PRIVATE_KEY:
        logger.info("Skipping push %r: VAPID_PRIVATE_KEY is not configured in this environment.", title)
        return

    subscriptions = list(user.push_subscriptions.all())
    if not subscriptions:
        return

    payload = {"title": title, "body": body, "url": url, "tag": tag}
    for subscription in subscriptions:
        _EXECUTOR.submit(_send_one, subscription, payload)
