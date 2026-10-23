import io
from unittest.mock import patch

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core import signing
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import Asset

CLOUD_SETTINGS = {
    'UPLOAD_STORAGE': 's3',
    'S3_BUCKET_NAME': 'test-bucket',
    'STORAGES': {
        'default': {'BACKEND': 'storages.backends.s3.S3Storage', 'OPTIONS': {
            'bucket_name': 'test-bucket', 'custom_domain': 'media.example.com',
            'querystring_auth': False,
        }},
        'staticfiles': {'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage'},
    },
}

class DirectUploadTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff = get_user_model().objects.create_user('uploader', is_staff=True)
        self.client.force_authenticate(self.staff)
        self.file = {'name': 'meeting.png', 'size': 9 * 1024 * 1024, 'content_type': 'image/png'}

    def test_local_mode_preserves_existing_uploads(self):
        result = self.client.post('/api/uploads/intent/', self.file, format='json')
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.data['mode'], 'local')

    def test_upload_authorization_and_size(self):
        self.client.force_authenticate(None)
        self.assertEqual(self.client.post('/api/uploads/intent/', self.file, format='json').status_code, 401)
        self.client.force_authenticate(self.staff)
        self.assertEqual(self.client.post('/api/uploads/intent/', {**self.file, 'size': 11*1024*1024}, format='json').status_code, 400)
        self.assertEqual(self.client.post('/api/uploads/intent/', {**self.file, 'name':'unsafe.html'}, format='json').status_code, 400)
        self.assertEqual(self.client.post('/api/uploads/intent/', {**self.file, 'content_type':'text/html'}, format='json').status_code, 400)

    @override_settings(**CLOUD_SETTINGS)
    @patch('publishing.uploads.storage_client')
    def test_large_direct_upload_verifies_and_saves_public_url(self, factory):
        store = factory.return_value
        store.generate_presigned_url.return_value = 'https://bucket.example.com/signed-put'
        result = self.client.post('/api/uploads/intent/', self.file, format='json')
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.data['mode'], 'direct')
        params = store.generate_presigned_url.call_args.kwargs['Params']
        self.assertEqual(params['ContentLength'], self.file['size'])
        self.assertEqual(params['ContentType'], 'image/png')
        store.head_object.return_value = {'ContentLength': self.file['size'], 'ContentType':'image/png'}
        store.get_object.return_value = {'Body':io.BytesIO(b'\x89PNG\r\n\x1a\nrest')}
        result = self.client.post('/api/uploads/complete/', {'intent':result.data['intent']}, format='json')
        self.assertEqual(result.status_code, 201)
        self.assertTrue(result.data['file'].startswith('https://media.example.com/uploads/'))
        self.assertEqual(Asset.objects.count(), 1)
        store.put_object.assert_not_called()
        self.assertEqual(store.get_object.call_args.kwargs['Range'], 'bytes=0-11')

    @override_settings(**CLOUD_SETTINGS)
    @patch('publishing.uploads.storage_client')
    def test_tampered_and_wrong_account_intents_are_rejected(self, factory):
        self.assertEqual(self.client.post('/api/uploads/complete/', {'intent':'invalid'}, format='json').status_code, 400)
        intent = signing.dumps({'user':self.staff.pk+1,'key':'uploads/other.png','size':10,'mime':'image/png'},salt='pcmc-upload')
        self.assertEqual(self.client.post('/api/uploads/complete/', {'intent':intent}, format='json').status_code,400)
        factory.assert_not_called()

    @override_settings(**CLOUD_SETTINGS)
    @patch('publishing.uploads.storage_client')
    def test_mismatched_object_and_invalid_file_header_are_rejected(self, factory):
        intent = signing.dumps({'user':self.staff.pk,'key':'uploads/test.png','size':100,'mime':'image/png'},salt='pcmc-upload')
        store = factory.return_value
        store.head_object.return_value = {'ContentLength':99,'ContentType':'image/png'}
        self.assertEqual(self.client.post('/api/uploads/complete/', {'intent':intent}, format='json').status_code,400)
        store.head_object.return_value['ContentLength'] = 100
        store.get_object.return_value = {'Body':io.BytesIO(b'not an image')}
        self.assertEqual(self.client.post('/api/uploads/complete/', {'intent':intent}, format='json').status_code,400)
        self.assertEqual(Asset.objects.count(),0)
