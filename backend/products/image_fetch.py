"""
products/image_fetch.py

Server-side fetch for the "paste an image link" upload option. Client-side
fetch of an arbitrary third-party URL would fail on any host without
permissive CORS (most of them), so the server fetches it instead — which
means the server, not the browser, needs to be the one guarding against a
malicious URL (e.g. pointing at internal/cloud-metadata addresses — SSRF).
"""

import ipaddress
import socket
from urllib.parse import urljoin, urlparse

import requests
from django.core.files.base import ContentFile

MAX_IMAGE_BYTES = 8 * 1024 * 1024  # 8MB
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
FETCH_TIMEOUT_SECONDS = 8
MAX_REDIRECTS = 5


class ImageFetchError(Exception):
    pass


def _is_public_host(hostname: str) -> bool:
    """Reject hosts that resolve to a private/loopback/link-local address (SSRF guard)."""
    try:
        addr_info = socket.getaddrinfo(hostname, None)
    except socket.gaierror:
        return False

    for family, *_rest, sockaddr in addr_info:
        ip = ipaddress.ip_address(sockaddr[0])
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast:
            return False
    return True


def _validate_url(url: str) -> None:
    """Raise ImageFetchError unless `url` is http(s) and its host resolves publicly."""
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.hostname:
        raise ImageFetchError("Enter a valid http(s) image link.")
    if not _is_public_host(parsed.hostname):
        raise ImageFetchError("That link isn't reachable.")


def fetch_image_from_url(url: str) -> ContentFile:
    """Download `url` and return it as a Django ContentFile, or raise ImageFetchError.

    Redirects are followed manually (allow_redirects=False + a bounded loop)
    so every hop's host is re-validated — otherwise an attacker-controlled
    server that passes the initial check can 302 the request on to an
    internal/metadata address and the SSRF guard above would never see it.
    """
    _validate_url(url)

    next_url = url
    for _hop in range(MAX_REDIRECTS + 1):
        try:
            response = requests.get(
                next_url, timeout=FETCH_TIMEOUT_SECONDS, stream=True, allow_redirects=False
            )
        except requests.RequestException:
            raise ImageFetchError("Could not download that image link.")

        if response.is_redirect:
            location = response.headers.get("Location")
            if not location:
                raise ImageFetchError("Could not download that image link.")
            next_url = urljoin(next_url, location)
            _validate_url(next_url)
            continue

        break
    else:
        raise ImageFetchError("That link redirects too many times.")

    if not response.ok:
        raise ImageFetchError("Could not download that image link.")

    content_type = (response.headers.get("Content-Type") or "").split(";")[0].strip().lower()
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise ImageFetchError("That link doesn't point to a supported image (JPEG, PNG, WEBP, GIF).")

    chunks = []
    total = 0
    for chunk in response.iter_content(chunk_size=65536):
        total += len(chunk)
        if total > MAX_IMAGE_BYTES:
            raise ImageFetchError("Image is too large (max 8MB).")
        chunks.append(chunk)

    extension = content_type.split("/")[1].replace("jpeg", "jpg")
    filename = f"pasted-image.{extension}"
    return ContentFile(b"".join(chunks), name=filename)
