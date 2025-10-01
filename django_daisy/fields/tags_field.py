from django.db.models import CharField
from django.forms import fields


class TagInputWidget(fields.TextInput):
    """
        tags field widget
    """
    template_name = 'fields/tags_field.html'

    class Media:
        js = (
            'admin/fields/tags.widget.js',
        )

    def __init__(self, attrs=None):
        default_attrs = {
            'class': 'django-tags-input',
        }
        if attrs:
            default_attrs.update(attrs)
        super().__init__(default_attrs)


class TagModelField(CharField):
    description = "keyword field with comma separate in CharField"

    def __init__(self, *args, db_collation=None, **kwargs):
        kwargs['max_length'] = 255
        super().__init__(*args, **kwargs)

    def formfield(self, **kwargs):
        # override widget field
        defaults = {'widget': TagInputWidget}

        return super().formfield(**defaults)
