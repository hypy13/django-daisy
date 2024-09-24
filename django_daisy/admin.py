# from captcha.fields import ReCaptchaField
# from captcha.widgets import ReCaptchaV3
from django.apps import apps
from django.conf import settings
from django.contrib import admin
from django.contrib.admin import helpers
from django.db import models
from django.template.response import TemplateResponse
from django.urls import path


def get_author_name(self, obj):
    return obj.author.get_full_name() if obj.author else '-'


admin.ModelAdmin.get_author_name = get_author_name

# class AdminAuthenticationForm(_AdminAuthenticationForm):
# captcha = ReCaptchaField(widget=ReCaptchaV3, error_messages={
#     'required': 'Google Recaptcha required!. please wait for page load'
# })


admin.options.FORMFIELD_FOR_DBFIELD_DEFAULTS.pop(models.DateTimeField, None)
admin.options.FORMFIELD_FOR_DBFIELD_DEFAULTS.pop(models.DateField, None)
admin.options.FORMFIELD_FOR_DBFIELD_DEFAULTS.pop(models.TimeField, None)


class DaisyAdminSite(admin.AdminSite):
    password_change_template = 'admin/registration/password_change_form.html'
    password_change_done_template = 'admin/registration/password_change_done.html'
    site_title = getattr(settings, 'ADMIN_TITLE', None) or "Admin"
    site_header = getattr(settings, 'ADMIN_HEADER', None) or "Administration"
    index_title = getattr(settings, 'ADMIN_INDEX_TITLE', None) or "Welcome Admin"

    # login_form = AdminAuthenticationForm

    def get_app_list(self, request, app_label=None):
        """
            Return a sorted list of all the installed apps that have been
            registered in this site.
        """
        app_dict = self._build_app_dict(request, app_label)
        # Sort the apps alphabetically.
        app_list = sorted(app_dict.values(), key=lambda x: x.get('order', 999))
        app_list = list(filter(lambda x: not x.get('hide', False), app_list))

        # Sort the models alphabetically within each app.
        # for app in app_list:
        #     if app.get('models'):
        #         app['models'].sort(key=lambda x: x['name'])

        return app_list

    def _build_app_dict(self, request, label=None):
        """
        add icon to each app
        """
        app_dict = super()._build_app_dict(request, label)
        if label:
            return app_dict

        app_dict_2 = app_dict.copy()

        for app_label in app_dict:
            app_dict[app_label]['icon'] = getattr(apps.get_app_config(app_label), 'icon', '')
            app_dict[app_label]['divider_title'] = getattr(apps.get_app_config(app_label), 'divider_title', '')
            app_name: str = apps.get_app_config(app_label).name.split('.')
            if len(app_name) == 3 and app_name[0] != 'django':
                if not app_dict_2.get(app_name[1], None):
                    app_dict_2[app_name[1]] = {
                        'name': app_name[1],
                        'apps': [],
                    }

                if app_name[1] in settings.APPS_REORDER:
                    app_dict_2[app_name[1]] = {**app_dict_2[app_name[1]], **settings.APPS_REORDER[app_name[1]]}

                app_dict_2[app_name[1]]['apps'].append(
                    app_dict[app_label]
                )

                app_dict_2.pop(app_label)

            # set extra config on APPS_REORDER in settings.py file
            if app_label in settings.APPS_REORDER:
                app_dict_2[app_label] = {**app_dict_2[app_label], **settings.APPS_REORDER[app_label]}

        return app_dict_2

    def docs_page(self, request):
        return TemplateResponse(request, "docs.html", context=self.each_context(request))

    def get_urls(self):
        urls = super().get_urls()
        return [
            path('dashboard_docs/', self.admin_view(self.docs_page), name='dashboard_docs')
        ] + urls


class CustomAdminForm(helpers.AdminForm):
    """
        override __init__ function for admin field maker
        to add is_aside attr
    """

    def __init__(self, form, fieldsets, prepopulated_fields, readonly_fields=None, model_admin=None):
        if model_admin and hasattr(model_admin, 'aside_fields'):
            for field in form.fields:
                if field in model_admin.aside_fields:
                    form.fields[field].is_aside = True
                    form.has_aside_fields = True

        super(CustomAdminForm, self).__init__(form, fieldsets, prepopulated_fields, readonly_fields, model_admin)


helpers.AdminForm = CustomAdminForm
