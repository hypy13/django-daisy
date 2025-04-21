import re
from urllib.parse import unquote, parse_qs

from django import template
from django.contrib.admin.templatetags import admin_list
from django.contrib.admin.views.main import (
    PAGE_VAR,
)
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils.html import format_html
from django.utils.safestring import mark_safe


def custom_boolean_icon(field_val):
    # Define icon and badge class based on field value
    icon_class = {
        True: "text-base fa fa-circle-check text-success",
        False: "text-base fa fa-circle-xmark text-error",
        None: "text-base fa fa-question-circle",
    }[field_val]

    # Return the badge with the icon inside it
    return format_html(
        '<i class="{}"></i>',
        icon_class
    )


admin_list._boolean_icon = custom_boolean_icon

register = template.Library()


@register.filter(name='replace')
def replace(value, args):
    key, val = args.split(',')
    return str(value).replace(key, val)


@register.simple_tag(name="popup_val")
def popup_val(request):
    return request.GET.get("_popup")


@register.filter
def sum_errors(formset):
    field_err = sum(len(form.errors) for form in formset)
    fieldset_err = len(formset.non_form_errors()) if hasattr(formset, 'non_form_errors') else 0
    return fieldset_err + field_err


def append_class_to_html_tag(html_tag, new_class):
    # Regex to find the class attribute
    pattern = r'(class="[^"]*)(")'

    # Check if 'class' attribute exists
    if re.search(pattern, html_tag):
        # If class attribute exists, append the new class
        html_tag = re.sub(pattern, r'\1 ' + new_class + r'\2', html_tag)
    else:
        # If no class attribute, add one before the closing '>'
        html_tag = re.sub(r'(<[^>]*)(>)', r'\1 class="' + new_class + r'"\2', html_tag)

    return mark_safe(html_tag)


@register.filter(name='add_class')
def add_class(value, css_class):
    if hasattr(value, 'as_widget'):
        return value.as_widget(attrs={'class': css_class})

    elif isinstance(value, str):
        return append_class_to_html_tag(value, css_class)

    return value


@register.filter(name='apply_class_to_widget')
def apply_class_to_widget(widget, new_classes):
    default_class = widget.get('attrs', {}).get('class', '')
    widget['attrs']['class'] = f"{default_class} {new_classes}"
    return widget


def get_value_by_key(query, key):
    # Remove the leading '?' if present
    if query.startswith('?'):
        query = query[1:]

    # Create a regex pattern to match the key and capture its value
    pattern = re.compile(rf"{re.escape(key)}=([^&]*)")

    # Search for the pattern in the query string
    match = pattern.search(query)

    if match:
        # If a match is found, decode the value and return it
        return unquote(match.group(1))

    return None  # Return None if the key is not found


@register.simple_tag
def is_active_choice(choice, spec):
    if choice.get('selected') and choice['query_string'] != '?':
        return 'selected'

    if hasattr(spec, "lookup_kwarg"):
        filter_key = spec.lookup_kwarg

    elif hasattr(spec, "parameter_name"):
        filter_key = spec.parameter_name

    else:
        filter_key = spec.field_generic

    _filter_key = filter_key
    if "__" not in filter_key:
        _filter_key = filter_key + '__in'

    if hasattr(spec, 'request'):
        filter_values = spec.request.GET.get(filter_key.replace('__exact', '__in'))
    else:
        filter_values = ""

    current_choice_value = get_value_by_key(choice['query_string'], filter_key)
    altered_choice_value = get_value_by_key(choice['query_string'], _filter_key)
    if altered_choice_value:
        if current_choice_value in altered_choice_value.split(','):
            return 'selected'

    filter_values_list = filter_values.split(',') if filter_values else []
    if current_choice_value and filter_values:
        if current_choice_value in filter_values_list or choice['display'] in filter_values_list:
            return 'selected'

    return ''


@register.simple_tag
def get_active_filters_count(cl):
    if hasattr(cl, 'filter_params'):
        return len(cl.filter_params)

    return 0


@register.simple_tag
def is_multiple_filter_choice(spec):
    from django.contrib.admin import filters

    multiple_select = [
        filters.ChoicesFieldListFilter,
        filters.AllValuesFieldListFilter,
        filters.RelatedOnlyFieldListFilter,
        filters.RelatedFieldListFilter,
    ]

    if spec.__class__ in multiple_select or getattr(spec, 'multiple', False):
        return 'multiple'

    return ''


@register.simple_tag
def get_bare_option_value(spec, choice):
    values = []
    qs = choice['query_string']
    if qs.startswith('?'):
        qs = qs[1:]

    for fk in spec.expected_parameters():
        val = parse_qs(qs).get(fk)
        if val and val[0]:
            values.append(val[0])

    return ','.join(values) if values else ''


@register.simple_tag
def get_filter_keys(spec):
    return ",".join(spec.expected_parameters())


@register.simple_tag
def get_app_icon(*apps):
    for app in apps:
        if hasattr(app, 'icon'):
            return app.icon


@register.simple_tag
def get_user_admin_change_url(user):
    try:
        User = get_user_model()
        app_label = User._meta.app_label
        model_name = User._meta.model_name
        return reverse(f"admin:{app_label}_{model_name}_change", args=[user.pk])
    except Exception:
        return '#'


@register.simple_tag
def get_page_link(cl, i):
    return cl.get_query_string({PAGE_VAR: i})
