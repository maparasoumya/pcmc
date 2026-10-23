from rest_framework import viewsets
from accounts.permissions import IsAdminOrReadOnly
from .models import ThematicArea, KeyStat, Challenge, PCMCAction, CitizenAction, VulnerableGroup
from .serializers import (
    ThematicAreaSerializer, KeyStatSerializer, ChallengeSerializer,
    PCMCActionSerializer, CitizenActionSerializer, VulnerableGroupSerializer
)


class ThematicAreaViewSet(viewsets.ModelViewSet):
    queryset = ThematicArea.objects.all()
    serializer_class = ThematicAreaSerializer
    permission_classes = [IsAdminOrReadOnly]


class KeyStatViewSet(viewsets.ModelViewSet):
    queryset = KeyStat.objects.all()
    serializer_class = KeyStatSerializer
    permission_classes = [IsAdminOrReadOnly]


class ChallengeViewSet(viewsets.ModelViewSet):
    queryset = Challenge.objects.all()
    serializer_class = ChallengeSerializer
    permission_classes = [IsAdminOrReadOnly]


class PCMCActionViewSet(viewsets.ModelViewSet):
    queryset = PCMCAction.objects.all()
    serializer_class = PCMCActionSerializer
    permission_classes = [IsAdminOrReadOnly]


class CitizenActionViewSet(viewsets.ModelViewSet):
    queryset = CitizenAction.objects.all()
    serializer_class = CitizenActionSerializer
    permission_classes = [IsAdminOrReadOnly]


class VulnerableGroupViewSet(viewsets.ModelViewSet):
    queryset = VulnerableGroup.objects.all()
    serializer_class = VulnerableGroupSerializer
    permission_classes = [IsAdminOrReadOnly]