from django.contrib import admin
from .models import Indicator, ProgressEntry, ClimateActionCellMeeting

admin.site.register(Indicator)
admin.site.register(ProgressEntry)
admin.site.register(ClimateActionCellMeeting)