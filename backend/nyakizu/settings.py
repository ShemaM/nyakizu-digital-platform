"""
Django settings for the Nyakizu Digital Market platform.
"""

from pathlib import Path
from decouple import config, Csv

BASE_DIR = Path(__file__).resolve().parent.parent

# ── Security ──────────────────────────────────────────────────────────────────
SECRET_KEY = config('SECRET_KEY', default='dev-insecure-key-change-in-production')
DEBUG      = config('DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())

if not DEBUG and SECRET_KEY == 'dev-insecure-key-change-in-production':
    raise ValueError(
        'SECRET_KEY is still the dev default with DEBUG=False. '
        'Set a real SECRET_KEY env var before running in production.'
    )

# Most hosting platforms (Render, Railway, Fly.io, ...) terminate TLS at a
# proxy in front of the app and forward plain HTTP internally — without
# this, request.is_secure() is always False behind that proxy, which
# silently breaks secure-cookie logic and CSRF checks even over HTTPS.
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT     = config('SECURE_SSL_REDIRECT', default=not DEBUG, cast=bool)
SECURE_HSTS_SECONDS     = config('SECURE_HSTS_SECONDS', default=0 if DEBUG else 60 * 60 * 24 * 7, cast=int)
SECURE_HSTS_INCLUDE_SUBDOMAINS = not DEBUG
SECURE_HSTS_PRELOAD            = not DEBUG
CSRF_COOKIE_SECURE     = config('CSRF_COOKIE_SECURE', default=not DEBUG, cast=bool)

# ── Applications ──────────────────────────────────────────────────────────────
INSTALLED_APPS = [
    'unfold',  # must precede django.contrib.admin — swaps in UnfoldAdminSite on ready()
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'corsheaders',
    'storages',  # only actually used when R2_BUCKET_NAME is set — see STORAGES below
    'django.contrib.sites',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',

    # Our apps
    'accounts',
    'products',
    'orders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    # Serves collected static files directly from the app process — no
    # separate CDN/static host needed, which is what makes single-service
    # free-tier hosting (Render, Railway, Fly.io, ...) work for a Django
    # admin that needs its own CSS/JS.
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'nyakizu.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'nyakizu.wsgi.application'

# ── Database ──────────────────────────────────────────────────────────────────
# DATABASE_URL unset (local dev) -> sqlite. Set it (postgres://... — every
# host below hands you one) and this switches to Postgres with zero other
# changes needed.
import dj_database_url

DATABASES = {
    'default': dj_database_url.config(
        default=f'sqlite:///{BASE_DIR / "db.sqlite3"}',
        conn_max_age=600,
    )
}

# ── Auth ──────────────────────────────────────────────────────────────────────
AUTH_USER_MODEL = 'accounts.CustomUser'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
     'OPTIONS': {'min_length': 6}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ── Internationalisation ──────────────────────────────────────────────────────
LANGUAGE_CODE = 'en-us'
TIME_ZONE     = 'Africa/Nairobi'
USE_I18N      = True
USE_TZ        = True

# ── Static files ──────────────────────────────────────────────────────────────
STATIC_URL  = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'   # `manage.py collectstatic` target; whitenoise serves from here

# ── Media (user-uploaded files) ─────────────────────────────────────────────
# Local disk (FileSystemStorage) unless R2_BUCKET_NAME is set — most
# free-tier app hosts wipe local disk on every redeploy/restart, so
# uploads (avatars, product photos) need object storage to actually
# persist. Targets Cloudflare R2 (S3-compatible, no egress fees, 10GB
# free) via django-storages; any other S3-compatible provider works too,
# just point R2_ENDPOINT_URL at it.
R2_BUCKET_NAME = config('R2_BUCKET_NAME', default='')

if R2_BUCKET_NAME:
    STORAGES = {
        'default': {
            'BACKEND': 'storages.backends.s3boto3.S3Boto3Storage',
            'OPTIONS': {
                'bucket_name': R2_BUCKET_NAME,
                'endpoint_url': config('R2_ENDPOINT_URL'),  # https://<account_id>.r2.cloudflarestorage.com
                'access_key': config('R2_ACCESS_KEY_ID'),
                'secret_key': config('R2_SECRET_ACCESS_KEY'),
                'region_name': 'auto',
                'signature_version': 's3v4',
                'addressing_style': 'path',
                'file_overwrite': False,
                'querystring_auth': False,  # bucket is public — plain URLs, no signed-request expiry
            },
        },
        'staticfiles': {
            'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
        },
    }
    # R2's own public bucket URL (or a custom domain mapped to it) — required
    # so <img src="..."> tags don't point at the private R2 API endpoint.
    MEDIA_URL = config('R2_PUBLIC_URL').rstrip('/') + '/'
else:
    STORAGES = {
        'default': {
            'BACKEND': 'django.core.files.storage.FileSystemStorage',
        },
        'staticfiles': {
            # Adds a content hash to filenames + gzip/brotli compression.
            'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
        },
    }
    MEDIA_URL  = '/media/'
    MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ── Django admin (django-unfold theme) ─────────────────────────────────────────
from django.urls import reverse_lazy

UNFOLD = {
    "SITE_TITLE": "Nyakizu Digital Market",
    "SITE_HEADER": "Nyakizu Digital Market",
    "SITE_SUBHEADER": "Platform Management",
    "SHOW_HISTORY": True,
    "SHOW_VIEW_ON_SITE": True,
    # Forces light mode always. Without this, unfold defaults to "auto" —
    # it reads the OS/browser's prefers-color-scheme and silently renders
    # the whole admin dark on any machine set to dark mode, regardless of
    # anything themed below. That auto-detect, not a template bug, was the
    # actual source of the "dark blue background" complaint.
    "THEME": "light",
    "COLORS": {
        # Tailwind's `blue` scale — matches the platform's brand primary (#2563eb / blue-600),
        # i.e. the same --primary/--ring token frontend/tailwind.config.ts defines.
        "primary": {
            "50":  "#eff6ff",
            "100": "#dbeafe",
            "200": "#bfdbfe",
            "300": "#93c5fd",
            "400": "#60a5fa",
            "500": "#3b82f6",
            "600": "#2563eb",
            "700": "#1d4ed8",
            "800": "#1e40af",
            "900": "#1e3a8a",
            "950": "#172554",
        },
        # Tailwind's `stone` scale — replaces unfold's default cool-slate
        # neutrals with the same warm-paper/warm-ink undertone as the
        # frontend's dark.* tokens (#FAF9F6 paper, #14120E ink), instead of
        # a mismatched cool gray sitting next to the app's warm one.
        "base": {
            "50":  "#fafaf9",
            "100": "#f5f5f4",
            "200": "#e7e5e4",
            "300": "#d6d3d1",
            "400": "#a8a29e",
            "500": "#78716c",
            "600": "#57534e",
            "700": "#44403c",
            "800": "#292524",
            "900": "#1c1917",
            "950": "#0c0a09",
        },
    },
    "DASHBOARD_CALLBACK": "nyakizu.admin_dashboard.dashboard_callback",
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": False,
        "navigation": [
            {
                "title": "Overview",
                "separator": True,
                "items": [
                    {
                        "title": "Dashboard",
                        "icon": "dashboard",
                        "link": reverse_lazy("admin:index"),
                    },
                ],
            },
            {
                "title": "Users & Approvals",
                "separator": True,
                "items": [
                    {
                        "title": "Users",
                        "icon": "group",
                        "link": reverse_lazy("admin:accounts_customuser_changelist"),
                    },
                    {
                        "title": "Buyer profiles",
                        "icon": "person",
                        "link": reverse_lazy("admin:accounts_buyerprofile_changelist"),
                    },
                    {
                        "title": "Seller stores",
                        "icon": "storefront",
                        "link": reverse_lazy("admin:accounts_sellerprofile_changelist"),
                        "badge": "nyakizu.admin_dashboard.pending_sellers_badge",
                    },
                    {
                        "title": "Buyer–Seller Links",
                        "icon": "handshake",
                        "link": reverse_lazy("admin:accounts_buyersellerrelationship_changelist"),
                    },
                    {
                        "title": "Store follows",
                        "icon": "favorite",
                        "link": reverse_lazy("admin:accounts_buyerstorefollow_changelist"),
                    },
                ],
            },
            {
                "title": "Catalog",
                "separator": True,
                "items": [
                    {
                        "title": "Categories",
                        "icon": "category",
                        "link": reverse_lazy("admin:products_category_changelist"),
                    },
                    {
                        "title": "Products",
                        "icon": "inventory_2",
                        "link": reverse_lazy("admin:products_product_changelist"),
                    },
                ],
            },
            {
                "title": "Orders & Finance",
                "separator": True,
                "items": [
                    {
                        "title": "Orders",
                        "icon": "shopping_cart",
                        "link": reverse_lazy("admin:orders_order_changelist"),
                    },
                    {
                        "title": "Order status log",
                        "icon": "history",
                        "link": reverse_lazy("admin:orders_orderstatusevent_changelist"),
                    },
                ],
            },
        ],
    },
}

# ── Django REST Framework ─────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    # CsrfExemptSessionAuthentication skips CSRF enforcement so Next.js
    # can call the API during development without needing a CSRF token.
    # Switch back to standard SessionAuthentication in production with HTTPS.
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'nyakizu.auth.CsrfExemptSessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# ── CORS ──────────────────────────────────────────────────────────────────────
# EXTRA_CORS_ORIGINS / EXTRA_CSRF_ORIGINS: comma-separated, for the deployed
# frontend origin(s) — e.g. https://nyakizu.vercel.app. The localhost dev
# ports stay allowed in every environment so local dev against a deployed
# backend still works; add production origins on top rather than replacing.
_dev_frontend_origins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3003',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3003',
]
_extra_cors_origins = config('EXTRA_CORS_ORIGINS', default='', cast=Csv())
_extra_csrf_origins  = config('EXTRA_CSRF_ORIGINS', default='', cast=Csv())

