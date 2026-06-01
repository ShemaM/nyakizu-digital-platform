"""ASGI config for nyakizu project (used for async servers like Daphne/Uvicorn)."""

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nyakizu.settings')

application = get_asgi_application()
