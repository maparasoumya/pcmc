from rest_framework import serializers
from .models import ThematicArea, KeyStat, Challenge, PCMCAction, CitizenAction, VulnerableGroup

class ThematicAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ThematicArea
        fields = '__all__'

class KeyStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = KeyStat
        fields = '__all__'

class ChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenge
        fields = '__all__'

class PCMCActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PCMCAction
        fields = '__all__'

class CitizenActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CitizenAction
        fields = '__all__'

class VulnerableGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = VulnerableGroup
        fields = '__all__'
