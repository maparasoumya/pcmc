from rest_framework import viewsets
from accounts.permissions import IsAdminOrReadOnly
from .models import VendorCategory, Vendor
from .serializers import VendorCategorySerializer, VendorSerializer


class VendorCategoryViewSet(viewsets.ModelViewSet):
    queryset = VendorCategory.objects.all()
    serializer_class = VendorCategorySerializer
    permission_classes = [IsAdminOrReadOnly]


class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        qs = Vendor.objects.all()
        return qs if self.request.user.is_authenticated and self.request.user.is_staff else qs.filter(is_active=True)

    def perform_create(self, serializer):
        serializer.save(added_by=self.request.user)