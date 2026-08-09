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
from urllib.parse import urlparse

import requests
from django.core.files.base import ContentFile

MAX_IMAGE_BYTES = 8 * 1024 * 1024  # 8MB
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
FETCH_TIMEOUT_SECONDS = 8


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


def fetch_image_from_url(url: str) -> ContentFile:
    """Download `url` and return it as a Django ContentFile, or raise ImageFetchError."""
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.hostname:
        raise ImageFetchError("Enter a valid http(s) image link.")

    if not _is_public_host(parsed.hostname):
        raise ImageFetchError("That link isn't reachable.")

    try:
        response = requests.get(url, timeout=FETCH_TIMEOUT_SECONDS, stream=True)
    except requests.RequestException:
        raise ImageFetchError("Could not download that image link.")

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