CORS_ALLOWED_ORIGINS = _dev_frontend_origins + list(_extra_cors_origins)
CORS_ALLOW_CREDENTIALS = True   # send session cookie back

# ── CSRF ──────────────────────────────────────────────────────────────────────
CSRF_TRUSTED_ORIGINS = _dev_frontend_origins + list(_extra_csrf_origins)

# 'Lax' is safe here (in both dev and production) specifically because the
# frontend proxies all /api/ calls through its own origin (see
# frontend/next.config.ts's rewrites()) rather than calling this backend
# cross-site — the browser only ever sees same-site requests. Don't set
# this to 'None' to "support cross-site" without first re-checking that
# proxy: 'None' cookies get silently dropped by Brave/Safari's cross-site
# tracking protection regardless of Secure, which is what broke login
# before the proxy was added.
CSRF_COOKIE_SAMESITE = config('CSRF_COOKIE_SAMESITE', default='Lax')

# ── Session cookies ───────────────────────────────────────────────────────────
SESSION_COOKIE_SAMESITE = config('SESSION_COOKIE_SAMESITE', default='Lax')
SESSION_COOKIE_SECURE   = config('SESSION_COOKIE_SECURE', default=not DEBUG, cast=bool)

# Without these, Django's default is a 2-week persistent session cookie —
# a browser that logged into /admin/ once stays signed in for two weeks,
# which reads as "no login required" the next time the tab is reopened.
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
SESSION_COOKIE_AGE = 60 * 60 * 4  # 4 hours

