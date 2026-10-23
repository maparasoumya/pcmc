import json
from pathlib import Path
from django.utils.dateparse import parse_datetime
from django.utils.timezone import is_aware
from rest_framework import serializers, viewsets
from rest_framework.permissions import BasePermission
from rest_framework.throttling import ScopedRateThrottle
from accounts.permissions import IsAdminOrReadOnly
from .models import Publication, Submission, Asset
from django.conf import settings
from .uploads import validate_upload, matches_header

class PublicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publication
        fields = '__all__'
    def validate(self, attrs):
        data = attrs.get('data', getattr(self.instance, 'data', {}))
        kind = attrs.get('kind', getattr(self.instance, 'kind', None))
        if not isinstance(data, dict) or len(json.dumps(data)) > 200000:
            raise serializers.ValidationError('Content must be an object smaller than 200 KB.')
        if any(not isinstance(value, (str, int, float, bool)) and value is not None for value in data.values()):
            raise serializers.ValidationError('Content fields must be text, numbers or booleans.')
        if kind == 'settings' and attrs.get('slug', getattr(self.instance,'slug',None)) != 'site':
            raise serializers.ValidationError('Site settings must use the slug site.')
        if attrs.get('status', getattr(self.instance,'status','draft')) == 'published':
            if kind == 'events':
                start = parse_datetime(data.get('date', ''))
                end = parse_datetime(data.get('end_date', '')) if data.get('end_date') else None
                if start is None or not is_aware(start) or (data.get('end_date') and end is None) or (end and (not is_aware(end) or end < start)):
                    raise serializers.ValidationError('Provide a valid event start and an end after the start.')
            if kind == 'map':
                try:
                    if data.get('geometry','point') == 'line':
                        coords = json.loads(data.get('coordinates','[]'))
                        if len(coords)<2: raise ValueError()
                        for lat, lng in coords:
                            if not -90<=float(lat)<=90 or not -180<=float(lng)<=180: raise ValueError()
                    elif not -90<=float(data['latitude'])<=90 or not -180<=float(data['longitude'])<=180: raise ValueError()
                except (ValueError, TypeError, KeyError):
                    raise serializers.ValidationError('Provide valid latitude/longitude or at least two line coordinates.')
        return attrs

class PublicationViewSet(viewsets.ModelViewSet):
    serializer_class = PublicationSerializer
    permission_classes = [IsAdminOrReadOnly]
    def get_queryset(self):
        qs = Publication.objects.all()
        if not self.request.user.is_authenticated or not self.request.user.is_staff:
            qs = qs.filter(status='published')
        kind = self.request.query_params.get('kind')
        return qs.filter(kind=kind) if kind else qs

class SubmissionPermission(BasePermission):
    def has_permission(self, request, view):
        return request.method == 'POST' or bool(request.user.is_authenticated and request.user.is_staff)

class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = '__all__'
        read_only_fields = ['created_at']
    def validate(self, attrs):
        if not self.context['request'].user.is_staff:
            attrs['status'] = 'new'
            attrs['staff_notes'] = ''
        return attrs

class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [SubmissionPermission]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'submissions'
    def get_throttles(self):
        return [] if self.request.user.is_authenticated and self.request.user.is_staff else super().get_throttles()

class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ['id','file']
    def validate_file(self, file):
        if settings.UPLOAD_STORAGE != 'local':
            raise serializers.ValidationError('Use the direct upload workflow in production.')
        extension, _ = validate_upload(file.name, file.size)
        head = file.read(12)
        file.seek(0)
        if not matches_header(extension, head):
            raise serializers.ValidationError('The file contents do not match a supported format.')
        return file

class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    permission_classes = [IsAdminOrReadOnly]
    http_method_names = ['post','head','options']
