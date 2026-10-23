"""Local development and Vercel production settings."""
import os
import sys
from pathlib import Path
from urllib.parse import urlparse

import dj_database_url
from django.core.exceptions import ImproperlyConfigured
from django.core.management.utils import get_random_secret_key
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
# Existing process variables take precedence over local files.
load_dotenv(BASE_DIR / '.env.local', override=False)
load_dotenv(BASE_DIR / '.env', override=False)

def env_bool(name, default=False):
    return os.environ.get(name, str(default)).lower() in {'true', '1', 'yes'}

def env_list(name, default=''):
    return [item.strip() for item in os.environ.get(name, default).split(',') if item.strip()]

ON_VERCEL = os.environ.get('VERCEL') == '1'
DEBUG = env_bool('DJANGO_DEBUG', not ON_VERCEL)
TESTING = 'test' in sys.argv
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', '')
if not SECRET_KEY and not DEBUG:
    raise ImproperlyConfigured('Set DJANGO_SECRET_KEY before deploying.')
SECRET_KEY = SECRET_KEY or get_random_secret_key()
if ON_VERCEL and DEBUG:
    raise ImproperlyConfigured('DJANGO_DEBUG must be false on Vercel.')

ALLOWED_HOSTS = env_list('DJANGO_ALLOWED_HOSTS', '127.0.0.1,localhost' if DEBUG else '')
for name in ['VERCEL_URL', 'VERCEL_PROJECT_PRODUCTION_URL']:
    host = os.environ.get(name, '').strip()
    if host and host not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(host)
if not DEBUG and not ALLOWED_HOSTS:
    raise ImproperlyConfigured('Set DJANGO_ALLOWED_HOSTS to your backend hostname.')

INSTALLED_APPS = [
    'django.contrib.admin', 'django.contrib.auth', 'django.contrib.contenttypes',
    'django.contrib.sessions', 'django.contrib.messages', 'django.contrib.staticfiles',
    'accounts.apps.AccountsConfig', 'content', 'publishing', 'directory', 'progress',
    'rest_framework', 'rest_framework.authtoken', 'corsheaders',
]
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
ROOT_URLCONF = 'backend.urls'
WSGI_APPLICATION = 'backend.wsgi.application'
TEMPLATES = [{
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [], 'APP_DIRS': True,
    'OPTIONS': {'context_processors': [
        'django.template.context_processors.request',
        'django.contrib.auth.context_processors.auth',
        'django.contrib.messages.context_processors.messages',
    ]},
}]

CORS_ALLOWED_ORIGINS = env_list('DJANGO_CORS_ORIGINS',
    'http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174' if DEBUG else '')
CSRF_TRUSTED_ORIGINS = env_list('DJANGO_CSRF_TRUSTED_ORIGINS', ','.join(CORS_ALLOWED_ORIGINS))
CORS_ALLOW_CREDENTIALS = False
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = env_bool('DJANGO_SECURE_SSL_REDIRECT', not DEBUG)
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 0 if DEBUG else int(os.environ.get('DJANGO_HSTS_SECONDS', '31536000'))
# Domain-wide HSTS/preload are controlled by the domain owner, not a shared host.
SECURE_HSTS_INCLUDE_SUBDOMAINS = env_bool('DJANGO_HSTS_INCLUDE_SUBDOMAINS', False)
SECURE_HSTS_PRELOAD = env_bool('DJANGO_HSTS_PRELOAD', False)
SILENCED_SYSTEM_CHECKS = ([] if SECURE_HSTS_INCLUDE_SUBDOMAINS else ['security.W005']) + ([] if SECURE_HSTS_PRELOAD else ['security.W021'])
X_FRAME_OPTIONS = 'DENY'

DATABASE_URL = os.environ.get('DATABASE_URL', '')
if DATABASE_URL:
    DATABASES = {'default': dj_database_url.parse(
        DATABASE_URL, conn_max_age=0, conn_health_checks=True,
        ssl_require=env_bool('DATABASE_SSL_REQUIRED', not DEBUG),
    )}
    if DATABASES['default']['ENGINE'] != 'django.db.backends.postgresql':
        raise ImproperlyConfigured('DATABASE_URL must be a PostgreSQL connection string.')
    DATABASES['default']['DISABLE_SERVER_SIDE_CURSORS'] = True
else:
    if not DEBUG and not TESTING:
        raise ImproperlyConfigured('Production requires DATABASE_URL; SQLite is local-only.')
    DATABASES = {'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.environ.get('PCMC_DB_PATH', BASE_DIR / 'db.sqlite3'),
    }}

AUTH_USER_MODEL = 'accounts.User'
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STORAGES = {
    'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
    'staticfiles': {'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage'},
}
MEDIA_URL = '/media/'
MEDIA_ROOT = Path(os.environ.get('PCMC_MEDIA_ROOT', BASE_DIR / 'media'))
UPLOAD_MAX_BYTES = 10 * 1024 * 1024
UPLOAD_INTENT_SECONDS = 600
UPLOAD_STORAGE = os.environ.get('UPLOAD_STORAGE', 's3' if ON_VERCEL else 'local')

S3_BUCKET_NAME = os.environ.get('S3_BUCKET_NAME', '')
S3_ENDPOINT_URL = os.environ.get('S3_ENDPOINT_URL', '') or None
S3_REGION = os.environ.get('S3_REGION', 'auto' if S3_ENDPOINT_URL else 'us-east-1')
S3_ACCESS_KEY_ID = os.environ.get('S3_ACCESS_KEY_ID', '')
S3_SECRET_ACCESS_KEY = os.environ.get('S3_SECRET_ACCESS_KEY', '')
S3_PUBLIC_BASE_URL = os.environ.get('S3_PUBLIC_BASE_URL', '').rstrip('/')
if UPLOAD_STORAGE == 's3':
    missing = [key for key in ['S3_BUCKET_NAME','S3_ACCESS_KEY_ID','S3_SECRET_ACCESS_KEY','S3_PUBLIC_BASE_URL'] if not globals()[key]]
    if missing:
        raise ImproperlyConfigured('Missing object-storage settings: ' + ', '.join(missing))
    parsed = urlparse(S3_PUBLIC_BASE_URL)
    if parsed.scheme != 'https' or not parsed.netloc or parsed.path not in {'', '/'}:
        raise ImproperlyConfigured('S3_PUBLIC_BASE_URL must be an HTTPS public bucket/CDN origin without a path.')
    STORAGES['default'] = {'BACKEND': 'storages.backends.s3.S3Storage', 'OPTIONS': {
        'bucket_name': S3_BUCKET_NAME, 'access_key': S3_ACCESS_KEY_ID,
        'secret_key': S3_SECRET_ACCESS_KEY, 'endpoint_url': S3_ENDPOINT_URL,
        'region_name': S3_REGION, 'signature_version': 's3v4',
        'custom_domain': parsed.netloc, 'url_protocol': 'https:',
        'querystring_auth': False, 'default_acl': None, 'file_overwrite': False,
    }}
elif UPLOAD_STORAGE != 'local':
    raise ImproperlyConfigured('UPLOAD_STORAGE must be local or s3.')
elif not DEBUG and not TESTING:
    raise ImproperlyConfigured('Production requires UPLOAD_STORAGE=s3 and durable object storage.')

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticatedOrReadOnly'],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_THROTTLE_RATES': {'submissions': '20/hour'},
}
LOGGING = {'version': 1, 'disable_existing_loggers': False, 'handlers': {'console': {'class': 'logging.StreamHandler'}}, 'root': {'handlers': ['console'], 'level': 'INFO'}}
