import tempfile
from pathlib import Path
from unittest.mock import patch

from django import forms
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import Client, SimpleTestCase, TestCase, override_settings
from django.urls import reverse

from django_daisy.fields.toastui_editor import ToastUIEditorField, ToastUIEditorWidget
from django_daisy.fields.toastui_editor_upload import _directory


class ToastUIEditorWidgetTests(SimpleTestCase):
    def test_field_and_widget(self):
        field = ToastUIEditorField(blank=True)
        self.assertIsInstance(field.formfield().widget, ToastUIEditorWidget)
        self.assertIsInstance(field.formfield(widget=forms.Textarea).widget, forms.Textarea)
        self.assertIn('toastui-editor-field', ToastUIEditorWidget(upload_url='').render('body', 'hello'))
        self.assertEqual(field.deconstruct()[1], 'django_daisy.fields.toastui_editor.ToastUIEditorField')
        self.assertIn('toastui-editor.min.js', str(ToastUIEditorWidget().media))

    def test_choices_keep_django_widget(self):
        field = ToastUIEditorField(choices=[('a', 'A')])
        self.assertIsInstance(field.formfield().widget, forms.Select)


class ToastUIEditorAttachmentTests(TestCase):
    def setUp(self):
        self.media = tempfile.TemporaryDirectory()
        self.addCleanup(self.media.cleanup)
        self.settings = override_settings(MEDIA_ROOT=self.media.name, MEDIA_URL='/media/')
        self.settings.enable()
        self.addCleanup(self.settings.disable)
        self.owner = get_user_model().objects.create_user(username='owner', password='x', is_staff=True)
        self.other = get_user_model().objects.create_user(username='other', password='x', is_staff=True)
        self.client.force_login(self.owner)
        self.upload_url = reverse('admin:toastui-editor-upload')
        self.list_url = reverse('admin:toastui-editor-attachments')
        self.delete_url = reverse('admin:toastui-editor-delete')

    def send_file(self, name='notes.txt', content=b'hello'):
        return self.client.post(self.upload_url, {'file': SimpleUploadedFile(name, content)})

    def test_upload_list_delete_and_owner_isolation(self):
        self.assertEqual(self.client.get(self.list_url).json()['items'], [])
        response = self.send_file()
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['name'], 'notes.txt')
        path = Path(self.media.name, _directory(self.owner), data['id'])
        self.assertEqual(data['url'], '/media/' + _directory(self.owner) + '/' + data['id'])
        self.assertEqual(path.read_bytes(), b'hello')
        self.assertEqual(self.client.get(self.list_url).json()['items'], [data])
        self.client.force_login(self.other)
        self.assertEqual(self.client.get(self.list_url).json()['items'], [])
        self.assertEqual(self.client.post(self.delete_url, {'id': data['id']}).status_code, 404)
        self.assertTrue(path.exists())
        self.client.force_login(self.owner)
        self.assertEqual(self.client.post(self.delete_url, {'id': data['id']}).status_code, 200)
        self.assertFalse(path.exists())
        self.assertEqual(self.client.post(self.delete_url, {'id': data['id']}).status_code, 404)

    def test_allowed_and_rejected_files(self):
        for name, content in [('pasted', b'\x89PNG\r\n\x1a\ncontent'), ('doc.pdf', b'%PDF-1.4'),
                              ('archive.zip', b'PK\x03\x04stuff')]:
            self.assertEqual(self.send_file(name, content).status_code, 200)
        for name, content in [('x.svg', b'<svg></svg>'), ('x.pdf', b'<script>'),
                              ('x.txt', b'\x00bad'), ('x.html', b'<p>hi</p>')]:
            self.assertEqual(self.send_file(name, content).status_code, 400)
        with override_settings(DAISY_TOASTUI_EDITOR_MAX_UPLOAD_SIZE=2):
            self.assertEqual(self.send_file(content=b'abc').status_code, 400)

    def test_admin_authentication_and_csrf(self):
        client = Client(enforce_csrf_checks=True)
        self.assertEqual(client.get(self.list_url).status_code, 302)
        client.force_login(self.owner)
        self.assertEqual(client.post(self.upload_url).status_code, 403)
        self.assertEqual(client.post(self.delete_url).status_code, 403)
        token = 'a' * 32
        client.cookies['csrftoken'] = token
        response = client.post(self.upload_url, {'file': SimpleUploadedFile('a.txt', b'hello')}, HTTP_X_CSRFTOKEN=token)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(client.get(self.upload_url).status_code, 405)
        client.force_login(get_user_model().objects.create_user(username='nonstaff', password='x'))
        self.assertEqual(client.get(self.list_url).status_code, 302)

    def test_invalid_attachment_ids_and_pages(self):
        for value in ['../x.txt', 'x' * 300, '/etc/passwd', 'a' * 32 + '_../x.txt']:
            self.assertEqual(self.client.post(self.delete_url, {'id': value}).status_code, 404)
        self.assertEqual(self.client.get(self.list_url, {'page': '9' * 100}).status_code, 400)

    def test_storage_without_listing_still_uploads_and_deletes(self):
        data = self.send_file().json()
        with patch('django_daisy.fields.toastui_editor_upload.default_storage.listdir', side_effect=NotImplementedError):
            response = self.client.get(self.list_url)
            self.assertEqual(response.status_code, 501)
            self.assertIn('does not support listing', response.json()['error'])
        self.assertEqual(self.client.post(self.delete_url, {'id': data['id']}).status_code, 200)

    def test_list_excludes_unmanaged_files(self):
        data = self.send_file().json()
        folder = Path(self.media.name, _directory(self.owner))
        (folder / 'unmanaged.txt').write_text('other content')
        self.assertEqual(self.client.get(self.list_url).json()['items'], [data])
        self.assertEqual(self.client.post(self.delete_url, {'id': 'unmanaged.txt'}).status_code, 404)
