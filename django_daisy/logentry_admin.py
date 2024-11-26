from django.contrib import admin
from django.utils.translation import gettext_lazy as _


class LogentryAdmin(admin.ModelAdmin):
    list_display = (
        'content_type', '_action', 'action_time', 'user'
    )
    list_filter = (
        'content_type', 'user',
    )
    search_fields = ('user__username', )
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
