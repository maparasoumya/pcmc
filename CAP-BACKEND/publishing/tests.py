from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile
from .models import Publication, Submission

class PlatformWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff = get_user_model().objects.create_user('staff',password='test-staff-pass',is_staff=True)
        self.reader = get_user_model().objects.create_user('reader',password='test-reader-pass')
    def staff_login(self):
        self.client.force_authenticate(self.staff)
    def test_drafts_are_private_and_publication_persists(self):
        self.staff_login()
        result=self.client.post('/api/publications/',{'kind':'initiatives','title':'Community meeting','slug':'meeting','data':{'description':'Meeting notes'},'status':'draft'},format='json')
        self.assertEqual(result.status_code,201)
        key=result.data['id']
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get('/api/publications/?kind=initiatives').data,[])
        self.assertEqual(self.client.get(f'/api/publications/{key}/').status_code,404)
        self.staff_login()
        self.assertEqual(self.client.patch(f'/api/publications/{key}/',{'status':'published'},format='json').status_code,200)
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get('/api/publications/?kind=initiatives').data[0]['title'],'Community meeting')
    def test_anonymous_cannot_write_and_nonstaff_cannot_publish(self):
        body={'kind':'resources','title':'Guide','slug':'guide','data':{}}
        self.assertEqual(self.client.post('/api/publications/',body,format='json').status_code,401)
        self.client.force_authenticate(self.reader)
        self.assertEqual(self.client.post('/api/publications/',body,format='json').status_code,403)
    def test_submission_is_stored_and_inbox_is_private(self):
        body={'kind':'query','name':'Citizen','email':'citizen@example.com','subject':'Question','message':'How can I volunteer?','status':'responded','staff_notes':'Untrusted'}
        response=self.client.post('/api/submissions/',body,format='json')
        self.assertEqual(response.status_code,201)
        entry=Submission.objects.get()
        self.assertEqual(entry.status,'new')
        self.assertEqual(entry.staff_notes,'')
        self.assertEqual(self.client.get('/api/submissions/').status_code,401)
        self.assertEqual(self.client.get(f'/api/submissions/{entry.id}/').status_code,401)
        self.staff_login()
        self.assertEqual(len(self.client.get('/api/submissions/').data),1)
        self.assertEqual(self.client.patch(f'/api/submissions/{entry.id}/',{'status':'review','staff_notes':'Assigned to team'},format='json').status_code,200)
    def test_invalid_event_map_and_duplicate_settings_rejected(self):
        self.staff_login()
        base={'title':'Test','slug':'test','status':'published'}
        self.assertEqual(self.client.post('/api/publications/',{**base,'kind':'events','data':{'date':'bad'}},format='json').status_code,400)
        self.assertEqual(self.client.post('/api/publications/',{**base,'kind':'map','data':{'latitude':200,'longitude':73}},format='json').status_code,400)
        settings={**base,'kind':'settings','slug':'site','data':{}}
        self.assertEqual(self.client.post('/api/publications/',settings,format='json').status_code,201)
        self.assertEqual(self.client.post('/api/publications/',settings,format='json').status_code,400)
    def test_progress_records_staff_author(self):
        self.staff_login()
        result=self.client.post('/api/indicators/',{'name':'Trees planted','unit':'trees','target_value':'100'},format='json')
        self.assertEqual(result.status_code,201)
        result=self.client.post('/api/progress-entries/',{'indicator':result.data['id'],'actual_value':'25','reported_date':'2026-10-21'},format='json')
        self.assertEqual(result.status_code,201)
        self.assertEqual(result.data['recorded_by'],self.staff.id)
    def test_invalid_upload_rejected(self):
        self.staff_login()
        response=self.client.post('/api/assets/',{'file':SimpleUploadedFile('bad.png',b'not an image',content_type='image/png')},format='multipart')
        self.assertEqual(response.status_code,400)
    def test_token_login_and_logout(self):
        response=self.client.post('/api/auth/token/',{'username':'staff','password':'test-staff-pass'})
        self.assertEqual(response.status_code,200)
        self.client.credentials(HTTP_AUTHORIZATION='Token '+response.data['token'])
        self.assertEqual(self.client.get('/api/auth/me/').status_code,200)
        self.assertEqual(self.client.post('/api/auth/logout/').status_code,204)
        self.assertEqual(self.client.get('/api/auth/me/').status_code,401)
