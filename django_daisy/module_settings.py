import pathlib

from django.conf import settings
from django.utils.translation import gettext_lazy as _

# Define defaults for DAISY_SETTINGS
DEFAULT_DAISY_SETTINGS = {
    "LOAD_FULL_STYLES": True,
    "SHOW_CHANGELIST_FILTER": False,
    "FORM_RENDERER": "django.forms.renderers.TemplatesSetting",
    "X_FRAME_OPTIONS": "SAMEORIGIN",
    "APPS_REORDER": {
        "auth": {
            "icon": "fa-solid fa-person-military-pointing",
            "name": _("Authentication"),
            "hide": False,
            "app": "users",
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
