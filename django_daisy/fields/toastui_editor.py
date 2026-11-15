from django import forms
from django.db import models
from django.urls import NoReverseMatch, reverse


class ToastUIEditorWidget(forms.Textarea):
    """Markdown editor. Uploads are available when a Daisy admin is installed."""

    def __init__(self, attrs=None, upload_url=None):
        super().__init__(attrs)
        self.upload_url = upload_url

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        widget_attrs = context['widget']['attrs']
        widget_attrs['class'] = (widget_attrs.get('class', '') + ' toastui-editor-field').strip()
        if self.upload_url is not None:
            widget_attrs['data-upload-url'] = self.upload_url
        else:
            try:
                widget_attrs['data-upload-url'] = reverse('admin:toastui-editor-upload')
                widget_attrs['data-attachments-url'] = reverse('admin:toastui-editor-attachments')
                widget_attrs['data-delete-url'] = reverse('admin:toastui-editor-delete')
            except NoReverseMatch:
                pass
        return context

    class Media:
        css = {'all': ('admin/fields/toastui-editor/toastui-editor.min.css',)}
        js = ('admin/fields/toastui-editor/toastui-editor.min.js',
              'admin/fields/toastui-editor/init.js')


class ToastUIEditorField(models.TextField):
    def formfield(self, **kwargs):
        if self.choices is None:
            kwargs.setdefault('widget', ToastUIEditorWidget)
        return super().formfield(**kwargs)
