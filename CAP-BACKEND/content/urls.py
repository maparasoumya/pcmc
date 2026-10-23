# content/urls.py
from rest_framework.routers import DefaultRouter
from .views import (
    ThematicAreaViewSet, KeyStatViewSet, ChallengeViewSet,
    PCMCActionViewSet, CitizenActionViewSet, VulnerableGroupViewSet
)

router = DefaultRouter()
router.register('thematic-areas', ThematicAreaViewSet)
router.register('key-stats', KeyStatViewSet)
router.register('challenges', ChallengeViewSet)
router.register('pcmc-actions', PCMCActionViewSet)
router.register('citizen-actions', CitizenActionViewSet)
router.register('vulnerable-groups', VulnerableGroupViewSet)

urlpatterns = router.urls