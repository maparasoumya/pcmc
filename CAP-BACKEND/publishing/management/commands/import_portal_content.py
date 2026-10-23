import json
from pathlib import Path
from django.conf import settings
from django.core.management.base import BaseCommand
from publishing.models import Publication
class Command(BaseCommand):
    help = 'Import the supplied portal sector content without overwriting existing edits.'
    def handle(self, *args, **kwargs):
        path = settings.BASE_DIR / 'publishing' / 'seed_sectors.json'
        count=0
        for row in json.loads(path.read_text()):
            _,created=Publication.objects.get_or_create(kind='sectors',slug=row.pop('id'),defaults={'title':row.pop('title'),'status':'published','data':row})
            count+=created
        self.stdout.write(self.style.SUCCESS(f'Imported {count} sectors. Existing edits were preserved.'))
