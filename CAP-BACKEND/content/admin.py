from django.contrib import admin
from .models import ThematicArea, KeyStat, Challenge, PCMCAction, CitizenAction, VulnerableGroup

admin.site.register(ThematicArea)
admin.site.register(KeyStat)
admin.site.register(Challenge)
admin.site.register(PCMCAction)
admin.site.register(CitizenAction)
admin.site.register(VulnerableGroup)