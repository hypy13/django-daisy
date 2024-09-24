from django.db.models import PositiveBigIntegerField
from django.forms import fields


class ThousandSepWidget(fields.TextInput):
    template_name = 'django/forms/widgets/thousand_sep.html'

    def format_value(self, value):
        # Format the value with thousand separators
        # e.g., 200000 => '200,000'
        return '{:,}'.format(int(value)) if value else None

    def value_from_datadict(self, data, files, name):
        if value := super().value_from_datadict(data, files, name):
            return value.replace(',', '')
        return ''

    class Media:
        js = (
            'admin/fields/thousand_sep_field.js',
        )


class ThousandSepField(PositiveBigIntegerField):
    description = "number field with thousand separate eg: 200,000"

    def formfield(self, **kwargs):
        return super().formfield(**{
            'widget': ThousandSepWidget,
        })

    # def from_db_value(self, value, expression, connection):
    #     if value is None:
    #         return value
    #     return locale.format_string("%d", value, grouping=True)

    def get_prep_value(self, value):
        # Convert formatted value back to integer for storage
        if isinstance(value, str):
            value = value.replace(',', '')
        return super().get_prep_value(value)

    def value_to_string(self, obj):
        value = self.value_from_object(obj)
        return self.to_python(value)
