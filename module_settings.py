from django.conf import settings

# overriding template
settings.FORM_RENDERER = 'django.forms.renderers.TemplatesSetting'

import pathlib

app_path = pathlib.Path(__file__).parent.absolute()

settings.TEMPLATES[0]['DIRS'] += [
    app_path / 'templates',
]

settings.TEMPLATES[0]['OPTIONS']['libraries'] = {
    'dash_tags': 'daisyui_dashboard.templatetags.dash_tags'
}

# add dashboard static files dir
settings.STATICFILES_DIRS += [
    app_path / "static",
]

settings.X_FRAME_OPTIONS = 'SAMEORIGIN'
