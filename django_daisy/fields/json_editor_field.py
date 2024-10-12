import json

from django import forms
from django.db import models


class JsonEditorWidget(forms.Textarea):
    template_name = 'fields/json_editor_field.html'
    schema_template = {}

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        context['schema_template'] = self.schema_template
        return context

    def __init__(self, attrs=None, schema_template=None):
        if schema_template:
            self.schema_template = schema_template

        super().__init__(attrs)

    class Media:
        js = [
            'admin/fields/json-editor/jsoneditor.min.js',
            'admin/fields/json-editor/init.js'
        ]


class JsonEditorField(models.JSONField):
    schema = {}

    def __init__(self, *args, schema: dict, **kwargs):
        self.schema = schema
        super().__init__(*args, **kwargs)

    def formfield(self, **kwargs):
        kwargs.update({
            'widget': JsonEditorWidget(schema_template=json.dumps(self.schema)),
        })
        return super(JsonEditorField, self).formfield(**kwargs)

    def deconstruct(self):
        name, path, args, kwargs = super().deconstruct()
        kwargs['schema'] = self.schema

        return name, path, args, kwargs
