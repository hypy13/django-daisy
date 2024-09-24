from django.conf import settings
from django.utils.translation import gettext_lazy as _

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

settings.X_FRAME_OPTIONS = 'SAMEORIGIN'

settings.APPS_REORDER = {
    'auth': {
        'icon': 'icon-shield-check',
        'name': _('Authentication'),
        'hide': False,
        'app': 'users',
    },
}
