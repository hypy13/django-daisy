from django.conf import settings
from django.utils.translation import gettext_lazy as _

from django_daisy._helpers import ASSET_PATH

# Define defaults for DAISY_SETTINGS
DEFAULT_DAISY_SETTINGS = {
    "SITE_TITLE": "Django Admin",
    "SITE_HEADER": "Administration",
    "INDEX_TITLE": "hi, welcome to your dashboard",
    "SITE_LOGO": f"{ASSET_PATH}admin/img/daisyui-logomark.svg",
    "EXTRA_STYLES": [],
    "EXTRA_SCRIPTS": [],
    "LOAD_FULL_STYLES": False,
    "SHOW_CHANGELIST_FILTER": False,
    "DONT_SUPPORT_ME": False,
    "SIDEBAR_FOOTNOTE": "",
    "FORM_RENDERER": "django.forms.renderers.TemplatesSetting",
    "X_FRAME_OPTIONS": "SAMEORIGIN",
    "DEFAULT_THEME": 'None',
    "DEFAULT_THEME_DARK": None,
    "SHOW_THEME_SELECTOR": True,
    "THEME_LIST": [
        {"name": _("Light"), "value": "light"},
        {"name": _("Dark"), "value": "dark"},
        {"name": _("CMYK"), "value": "cmyk"},
        {"name": _("Dracula"), "value": "dracula"},
        {"name": _("Lemonade"), "value": "lemonade"},
        {"name": _("Halloween"), "value": "halloween"},
        {"name": _("Garden"), "value": "garden"},
    ],
    "APPS_REORDER": {
        "auth": {
            "icon": "fa-solid fa-person-military-pointing",
            "name": _("Authentication"),
            "hide": False,
            "app": "users",
            # 'priority': 1,  # higher value will appear on top items
        },
    },
}

# Get DAISY_SETTINGS from settings.py or fall back to defaults
DAISY_SETTINGS = getattr(settings, "DAISY_SETTINGS", DEFAULT_DAISY_SETTINGS)

# Ensure any missing keys from defaults are included
for key, value in DEFAULT_DAISY_SETTINGS.items():
    DAISY_SETTINGS.setdefault(key, value)

settings.FORM_RENDERER = DAISY_SETTINGS["FORM_RENDERER"]

settings.X_FRAME_OPTIONS = DAISY_SETTINGS["X_FRAME_OPTIONS"]
