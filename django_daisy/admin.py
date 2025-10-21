import logging

from django.apps import apps
from django.conf import settings
from django.contrib import admin
from django.core.files.storage import FileSystemStorage
from django.http import HttpResponse
from django.shortcuts import render
from django.urls import path, reverse
from django.views.decorators.csrf import csrf_exempt

from django_daisy._helpers import ASSET_PATH
from django_daisy.module_settings import DAISY_SETTINGS

logger = logging.getLogger(__name__)


# Remove default form fields for specific date and time fields
# admin.options.FORMFIELD_FOR_DBFIELD_DEFAULTS.pop(models.DateTimeField, None)
# admin.options.FORMFIELD_FOR_DBFIELD_DEFAULTS.pop(models.DateField, None)
# admin.options.FORMFIELD_FOR_DBFIELD_DEFAULTS.pop(models.TimeField, None)


class DaisyAdminSite(admin.AdminSite):
    password_change_template = "admin/registration/password_change_form.html"
    password_change_done_template = "admin/registration/password_change_done.html"
    site_title = DAISY_SETTINGS.get("SITE_TITLE", "django admin")
    site_header = DAISY_SETTINGS.get("SITE_HEADER", "Administration")
    index_title = DAISY_SETTINGS.get("SITE_HEADER", "hi, welcome to your dashboard")
    logo = DAISY_SETTINGS.get(
        "SITE_LOGO", f"{ASSET_PATH}admin/img/daisyui-logomark.svg"
    )

    def get_urls(self):
        urls = [
            path("json-editor-upload-handler/", self.admin_view(self.upload_file), name='json-editor-upload-handler')
        ]
        return urls + super().get_urls()

    def get_log_entries(self, request):
        from django.contrib.admin.models import LogEntry

        return LogEntry.objects.select_related("content_type", "user")

    def index(self, request, extra_context=None):
        """
        Display the main admin index page, which lists all of the installed
        apps that have been registered in this site.
        """

        logentry_changelist_url = reverse("admin:admin_logentry_changelist")

        app_list = self.get_app_list(request)

        context = {
            **self.each_context(request),
            "latest_history": self.get_log_entries(request)[:15],
            "title": self.index_title,
            "app_list": app_list,
            "logentry_changelist_url": logentry_changelist_url,
            **(extra_context or {}),
        }

        request.current_app = self.name
        return render(request, self.index_template or "admin/index.html", context)

    # Overriding the get_app_list method to sort apps and exclude hidden ones
    def get_app_list(self, request, app_label=None):
        """
        Return a sorted list of all installed apps that are registered in this site,
        excluding hidden apps and adding optional icons and dividers.
        """
        app_dict = self._build_app_dict(request, app_label)
        sorted_app_list = sorted(
            app_dict.values(), key=lambda x: x.get("priority", 0), reverse=True
        )
        return [app for app in sorted_app_list if not app.get("hide", False)]

    def _build_app_dict(self, request, label=None):
        """
        Builds and modifies the app dictionary to include icons and app grouping logic.
        """
        app_dict = super()._build_app_dict(request, label)

        if label:
            return app_dict

        modified_app_dict = app_dict.copy()
        override_apps_config = DAISY_SETTINGS.get("APPS_REORDER", {})

        for app_label, app_info in app_dict.items():
            # Add icon and divider title to each app
            app_info["icon"] = getattr(apps.get_app_config(app_label), "icon", "")
            app_info["divider_title"] = getattr(
                apps.get_app_config(app_label), "divider_title", ""
            )

            if app_label in override_apps_config:
                app_info.update(override_apps_config[app_label])

        return modified_app_dict

    def each_context(self, request):
        context = super().each_context(request)
        try:
            change_language_url = reverse("set_language")
        except:
            change_language_url = None

        return {
            **context,
            **DAISY_SETTINGS,
            "change_language_url": change_language_url,
            "logo": self.get_logo(request),
            "can_delete_popup": "",
            "use_i18n": getattr(settings, "USE_I18N", False),
        }

    def get_logo(self, request):
        return self.logo

    @csrf_exempt
    def upload_file(self, request):
        if request.method != "POST":
            return HttpResponse(
                "Invalid request method", status=405, content_type="text/plain"
            )

        if "file" not in request.FILES:
            return HttpResponse(
                "No file uploaded", status=400, content_type="text/plain"
            )

        file = request.FILES["file"]

        try:
            fs = FileSystemStorage()
            filename = fs.save(file.name, file)
            url = request.build_absolute_uri(fs.url(filename))
            return HttpResponse(url, content_type="text/plain")

        except Exception as e:
            # Log the error for debugging purposes
            logger.error("Error saving file: %s", e)
            # Return a generic error message to the client
            return HttpResponse(
                "Failed to save file", status=500, content_type="text/plain"
            )
