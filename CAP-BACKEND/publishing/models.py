from django.db import models

KINDS = [(v, v) for v in ['sectors', 'events', 'initiatives', 'resources', 'projects', 'map', 'settings', 'progress']]
class Publication(models.Model):
    kind = models.CharField(max_length=30, choices=KINDS)
    title = models.CharField(max_length=250)
    slug = models.SlugField(max_length=150)
    status = models.CharField(max_length=20, choices=[('draft','Draft'),('published','Published')], default='draft')
    data = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ['-updated_at']
        constraints = [models.UniqueConstraint(fields=['kind','slug'], name='unique_publication_slug')]

class Submission(models.Model):
    kind = models.CharField(max_length=20, choices=[('suggestion','Suggestion'),('query','Query')])
    name = models.CharField(max_length=150)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField(max_length=10000)
    location = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=20, choices=[('new','New'),('review','Under review'),('responded','Responded'),('archived','Archived')], default='new')
    staff_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ['-created_at']

class Asset(models.Model):
    file = models.FileField(upload_to='uploads/%Y/%m/')
    created_at = models.DateTimeField(auto_now_add=True)
