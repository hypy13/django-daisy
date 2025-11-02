import re
from typing import Optional, Dict, Any
from urllib.parse import parse_qs

from django import template
from django.contrib.admin.models import LogEntry
from django.contrib.admin.templatetags import admin_list
from django.contrib.admin.templatetags.admin_list import result_list, result_headers, result_hidden_fields, results
from django.contrib.admin.templatetags.base import InclusionAdminNode
from django.contrib.admin.views.main import PAGE_VAR
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.http import HttpRequest
from django.template.loader import get_template
from django.urls import reverse
from django.utils.html import format_html
from django.utils.safestring import mark_safe, SafeString

register = template.Library()

# Constants
BOOLEAN_ICON_CLASSES = {
    True: "text-base fa fa-circle-check text-success",
    False: "text-base fa fa-circle-xmark text-error",
    None: "text-base fa fa-question-circle",
}

MULTIPLE_SELECT_FILTERS = [
    'ChoicesFieldListFilter',
    'AllValuesFieldListFilter',
    'RelatedOnlyFieldListFilter',
    'RelatedFieldListFilter',
]


def custom_boolean_icon(field_val: Optional[bool]) -> SafeString:
    """Custom boolean icon for Django admin with improved styling."""
    icon_class = BOOLEAN_ICON_CLASSES.get(field_val, BOOLEAN_ICON_CLASSES[None])
    return format_html('<i class="{}"></i>', icon_class)


# Monkey patch the admin boolean icon
admin_list._boolean_icon = custom_boolean_icon


@register.simple_tag
def get_recent_changes(model_instance):
    """
    Template tag to retrieve the 4 most recent LogEntry changes for a specific model instance.

    Usage in template:
    {% get_recent_changes object %} - gets 4 most recent changes for the object
    """
    content_type = ContentType.objects.get_for_model(model_instance)

    return LogEntry.objects.select_related('user', 'content_type').filter(
        content_type=content_type,
        object_id=str(model_instance.pk)
    ).order_by('-action_time')[:4]


def daisy_result_list(cl):
    """
    Display the headers and data list together.
    """
    headers = list(result_headers(cl))
    num_sorted_fields = 0
    for h in headers:
        if h["sortable"] and h["sorted"]:
            num_sorted_fields += 1

    return {
        "cl": cl,
        "result_hidden_fields": list(result_hidden_fields(cl)),
        "result_headers": headers,
        "num_sorted_fields": num_sorted_fields,
        "results": list(results(cl)),
    }


@register.tag(name="daisy_result_list")
def daisy_result_list_tag(parser, token):
    return InclusionAdminNode(
        parser,
        token,
        func=daisy_result_list,
        template_name="change_list_results.html",
        takes_context=False,
    )


# String manipulation filters
@register.filter(name='replace')
def replace_filter(value: str, args: str) -> str:
    """Replace substring in value with new substring."""
    try:
        old_val, new_val = args.split(',', 1)
        return str(value).replace(old_val, new_val)
    except ValueError:
        return str(value)


@register.filter(name='add_class')
def add_class_filter(value: Any, css_class: str) -> Any:
    """Add CSS class to form widget or HTML string."""
    if hasattr(value, 'as_widget'):
        return value.as_widget(attrs={'class': css_class})
    elif isinstance(value, str):
        return _append_class_to_html_tag(value, css_class)
    return value


@register.filter(name='apply_class_to_widget')
def apply_class_to_widget_filter(widget: Dict[str, Any], new_classes: str) -> Dict[str, Any]:
    """Apply additional CSS classes to a widget dictionary."""
    current_class = widget.get('attrs', {}).get('class', '')
    widget.setdefault('attrs', {})['class'] = f"{current_class} {new_classes}".strip()
    return widget


@register.filter
def sum_errors(formset) -> int:
    """Calculate total number of errors in a formset."""
    field_errors = sum(len(form.errors) for form in formset)
    non_form_errors = (
        len(formset.non_form_errors())
        if hasattr(formset, 'non_form_errors')
        else 0
    )
    return field_errors + non_form_errors


