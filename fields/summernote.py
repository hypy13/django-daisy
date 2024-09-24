from django.db import models
from django import forms


class SummernoteField(models.TextField):

    def __init__(self, *args, column_type='mediumtext', **kwargs):
        # specifies column type choices are text | mediumtext | longtext
        # default is mediumtext
        self.column_type = column_type
        super(SummernoteField, self).__init__(*args, **kwargs)

    def formfield(self, **kwargs):
        kwargs['widget'] = forms.Textarea(attrs={'class': 'summernote'})
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

        return super(SummernoteField, self).db_type(connection)
