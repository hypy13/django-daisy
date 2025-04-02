from django.conf import settings

ASSET_PATH = getattr(settings, "STATIC_URL", "/static/")
