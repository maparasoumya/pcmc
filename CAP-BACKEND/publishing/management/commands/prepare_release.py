from django.core.management import BaseCommand, call_command
from django.conf import settings
from django.core.management.base import CommandError

class Command(BaseCommand):
    help = 'Validate production settings, apply migrations and import original sectors without overwriting edits.'
    def add_arguments(self, parser):
        parser.add_argument('--skip-seed', action='store_true', help='Leave tables empty when importing existing SQLite data.')

    def handle(self, *args, **options):
        if settings.DEBUG or settings.DATABASES['default']['ENGINE'] != 'django.db.backends.postgresql' or settings.UPLOAD_STORAGE != 's3':
            raise CommandError('Load production PostgreSQL and object-storage configuration before preparing a release.')
        call_command('check', deploy=True, fail_level='WARNING')
        call_command('migrate', interactive=False)
        if not options['skip_seed']:
            call_command('import_portal_content')
        self.stdout.write(self.style.SUCCESS('Release database prepared. Create the first staff account with createsuperuser if needed.'))
