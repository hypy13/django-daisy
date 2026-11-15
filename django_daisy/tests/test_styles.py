import io
import json
from pathlib import Path
from tempfile import TemporaryDirectory

from django.apps import apps
from django.core.management import call_command
from django.template.loader import render_to_string
from django.test import SimpleTestCase


class StylesheetTests(SimpleTestCase):
    def render_base(self, **context):
        return render_to_string("admin/base.html", context)

    def test_default_uses_bundled_css(self):
        html = self.render_base()
        self.assertIn("admin/css/app.css", html)
        self.assertNotIn("@tailwindcss/browser", html)

    def test_custom_static_css_replaces_bundled_and_full_styles(self):
        html = self.render_base(
            DAISY_CSS="custom/admin.css", LOAD_FULL_STYLES=True,
            EXTRA_STYLES=["/extra.css"],
        )
        self.assertIn("/static/custom/admin.css", html)
        self.assertNotIn("admin/css/app.css", html)
        self.assertNotIn("@tailwindcss/browser", html)
        self.assertLess(html.index("custom/admin.css"), html.index("customized_components.css"))
        self.assertLess(html.index("customized_components.css"), html.index("/extra.css"))

    def test_legacy_full_styles_still_works(self):
        html = self.render_base(LOAD_FULL_STYLES=True)
        self.assertIn("@tailwindcss/browser", html)
        self.assertNotIn("admin/css/app.css", html)

    def test_source_generation_includes_installed_package_and_extra_path(self):
        with TemporaryDirectory() as directory:
            output = Path(directory) / "sources.css"
            extra = Path(directory) / 'custom templates'
            call_command("daisy_css_sources", output=str(output), source=[str(extra)], stdout=io.StringIO())
            generated = output.read_text()
            self.assertIn(json.dumps(str(Path(apps.get_app_config("django_daisy").path).resolve())), generated)
            self.assertIn(json.dumps(str(extra.resolve())), generated)
