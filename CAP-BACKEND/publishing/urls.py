from django.urls import path
from .uploads import UploadIntentView, UploadCompleteView
from rest_framework.routers import DefaultRouter
from .views import PublicationViewSet, SubmissionViewSet, AssetViewSet
router = DefaultRouter()
router.register('publications', PublicationViewSet, basename='publication')
router.register('submissions', SubmissionViewSet)
router.register('assets', AssetViewSet)
urlpatterns = [path('uploads/intent/', UploadIntentView.as_view()), path('uploads/complete/', UploadCompleteView.as_view())] + router.urls
