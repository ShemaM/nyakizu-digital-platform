"""
Django settings for the Nyakizu Digital Market platform.
"""

from pathlib import Path
from decouple import config, Csv

BASE_DIR = Path(__file__).resolve().parent.parent

# ── Security ──────────────────────────────────────────────────────────────────
SECRET_KEY = config('SECRET_KEY', default='dev-insecure-key-change-in-production')
# Fails closed: an absent/misconfigured DEBUG env var must never leave a
# deploy running in debug mode with CSRF/HSTS/secure-cookie checks relaxed.
# Local dev sets DEBUG=True explicitly in backend/.env, so this only changes
# behavior for the "env var forgotten" case.
DEBUG      = config('DEBUG', default=False, cast=bool)
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
    'drf_spectacular',
    'corsheaders',
    'storages',  # only actually used when R2_BUCKET_NAME is set — see STORAGES below
    'anymail',   # only actually used when RESEND_API_KEY is set — see EMAIL_BACKEND below
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
    # No-op unless ADMIN_ALLOWED_IPS is set — see admin_security.py. Placed
    # right after SecurityMiddleware so a blocked /admin/ request short-
    # circuits before session/CSRF middleware does any work on it.
    'nyakizu.admin_security.AdminIPAllowlistMiddleware',
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

# Password-reset email links stop working after this long. 30 minutes is the
# commonly recommended window (enough time to check email, tight enough to
# limit a leaked/intercepted link's usefulness) — Django's default is 3 days.
PASSWORD_RESET_TIMEOUT = config('PASSWORD_RESET_TIMEOUT', default=60 * 30, cast=int)

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
     'OPTIONS': {'min_length': 8}},
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
STATICFILES_DIRS = [BASE_DIR / 'static']  # project-level assets (e.g. the admin favicon)

# ── Media (user-uploaded files) ─────────────────────────────────────────────
# Local disk (FileSystemStorage) unless R2_BUCKET_NAME is set — most
# free-tier app hosts wipe local disk on every redeploy/restart, so
# uploads (avatars, product photos) need object storage to actually
# persist. Targets Cloudflare R2 (S3-compatible, no egress fees, 10GB
# free) via django-storages; any other S3-compatible provider works too,
# just point R2_ENDPOINT_URL at it.
R2_BUCKET_NAME = config('R2_BUCKET_NAME', default='')

# Without this, forgetting R2_BUCKET_NAME on a production deploy fails
# silently: uploads (avatars, product photos) "work" by landing on that
# instance's local disk, then vanish on the next deploy/restart, or are
# simply invisible to any other instance behind a load balancer — with
# no error anywhere to say why. Same pattern as the SECRET_KEY check above.
if not DEBUG and not R2_BUCKET_NAME:
    raise ValueError(
        'R2_BUCKET_NAME is not set with DEBUG=False. Uploaded files would be '
        'written to local disk and lost on the next deploy. Set R2_BUCKET_NAME '
        '(and R2_ENDPOINT_URL / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / '
        'R2_PUBLIC_URL) before running in production.'
    )

