import os
import secrets
import subprocess
import sys
from pathlib import Path

from django.test import SimpleTestCase

class ProductionConfigurationTests(SimpleTestCase):
    def setUp(self):
        self.root=Path(__file__).resolve().parents[1]
        self.env={**os.environ,'DJANGO_DEBUG':'false','DJANGO_SECRET_KEY':secrets.token_urlsafe(64),
            'DJANGO_ALLOWED_HOSTS':'api.example.com','DATABASE_URL':'postgresql://test:test@localhost:5432/test?sslmode=require',
            'UPLOAD_STORAGE':'s3','S3_BUCKET_NAME':'example','S3_ACCESS_KEY_ID':'example','S3_SECRET_ACCESS_KEY':'example',
            'S3_PUBLIC_BASE_URL':'https://media.example.com'}
    def run_check(self, env):
        return subprocess.run([sys.executable,'manage.py','check','--deploy','--fail-level','WARNING'],cwd=self.root,env=env,capture_output=True,text=True)
    def test_production_settings_pass_without_network_connections(self):
        result=self.run_check(self.env)
        self.assertEqual(result.returncode,0,result.stderr)
    def test_production_rejects_missing_database_secret_and_storage(self):
        for field in ['DATABASE_URL','DJANGO_SECRET_KEY','S3_PUBLIC_BASE_URL']:
            with self.subTest(field=field):
                env={**self.env,field:''}
                result=self.run_check(env)
                self.assertNotEqual(result.returncode,0)
                self.assertIn('ImproperlyConfigured',result.stderr)
