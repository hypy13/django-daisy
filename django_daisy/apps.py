from django.apps import AppConfig
from django.contrib import admin
from django.contrib.admin import sites

from . import module_settings  # noqa, load module settings
from .admin import DaisyAdminSite


class LogEntryAdmin(admin.ModelAdmin):
    def get_model_perms(self, request):
        return {}


class DefaultAppConfig(AppConfig):
    name = "django_daisy"
    default = True

    def ready(self):
        site = DaisyAdminSite()
        from .logentry_admin import LogentryAdmin  # noqate
        from django.contrib.admin.models import LogEntry  # noqate

        admin.site = site
        sites.site = site

        admin.site.register(LogEntry, LogEntryAdmin)


class BasicAppConfig(AppConfig):
    name = "django_daisy"
