from django.db import models
from django import forms
from django.forms.widgets import Textarea


class JsonKeyValueWidget(Textarea):
    template_name = 'django/forms/widgets/keyvalue_field.html'

    def __init__(self, attrs={}):
        attrs['class'] = 'keyvalue-json-editor-field'
        super().__init__(attrs)

    class Media:
        js = (
            'admin/fields/keyvalue_field/script.js',
        )
        css = {
            'all': (
                'admin/fields/keyvalue_field/style.css',
            )
        }


class JsonKeyValueField(models.JSONField):
    description = "custom json key value field"

    def formfield(self, **kwargs):
        return super().formfield(**{
            'widget': JsonKeyValueWidget,
            'encoder': self.encoder,
            'decoder': self.decoder,
            **kwargs,
        })