# ── Email (SMTP) ────────────────────────────────────────────────────────────
# These are required for sending the verification email during registration.
# Set them via environment variables / .env.
EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = config('EMAIL_HOST', default='')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default=EMAIL_HOST_USER)
FRONTEND_VERIFY_BASE_URL = config('FRONTEND_VERIFY_BASE_URL', default='http://localhost:3000')


# ── django-allauth ────────────────────────────────────────────────────────────
SITE_ID = 1

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

# After Google finishes, land on a tiny frontend page that looks up the
# fresh session and routes the user to their role's dashboard.
LOGIN_REDIRECT_URL          = f'{FRONTEND_VERIFY_BASE_URL}/auth/google/done'
ACCOUNT_LOGOUT_REDIRECT_URL = FRONTEND_VERIFY_BASE_URL

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        # Credentials come from .env — no DB SocialApp/Site row needed.
        # Register the redirect URI in Google Cloud Console as:
        #   <backend origin>/accounts/google/login/callback/
        'APP': {
            'client_id': config('GOOGLE_CLIENT_ID', default=''),
            'secret':    config('GOOGLE_CLIENT_SECRET', default=''),
            'key': '',
        },
        'SCOPE': ['profile', 'email'],
        'AUTH_PARAMS': {'access_type': 'online'},
        'FETCH_USERINFO': True,
    }
}

# Send the user straight to Google on GET — no intermediate confirm page.
SOCIALACCOUNT_LOGIN_ON_GET   = True
SOCIALACCOUNT_AUTO_SIGNUP    = True

# If someone registered with email/password and later uses Google with the
# same address, sign them into that existing account instead of erroring.
# Safe because Google only hands us verified email addresses.
SOCIALACCOUNT_EMAIL_AUTHENTICATION              = True
SOCIALACCOUNT_EMAIL_AUTHENTICATION_AUTO_CONNECT = True
ACCOUNT_SIGNUP_FIELDS        = ['email*', 'password1*', 'password2*']
ACCOUNT_LOGIN_METHODS        = ['email']
ACCOUNT_DEFAULT_HTTP_PROTOCOL = 'http'

ACCOUNT_ADAPTER           = 'accounts.adapters.AccountAdapter'
SOCIALACCOUNT_ADAPTER     = 'accounts.adapters.SocialAccountAdapter'
