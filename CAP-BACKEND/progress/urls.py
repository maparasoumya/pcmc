from rest_framework.routers import DefaultRouter
from .views import IndicatorViewSet, ProgressEntryViewSet, ClimateActionCellMeetingViewSet

router = DefaultRouter()
router.register('indicators', IndicatorViewSet)
router.register('progress-entries', ProgressEntryViewSet)
router.register('cell-meetings', ClimateActionCellMeetingViewSet)

urlpatterns = router.urls