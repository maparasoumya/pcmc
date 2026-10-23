from rest_framework.routers import DefaultRouter
from .views import VendorCategoryViewSet, VendorViewSet

router = DefaultRouter()
router.register('vendor-categories', VendorCategoryViewSet)
router.register('vendors', VendorViewSet)

urlpatterns = router.urls