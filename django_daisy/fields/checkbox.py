from django import forms
from django.db import models


class CheckBoxModelField(models.CharField):
    def formfield(self, **kwargs):
        return forms.ChoiceField(
            choices=self.choices,
            widget=forms.RadioSelect,
            label=self.verbose_name,
        )
