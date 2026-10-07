"""
nyakizu/emailing.py

Shared helper for every outbound email in the project (verification links,
seller approval/rejection, order status updates, admin alerts).

Sends branded HTML emails with professional sign-off, Nyakizu Digital logo,
and official brand styling, while attaching a clean plain-text fallback.
"""

import html
import logging
import re
import smtplib
import socket
from concurrent.futures import ThreadPoolExecutor

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.core.mail.backends.smtp import EmailBackend as DjangoSMTPBackend

logger = logging.getLogger("nyakizu.emailing")

_EXECUTOR = ThreadPoolExecutor(max_workers=4, thread_name_prefix="email-send")
_LOCMEM_BACKEND = "django.core.mail.backends.locmem.EmailBackend"

URL_REGEX = re.compile(r'https?://[^\s<>"]+')
KV_REGEX = re.compile(r'^([A-Za-z0-9\s\-]{2,30}):\s+(.+)$')
NUM_LIST_REGEX = re.compile(r'^\d+\.\s+(.+)$')
SIGNOFF_MARKERS = [
    "best regards", "warm regards", "the nyakizu team", "team nyakizu",
    "the nyakizu digital team", "nyakizu team", "nyakizu digital market"
]


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


def sender(kind):
    """
    Return the From address for a category of outbound mail — one of the keys
    in settings.EMAIL_SENDERS ("accounts", "orders", "payments", "sellers",
    "alerts", "marketing"). Falls back to DEFAULT_FROM_EMAIL for an unknown
    key or an environment that hasn't defined the map at all.
    """
    senders = getattr(settings, "EMAIL_SENDERS", None) or {}
    return senders.get(kind) or getattr(settings, "DEFAULT_FROM_EMAIL", None)


def _infer_cta_text(subject: str, url: str) -> str:
    s = (subject + " " + url).lower()
    if "verify" in s or "token=" in s:
        return "Verify My Email Address"
    if "reset" in s or "password" in s:
        return "Reset My Password"
    if "order" in s and ("packing" in s or "review" in s or "new order" in s or "fulfill" in s):
        return "Open Order & Start Packing"
    if "order" in s and ("track" in s or "price" in s or "status" in s or "locked" in s):
        return "View Order Status"
    if "balance" in s or "debt" in s or "pay" in s:
        return "View Order & Pay Balance"
    if "approved" in s and ("store" in s or "order from" in s or "shop" in s):
        return "Visit Store & Start Ordering"
    if "buyer" in s and ("join" in s or "access" in s or "wants to" in s):
        return "Review Buyer Request"
    if "login" in s or "sign in" in s:
        return "Sign In to Your Store"
    if "abandoned" in s or "left something" in s:
        return "Complete Your Order"
    if "admin" in s:
        return "Open in Admin Panel"
    return "Open Nyakizu Digital"