if R2_BUCKET_NAME:
    # django-storages' S3Boto3Storage does NOT use Django's own MEDIA_URL to
    # build file URLs — without 'custom_domain' here, .url() falls back to
    # generating a presigned URL against 'endpoint_url' (R2's private,
    # signed-access-only S3 API host), which a plain <img src="..."> can't
    # load at all. custom_domain is what makes it build a public
    # https://<custom_domain>/<key> URL instead.
    _r2_public_url = config('R2_PUBLIC_URL').rstrip('/')
    _r2_custom_domain = _r2_public_url.removeprefix('https://').removeprefix('http://')

    STORAGES = {
        'default': {
            'BACKEND': 'storages.backends.s3boto3.S3Boto3Storage',
            'OPTIONS': {
                'bucket_name': R2_BUCKET_NAME,
                'endpoint_url': config('R2_ENDPOINT_URL'),  # https://<account_id>.r2.cloudflarestorage.com
                'custom_domain': _r2_custom_domain,          # e.g. pub-xxxxxxxx.r2.dev — the public host actually used in file URLs
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
    MEDIA_URL = _r2_public_url + '/'
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
    "SITE_FAVICONS": [
        {"rel": "icon", "href": "nyakizu.admin_dashboard.favicon_ico_url", "type": "image/x-icon"},
        {"rel": "icon", "href": "nyakizu.admin_dashboard.favicon_png_url", "type": "image/png", "sizes": "192x192"},
    ],
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
    # CSRF is always enforced (see api.ts's fetchWithSession, which primes
    # the csrftoken cookie via GET /api/csrf/ and sends it back as
    # X-CSRFToken on every unsafe request) — it must never be conditioned
    # on DEBUG, since that flag can be wrong in a misconfigured deploy.
    # BasicAuthentication was removed here: this API is cookie/session-only
    # (see api.ts), and Basic's per-request username+password on every call
    # isn't covered by the dedicated `login` throttle scope — it's a second,
    # less-limited door into the same accounts.
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    # BrowsableAPIRenderer is a dev convenience (an HTML page instead of raw
    # JSON) whose templates pull in static assets (bootstrap.min.css etc.)
    # via the manifest-based staticfiles storage below — if collectstatic
    # ever doesn't run on a deploy, any request DRF routes to this renderer
    # (e.g. a client that doesn't send Accept: application/json, like an
    # uptime monitor) 500s. Only JSONRenderer in production removes that
    # failure mode entirely: plain JSON responses never touch static files.
    'DEFAULT_RENDERER_CLASSES': (
        ['rest_framework.renderers.JSONRenderer', 'rest_framework.renderers.BrowsableAPIRenderer']
        if DEBUG
        else ['rest_framework.renderers.JSONRenderer']
    ),
    # Global request-volume limits (by IP for anonymous, by user once
    # logged in), plus tighter per-endpoint scopes for the auth flows a
    # credential-stuffing/spam bot would actually target.
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '200/hour',
        'user': '1000/hour',
        'login': '10/min',
        'register': '10/hour',
        'password_reset': '5/hour',
    },
}

# ── API docs (drf-spectacular) ───────────────────────────────────────────────
# Served at /api/schema/ (raw OpenAPI) and /api/docs/ (Swagger UI) — see
# nyakizu/urls.py. No separate auth: same session/CSRF as the rest of the API,
# so the browsable UI can only actually execute requests once you're logged in.
SPECTACULAR_SETTINGS = {
    'TITLE': 'Nyakizu API',
    'DESCRIPTION': 'Buyer/seller marketplace API — accounts, products, orders.',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# ── CORS ──────────────────────────────────────────────────────────────────────
# EXTRA_CORS_ORIGINS / EXTRA_CSRF_ORIGINS: comma-separated, for the deployed
# frontend origin(s) — e.g. https://www.nyakizudigital.me. The localhost dev
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

# ── Email ─────────────────────────────────────────────────────────────────────
# Raw SMTP (587/465/25) is outright blocked outbound on Render's free tier —
# confirmed live (connect() hangs until timeout, a classic firewall signature,
# even after fixing an earlier IPv6-routing failure on the same port). Set
# RESEND_API_KEY to send over Resend's HTTPS API instead, which uses port 443
# like every other outbound call this app already makes, so it isn't subject
# to that block. Falls back to SMTP (nyakizu.emailing.IPv4EmailBackend) when
# RESEND_API_KEY is unset — e.g. local dev, or a host that doesn't block SMTP.
RESEND_API_KEY = config('RESEND_API_KEY', default='')
if RESEND_API_KEY:
    EMAIL_BACKEND = 'anymail.backends.resend.EmailBackend'
    ANYMAIL = {'RESEND_API_KEY': RESEND_API_KEY}
else:
    EMAIL_BACKEND = config('EMAIL_BACKEND', default='nyakizu.emailing.IPv4EmailBackend')

EMAIL_HOST = config('EMAIL_HOST', default='')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
# Python's smtplib has no socket timeout by default, so a slow/unreachable
# SMTP host would otherwise hang the sending thread indefinitely — see
# nyakizu/emailing.py for why that used to freeze the whole site.
EMAIL_TIMEOUT = config('EMAIL_TIMEOUT', default=10, cast=int)
# Without a domain verified in Resend, this MUST be onboarding@resend.dev
# (Resend's shared test sender) and mail can only reach your own Resend
# account email — verify a domain in Resend's dashboard to send to anyone
# else, then point this at an address on that domain.
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

# ── Logging ───────────────────────────────────────────────────────────────────
# Every app logger (e.g. nyakizu.emailing) and Django's own request/security
# loggers get one formatted stream to stdout, which is what Render's log
# viewer actually captures — without this, uncaught exceptions rely on
# Python's bare "lastResort" handler with no timestamp/level/logger name.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{asctime} {levelname} {name}: {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': config('DJANGO_LOG_LEVEL', default='INFO'),
            'propagate': False,
        },
    },
}

# ── Error monitoring (optional) ─────────────────────────────────────────────────
# Inactive until SENTRY_DSN is set — no account/DSN was configured for this
# project, so this only wires the integration up; set SENTRY_DSN in the
# environment (Render/Vercel) to start actually capturing exceptions.
SENTRY_DSN = config('SENTRY_DSN', default='')
if SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration
    from sentry_sdk.integrations.logging import LoggingIntegration

    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[
            DjangoIntegration(),
            LoggingIntegration(level=None, event_level='ERROR'),
        ],
        environment=config('SENTRY_ENVIRONMENT', default='production' if not DEBUG else 'development'),
        traces_sample_rate=config('SENTRY_TRACES_SAMPLE_RATE', default=0.0, cast=float),
        send_default_pii=False,
    )

# ── Web Push (optional) ──────────────────────────────────────────────────────
# Inactive until VAPID_PRIVATE_KEY is set — see nyakizu/push.py, which no-ops
# rather than erroring when it's unset, same pattern as email above. The
# matching public key must also be set as NEXT_PUBLIC_VAPID_PUBLIC_KEY on the
# frontend (safe to expose — that's the point of the public/private split).
# Generate a pair with: python -c "from py_vapid import Vapid02; v=Vapid02(); v.generate_keys(); ..."
VAPID_PRIVATE_KEY = config('VAPID_PRIVATE_KEY', default='')
VAPID_PUBLIC_KEY  = config('VAPID_PUBLIC_KEY', default='')
VAPID_CLAIMS_EMAIL = config('VAPID_CLAIMS_EMAIL', default='mailto:support@nyakizu.app')
