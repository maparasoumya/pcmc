from rest_framework import serializers
from .models import Indicator, ProgressEntry, ClimateActionCellMeeting


class IndicatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Indicator
        fields = '__all__'


class ProgressEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgressEntry
        fields = '__all__'
        read_only_fields=['recorded_by']
        


class ClimateActionCellMeetingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClimateActionCellMeeting
        fields = '__all__'