# Simple tags for requests and popups
@register.simple_tag(name="popup_val")
def popup_value_tag(request: HttpRequest) -> Optional[str]:
    """Get popup parameter from request."""
    return request.GET.get("_popup")


@register.simple_tag
def get_page_link(cl, page_num: int) -> str:
    """Generate pagination link for Django admin changelist."""
    return cl.get_query_string({PAGE_VAR: page_num})


@register.simple_tag
def get_user_admin_change_url(user) -> str:
    """Generate admin change URL for a user instance."""
    try:
        User = get_user_model()
        app_label = User._meta.app_label
        model_name = User._meta.model_name
        return reverse(f"admin:{app_label}_{model_name}_change", args=[user.pk])
    except Exception:
        return '#'


@register.simple_tag
def get_app_icon(*apps) -> str:
    """Get icon attribute from the first app that has one."""
    for app in apps:
        if hasattr(app, 'icon'):
            return app.icon
    return ''


# Admin list filter tags
@register.simple_tag
def admin_list_filter(cl, spec, request: HttpRequest) -> SafeString:
    """Render admin list filter template."""
    template = get_template(spec.template)
    context = {
        "title": spec.title,
        "choices": list(spec.choices(cl)),
        "spec": spec,
    }
    return template.render(context, request=request)


@register.simple_tag
def get_filter_keys(spec) -> str:
    """Get comma-separated list of filter parameter keys."""
    return ",".join(spec.expected_parameters())


@register.simple_tag
def get_active_filters_count(cl) -> int:
    """Get count of active filters in changelist."""
    return len(cl.filter_params) if hasattr(cl, 'filter_params') else 0


@register.simple_tag
def is_multiple_filter_choice(spec) -> str:
    """Check if filter spec supports multiple selections."""
    from django.contrib.admin import filters

    multiple_select_classes = [
        filters.ChoicesFieldListFilter,
        filters.AllValuesFieldListFilter,
        filters.RelatedOnlyFieldListFilter,
        filters.RelatedFieldListFilter,
    ]

    if (spec.__class__ in multiple_select_classes or
            getattr(spec, 'multiple', False)):
        return 'multiple'
    return ''


@register.simple_tag
def is_active_choice(choice: Dict[str, Any], spec, request: HttpRequest) -> str:
    """Check if a filter choice is currently active/selected."""
    if choice.get('selected'):
        return 'selected'

    for filter_key in spec.expected_parameters():
        if "expertise" in filter_key:
            print('x')
        if is_multiple_filter_choice(spec):
            filter_key = filter_key.replace('__exact', '__in')
            if not filter_key.endswith('__in'):
                filter_key = filter_key + '__in'

        choice_value = get_bare_option_value(spec, choice)
        current_values = request.GET.get(filter_key)

        if current_values and choice_value:
            if choice_value in current_values.split(','):
                return 'selected'

    return ''


@register.simple_tag
def get_choice_value(spec, choice: Dict[str, Any]) -> str:
    """Get the query string value for a filter choice."""
    query_string = choice['query_string']
    # Future enhancement: handle multiple filter logic here if needed
    return query_string


@register.simple_tag
def get_bare_option_value(spec, choice: Dict[str, Any]) -> str:
    """Extract bare option values from choice query string."""
    values = []
    query_string = choice['query_string']

    if query_string.startswith('?'):
        query_string = query_string[1:]

    for filter_key in spec.expected_parameters():
        parsed_values = parse_qs(query_string).get(filter_key)
        if parsed_values and parsed_values[0]:
            values.append(parsed_values[0])

    return ','.join(values) if values else ''


# Private helper functions
def _append_class_to_html_tag(html_tag: str, new_class: str) -> SafeString:
    """Append CSS class to HTML tag string."""
    class_pattern = r'(class="[^"]*)(")'

    if re.search(class_pattern, html_tag):
        # Append to existing class attribute
        html_tag = re.sub(class_pattern, rf'\1 {new_class}\2', html_tag)
    else:
        # Add new class attribute
        html_tag = re.sub(r'(<[^>]*)(>)', rf'\1 class="{new_class}"\2', html_tag)

    return mark_safe(html_tag)
