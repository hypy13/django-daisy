from django.db.models import CharField
from django.forms import fields


class CommaSepWidget(fields.TextInput):
    """
        tokenfield tags field widget
    """
    template_name = 'django/forms/widgets/comma_seperate.html'

    class Media:
        js = (
            'admin/panel/global_assets/js/plugins/forms/tags/tokenfield.min.js',
        )

    def __init__(self, attrs=None):
        default_attrs = {
            'class': 'tokenfield',
        }
        if attrs:
            default_attrs.update(attrs)
        super().__init__(default_attrs)


class CommaSepModelField(CharField):
    description = "keyword field with comma separate in CharField"

    def __init__(self, *args, db_collation=None, **kwargs):
        kwargs['max_length'] = 255
        super().__init__(*args, **kwargs)

    def formfield(self, **kwargs):
        # override widget field
        defaults = {'widget': CommaSepWidget}

        return super().formfield(**defaults)
