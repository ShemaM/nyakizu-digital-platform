"""
Django settings for nyakizu project.
Nyakizu Digital Market — B2B phone accessories platform (Rwanda).
"""

from pathlib import Path
from decouple import config

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# ---------------------------------------------------------------------------
# Security — load sensitive values from .env (never hardcode secrets!)
# ---------------------------------------------------------------------------
SECRET_KEY = config('SECRET_KEY', default='dev-insecure-key-change-in-production')
DEBUG = config('DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')

# ---------------------------------------------------------------------------
# Applications
# ---------------------------------------------------------------------------
INSTALLED_APPS = [
    # Django built-ins
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',       # Django REST Framework — builds our API
    'corsheaders',          # Allows the Next.js frontend to call our API

    # django-allauth — handles Google (and other) OAuth2 logins
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
    'corsheaders.middleware.CorsMiddleware',   # Must be as high as possible
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'allauth.account.middleware.AccountMiddleware',   # required by django-allauth
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'nyakizu.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

# ---------------------------------------------------------------------------
# Database — SQLite is fine for development and learning
# ---------------------------------------------------------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# ---------------------------------------------------------------------------
# Custom user model — we extend Django's default user
# ---------------------------------------------------------------------------
AUTH_USER_MODEL = 'accounts.CustomUser'

# ---------------------------------------------------------------------------
# Password validation
# ---------------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 6}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ---------------------------------------------------------------------------
# Internationalisation
# ---------------------------------------------------------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Kigali'
USE_I18N = True
USE_TZ = True

# ---------------------------------------------------------------------------
# Static files
# ---------------------------------------------------------------------------
STATIC_URL = 'static/'

# ---------------------------------------------------------------------------
# Default primary key field
# ---------------------------------------------------------------------------
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ---------------------------------------------------------------------------
# Django REST Framework configuration
# ---------------------------------------------------------------------------
REST_FRAMEWORK = {
    # Require authentication by default; individual views can override this
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    # Return JSON for browsable API pagination
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# ---------------------------------------------------------------------------
# CORS — allow the Next.js dev server (port 3000) to call our API
# ---------------------------------------------------------------------------
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]
CORS_ALLOW_CREDENTIALS = True   # needed so the session cookie is sent back

# ---------------------------------------------------------------------------
# django-allauth configuration
# ---------------------------------------------------------------------------
SITE_ID = 1   # required by django.contrib.sites

AUTHENTICATION_BACKENDS = [
    # Default — lets users log in with username/password through the admin
    'django.contrib.auth.backends.ModelBackend',
    # Allauth — handles Google OAuth2
    'allauth.account.auth_backends.AuthenticationBackend',
]

# After a successful Google login, redirect back to the Next.js app
LOGIN_REDIRECT_URL = 'http://localhost:3000/'
ACCOUNT_LOGOUT_REDIRECT_URL = 'http://localhost:3000/'

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        # Scopes we request from Google — just email and profile for now
        'SCOPE': ['profile', 'email'],
        'AUTH_PARAMS': {'access_type': 'online'},
        # Store tokens so we can call Google APIs later if needed
        'FETCH_USERINFO': True,
    }
}

# Signup fields for allauth (allauth >= 65.4 syntax)
SOCIALACCOUNT_AUTO_SIGNUP = True
ACCOUNT_SIGNUP_FIELDS = ['email*', 'password1*', 'password2*']
ACCOUNT_LOGIN_METHODS = ['email']

# Needed when AUTH_USER_MODEL is a custom model
ACCOUNT_DEFAULT_HTTP_PROTOCOL = 'http'   # use 'https' in production

# Point allauth to our custom adapters
ACCOUNT_ADAPTER = 'accounts.adapters.AccountAdapter'
SOCIALACCOUNT_ADAPTER = 'accounts.adapters.SocialAccountAdapter'
