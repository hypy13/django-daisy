from django.apps import AppConfig
from django.conf import settings
from django.contrib import admin
from django.contrib.admin import sites
from django.utils.module_loading import import_string

from . import module_settings  # noqa, load module settings

if default_admin_site := getattr(settings, 'DEFAULT_ADMIN_SITE_CLASS', None):
    AdminSiteClass = import_string(default_admin_site)
else:
    AdminSiteClass = import_string('django_daisy.admin.DaisyAdminSite')


class LogEntryAdmin(admin.ModelAdmin):
    def get_model_perms(self, request):
        return {}


class DefaultAppConfig(AppConfig):
    name = "django_daisy"
    default = True

    def ready(self):
        site = AdminSiteClass()
        from .logentry_admin import LogentryAdmin  # noqate
        from django.contrib.admin.models import LogEntry  # noqate

        admin.site = site
        sites.site = site

        admin.site.register(LogEntry, LogEntryAdmin)


class BasicAppConfig(AppConfig):
    name = "django_daisy"
