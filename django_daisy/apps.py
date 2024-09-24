from django.conf import settings
from django.contrib.admin import apps

from . import module_settings  # noqa


class DashboardConfig(apps.AdminConfig):
    default_site = getattr(settings, 'DEFAULT_ADMIN_SITE_CLASS', 'django_daisy.admin.DaisyAdminSite')
