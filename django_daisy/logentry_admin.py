from django.contrib import admin
from django.contrib.admin.models import LogEntry
from django.utils.translation import gettext_lazy as _


@admin.register(LogEntry)
class LogentryAdmin(admin.ModelAdmin):
    list_display = (
        'content_type', '_action', 'action_time', 'user'
    )
    list_per_page = 50

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_add_permission(self, request):
        return False

    def get_model_perms(self, request):
        return {}

    @admin.display(description=_('Action'))
    def _action(self, obj):
        return obj.get_action_flag_display()

    def get_urls(self):
        u = super().get_urls()
        print(u)
        return u
