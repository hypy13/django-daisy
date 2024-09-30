from django.apps import apps
from django.conf import settings
from django.contrib import admin
from django.db import models
from django.shortcuts import render


# Helper function to get the author's full name
def get_author_name(self, obj):
    return obj.author.get_full_name() if obj.author else '-'


# Registering the get_author_name function to the admin's ModelAdmin class
admin.ModelAdmin.get_author_name = get_author_name

# Remove default form fields for specific date and time fields
admin.options.FORMFIELD_FOR_DBFIELD_DEFAULTS.pop(models.DateTimeField, None)
admin.options.FORMFIELD_FOR_DBFIELD_DEFAULTS.pop(models.DateField, None)
admin.options.FORMFIELD_FOR_DBFIELD_DEFAULTS.pop(models.TimeField, None)


class DaisyAdminSite(admin.AdminSite):
    password_change_template = 'admin/registration/password_change_form.html'
    password_change_done_template = 'admin/registration/password_change_done.html'
    site_title = ""
    site_header = "Administration"
    index_title = "Hi, Welcome to your dashboard"

    index_template = 'admin/index.htmls'

    def index(self, request, extra_context=None):
        """
        Display the main admin index page, which lists all of the installed
        apps that have been registered in this site.
        """
        extra_context = {
            'latest_history': self.get_log_entries(request)[:15]
        }

        app_list = self.get_app_list(request)

        context = {
            **self.each_context(request),
            "title": self.index_title,
            "subtitle": None,
            "app_list": app_list,
            **(extra_context or {}),
        }

        request.current_app = self.name

        return render(
            request, [
                "admin/dashboard.html",
                "admin/index.html"
            ], context
        )

    # Overriding the get_app_list method to sort apps and exclude hidden ones
    def get_app_list(self, request, app_label=None):
        """
        Return a sorted list of all installed apps that are registered in this site,
        excluding hidden apps and adding optional icons and dividers.
        """
        app_dict = self._build_app_dict(request, app_label)
        sorted_app_list = sorted(app_dict.values(), key=lambda x: x.get('order', 999))
        return [app for app in sorted_app_list if not app.get('hide', False)]

    def _build_app_dict(self, request, label=None):
        """
        Builds and modifies the app dictionary to include icons and app grouping logic.
        """
        app_dict = super()._build_app_dict(request, label)

        if label:
            return app_dict

        modified_app_dict = app_dict.copy()

        for app_label, app_info in app_dict.items():
            # Add icon and divider title to each app
            app_info['icon'] = getattr(apps.get_app_config(app_label), 'icon', '')
            app_info['divider_title'] = getattr(apps.get_app_config(app_label), 'divider_title', '')

            # Apply additional settings to individual apps from APPS_REORDER in settings.py
            if app_label in settings.APPS_REORDER:
                app_info.update(settings.APPS_REORDER[app_label])

        return modified_app_dict
