from django import forms
from django.db import models


class TinyWidget(forms.Textarea):
    class Media:
        js = (
            'admin/fields/tiny_init.js',
        )


class TinyEditorField(models.TextField):

    def __init__(self, *args, column_type='mediumtext', inline=False, **kwargs):
        # specifies column type choices are text | mediumtext | longtext
        # default is mediumtext
        self.column_type = column_type
        self.inline = inline
        super().__init__(*args, **kwargs)

    def formfield(self, **kwargs):
        _class = "editor-field" if not self.inline else "editor-inline-field"
        kwargs['widget'] = TinyWidget(attrs={'class': _class})
        return super().formfield(**{
            'max_length': self.max_length,
            **({} if self.choices is not None else {'widget': forms.Textarea}),
            **kwargs,
        })

    def db_type(self, connection):
        if connection.settings_dict['ENGINE'] == 'django.db.backends.mysql':
            return self.column_type
        elif connection.settings_dict['ENGINE'] == 'django.db.backends.postgresql':
            return 'text'

        return super().db_type(connection)
