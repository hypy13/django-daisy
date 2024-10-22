from django.conf import settings
from django.utils.translation import gettext_lazy as _

settings.DAISY_LOAD_FULL_STYLES = getattr(settings, 'DAISY_LOAD_FULL_STYLES', True)

# overriding template
settings.FORM_RENDERER = 'django.forms.renderers.TemplatesSetting'

import pathlib

app_path = pathlib.Path(__file__).parent.absolute()

settings.TEMPLATES[0]['DIRS'] += [
    app_path / 'templates',
]

settings.TEMPLATES[0]['OPTIONS']['libraries'] = {
    'dash_tags': 'django_daisy.templatetags.dash_tags'
}

# add dashboard static files dir
settings.STATICFILES_DIRS += [
    app_path / "static",
]

settings.LOCALE_PATHS += [
    app_path / "locale"
]

settings.X_FRAME_OPTIONS = 'SAMEORIGIN'

if not hasattr(settings, 'APPS_REORDER'):
    settings.APPS_REORDER = {
        'auth': {
            'icon': 'fa-solid fa-person-military-pointing',
            'name': _('Authentication'),
            'hide': False,
            'app': 'users',
        },
    }