def build_branded_email_html(
    subject: str,
    message: str,
    cta_url: str = None,
    cta_text: str = None,
    preheader: str = None,
) -> str:
    """
    Generates a high-fidelity, responsive HTML email matching Nyakizu Digital's
    brand guidelines (Forest green, emerald accents, M-Pesa gold, polished card,
    bulletproof CTA button, company logo, and official sign-off).
    """
    frontend_base = getattr(settings, "FRONTEND_VERIFY_BASE_URL", "https://nyakizudigital.me").rstrip("/")
    logo_url = f"{frontend_base}/icons/icon-192.png"

    raw_lines = [l.strip() for l in message.strip().splitlines()]
    
    extracted_cta_url = cta_url
    cleaned_lines = []
    
    for line in raw_lines:
        if not line:
            cleaned_lines.append("")
            continue
            
        lower_line = line.lower().strip(",.- ")
        if any(lower_line == marker for marker in SIGNOFF_MARKERS):
            continue
            
        found_urls = URL_REGEX.findall(line)
        if found_urls and not extracted_cta_url:
            extracted_cta_url = found_urls[0]
            cleaned_line = URL_REGEX.sub("", line).strip(": ").strip()
            if cleaned_line and not any(cleaned_line.lower().startswith(p) for p in ["see ", "open ", "reset ", "verify ", "here", "click"]):
                cleaned_lines.append(cleaned_line)
            continue
        elif found_urls and extracted_cta_url and line.strip() == found_urls[0]:
            continue
            
        cleaned_lines.append(line)

    if extracted_cta_url and not cta_text:
        cta_text = _infer_cta_text(subject, extracted_cta_url)

    blocks_html = []
    i = 0
    n = len(cleaned_lines)
    
    while i < n:
        line = cleaned_lines[i]
        if not line:
            i += 1
            continue
            
        # Key-Value metadata block
        kv_match = KV_REGEX.match(line)
        if kv_match:
            kv_rows = []
            while i < n and KV_REGEX.match(cleaned_lines[i]):
                m = KV_REGEX.match(cleaned_lines[i])
                k = html.escape(m.group(1).strip())
                v = html.escape(m.group(2).strip())
                kv_rows.append((k, v))
                i += 1
                
            table_rows_html = "".join([
                f'<tr>'
                f'<td style="padding: 10px 16px; font-size: 13px; font-weight: 700; color: #475569; border-bottom: 1px solid #E2E8F0; width: 32%; background-color: #F8FAFC;">{k}</td>'
                f'<td style="padding: 10px 16px; font-size: 14px; font-weight: 600; color: #0F172A; border-bottom: 1px solid #E2E8F0; background-color: #FFFFFF;">{v}</td>'
                f'</tr>'
                for k, v in kv_rows
            ])
            blocks_html.append(
                f'<table border="0" cellpadding="0" cellspacing="0" width="100%" '
                f'style="margin: 18px 0 20px 0; border: 1px solid #E2E8F0; border-radius: 10px; overflow: hidden; border-collapse: separate; border-spacing: 0;">'
                f'{table_rows_html}'
                f'</table>'
            )
            continue

        # Numbered list block
        num_match = NUM_LIST_REGEX.match(line)
        if num_match:
            list_items = []
            while i < n and NUM_LIST_REGEX.match(cleaned_lines[i]):
                m = NUM_LIST_REGEX.match(cleaned_lines[i])
                item_text = html.escape(m.group(1).strip())
                list_items.append(f'<li style="margin-bottom: 8px; line-height: 1.55; color: #334155;">{item_text}</li>')
                i += 1
            blocks_html.append(f'<ol style="margin: 16px 0; padding-left: 22px; font-size: 14px;">{"".join(list_items)}</ol>')
            continue

        esc_line = html.escape(line)
        esc_line = re.sub(r'&quot;(.*?)&quot;', r'<strong style="color: #0F172A;">&ldquo;\1&rdquo;</strong>', esc_line)
        esc_line = re.sub(r'"(.*?)"', r'<strong style="color: #0F172A;">&ldquo;\1&rdquo;</strong>', esc_line)
        
        lower_line = line.lower()
        if any(lower_line.startswith(g) for g in ["hello", "dear", "hi", "welcome"]):
            blocks_html.append(
                f'<p style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #0F172A; line-height: 1.5;">{esc_line}</p>'
            )
        else:
            blocks_html.append(
                f'<p style="margin: 0 0 14px 0; font-size: 15px; color: #334155; line-height: 1.65;">{esc_line}</p>'
            )
        i += 1

    content_html = "\n".join(blocks_html)

    cta_html = ""
    if extracted_cta_url:
        button_label = html.escape(cta_text or "Open Nyakizu")
        clean_url = html.escape(extracted_cta_url)
        cta_html = f"""
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 20px 0;">
          <tr>
            <td align="left">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="border-radius: 10px; background-color: #064E3B;">
                    <a href="{clean_url}" target="_blank" rel="noopener noreferrer"
                       style="display: inline-block; padding: 14px 28px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 700; color: #FFFFFF; text-decoration: none; border-radius: 10px; border: 1px solid #059669; box-shadow: 0 3px 10px rgba(6, 78, 59, 0.22); letter-spacing: 0.2px;">
                      {button_label} &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="margin: 0 0 20px 0; font-size: 12px; color: #94A3B8; line-height: 1.5;">
          Direct link: <a href="{clean_url}" style="color: #059669; text-decoration: underline; word-break: break-all;">{clean_url}</a>
        </p>
        """

    escaped_subject = html.escape(subject)
    preheader_text = html.escape(preheader or subject)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>{escaped_subject}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a {{ font-family: Arial, Helvetica, sans-serif !important; }}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #334155;">
  <div style="display: none; max-height: 0px; overflow: hidden; font-size: 1px; line-height: 1px; color: #F1F5F9; opacity: 0;">
    {preheader_text}
  </div>

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F1F5F9; padding: 32px 12px 48px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08); border: 1px solid #E2E8F0;">
          
          <!-- Header Bar with Logo and Brand -->
          <tr>
            <td style="background-color: #0A1F10; padding: 24px 32px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="vertical-align: middle;">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 44px; height: 44px; background-color: #052E16; border-radius: 10px; border: 1.5px solid #10B981; text-align: center; vertical-align: middle;">
                          <img src="{logo_url}" width="44" height="44" alt="Nyakizu" style="display: block; border-radius: 9px; border: 0; outline: none;" />
                        </td>
                        <td style="padding-left: 14px; vertical-align: middle;">
                          <div style="font-size: 20px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.2px; line-height: 1.15; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            NYAKIZU <span style="color: #F59E0B; font-weight: 700;">DIGITAL</span>
                          </div>
                          <div style="font-size: 11px; font-weight: 600; color: #6EE7B7; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            Kenya&rsquo;s Wholesale Market
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Dual Brand Accent Stripe (Emerald to Gold) -->
          <tr>
            <td style="height: 4px; background-color: #10B981; background: linear-gradient(90deg, #10B981 0%, #F59E0B 100%); line-height: 4px; font-size: 1px;">
              &nbsp;
            </td>
          </tr>

          <!-- Card Body -->
          <tr>
            <td style="padding: 36px 32px 32px 32px;">
              <h1 style="margin: 0 0 20px 0; font-size: 21px; font-weight: 800; color: #0F172A; line-height: 1.35; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                {escaped_subject}
              </h1>

              {content_html}

              {cta_html}

              <!-- Professional Sign-off -->
              <div style="margin-top: 36px; padding-top: 22px; border-top: 1px solid #E2E8F0;">
                <p style="margin: 0 0 4px 0; color: #64748B; font-size: 14px; font-weight: 500;">
                  Warm regards,
                </p>
                <p style="margin: 0; color: #0F172A; font-size: 15px; font-weight: 800;">
                  The Nyakizu Team
                </p>
                <p style="margin: 3px 0 0 0; color: #059669; font-size: 12px; font-weight: 600;">
                  Nyakizu Digital Market Ltd &middot; Nairobi CBD
                </p>
              </div>
            </td>
          </tr>
        </table>

        <!-- Email Footer -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto;">
          <tr>
            <td align="center" style="padding: 24px 20px 0 20px; font-size: 12px; color: #64748B; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <p style="margin: 0 0 4px 0; font-weight: 600; color: #475569;">
                Nyakizu Digital Market &middot; Nairobi CBD, Kenya
              </p>
              <p style="margin: 0 0 10px 0; color: #94A3B8;">
                Connecting verified wholesale suppliers &amp; retail shop owners across Kenya.
              </p>
              <p style="margin: 0; color: #94A3B8; font-size: 11px;">
                Have questions? Reach our team at <a href="mailto:support@nyakizudigital.me" style="color: #059669; text-decoration: none; font-weight: 600;">support@nyakizudigital.me</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def send_mail_async(
    subject,
    message,
    recipient_list,
    from_email=None,
    reply_to=None,
    html_message=None,
    cta_url=None,
    cta_text=None,
    preheader=None,
):
    """
    Fire-and-forget a multipart branded email (HTML + Plain text fallback)
    in a background thread; never blocks the request.
    """
    recipient_list = [r for r in (recipient_list or []) if r]
    if not recipient_list:
        return

    reply_to = reply_to or getattr(settings, "EMAIL_REPLY_TO", "") or None

    backend = getattr(settings, "EMAIL_BACKEND", "")
    is_smtp = backend in (
        "django.core.mail.backends.smtp.EmailBackend",
        "nyakizu.emailing.IPv4EmailBackend",
    )
    if is_smtp and not (settings.EMAIL_HOST and settings.EMAIL_HOST_USER and settings.EMAIL_HOST_PASSWORD):
        logger.error(
            "Cannot send email %r: EMAIL_HOST/EMAIL_HOST_USER/EMAIL_HOST_PASSWORD "
            "is not fully configured in this environment (EMAIL_HOST=%r, "
            "EMAIL_HOST_USER set=%s, EMAIL_HOST_PASSWORD set=%s).",
            subject, settings.EMAIL_HOST, bool(settings.EMAIL_HOST_USER), bool(settings.EMAIL_HOST_PASSWORD),
        )
        return

    final_html = html_message or build_branded_email_html(
        subject=subject,
        message=message,
        cta_url=cta_url,
        cta_text=cta_text,
        preheader=preheader,
    )

    def _send():
        try:
            msg = EmailMultiAlternatives(
                subject=subject,
                body=message,
                from_email=from_email or getattr(settings, "DEFAULT_FROM_EMAIL", None),
                to=recipient_list,
                reply_to=[reply_to] if reply_to else None,
            )
            msg.attach_alternative(final_html, "text/html")
            msg.send(fail_silently=False)
        except Exception:
            logger.exception("Failed to send email %r to %r", subject, recipient_list)

    if getattr(settings, "EMAIL_BACKEND", "") == _LOCMEM_BACKEND:
        _send()
    else:
        _EXECUTOR.submit(_send)
