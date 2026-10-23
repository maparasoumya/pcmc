"""Staff-authorised, direct-to-object-storage uploads; file bytes bypass Vercel."""
from pathlib import Path
from uuid import uuid4

import boto3
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError
from django.conf import settings
from django.core import signing
from rest_framework import serializers
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Asset

MIME_TYPES = {'.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.webp':'image/webp', '.pdf':'application/pdf'}

def matches_header(extension, head):
    if extension in {'.jpg', '.jpeg'}:
        return head.startswith(b'\xff\xd8\xff')
    if extension == '.png':
        return head.startswith(b'\x89PNG\r\n\x1a\n')
    if extension == '.webp':
        return head[:4] == b'RIFF' and head[8:12] == b'WEBP'
    return extension == '.pdf' and head.startswith(b'%PDF-')

def validate_upload(name, size, content_type=None):
    extension = Path(name).suffix.lower()
    if extension not in MIME_TYPES:
        raise serializers.ValidationError('Upload JPG, PNG, WebP or PDF files only.')
    if not 0 < size <= settings.UPLOAD_MAX_BYTES:
        raise serializers.ValidationError('Upload a non-empty file no larger than 10 MB.')
    if content_type and content_type != MIME_TYPES[extension]:
        raise serializers.ValidationError('File extension and content type do not match.')
    return extension, MIME_TYPES[extension]

def storage_client():
    return boto3.client('s3', endpoint_url=settings.S3_ENDPOINT_URL,
        aws_access_key_id=settings.S3_ACCESS_KEY_ID,
        aws_secret_access_key=settings.S3_SECRET_ACCESS_KEY,
        region_name=settings.S3_REGION,
        config=Config(signature_version='s3v4', connect_timeout=5, read_timeout=10,
            retries={'max_attempts': 1}, request_checksum_calculation='when_required', response_checksum_validation='when_required'))

class UploadIntentSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    size = serializers.IntegerField(min_value=1)
    content_type = serializers.CharField(required=False, allow_blank=True)

class UploadIntentView(APIView):
    permission_classes = [IsAdminUser]
    def post(self, request):
        serializer = UploadIntentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        fields = serializer.validated_data
        extension, mime = validate_upload(fields['name'], fields['size'], fields.get('content_type'))
        if settings.UPLOAD_STORAGE == 'local':
            return Response({'mode':'local', 'max_bytes':settings.UPLOAD_MAX_BYTES})
        key = f'uploads/{request.user.pk}/{uuid4().hex}{extension}'
        payload = {'user':request.user.pk, 'key':key, 'size':fields['size'], 'mime':mime}
        try:
            url = storage_client().generate_presigned_url('put_object', Params={
                'Bucket':settings.S3_BUCKET_NAME, 'Key':key, 'ContentType':mime,
                'ContentLength':fields['size'],
            }, ExpiresIn=settings.UPLOAD_INTENT_SECONDS, HttpMethod='PUT')
        except (BotoCoreError, ClientError):
            return Response({'detail':'File storage is unavailable. Please try again.'}, status=503)
        return Response({'mode':'direct', 'url':url, 'method':'PUT',
            'headers':{'Content-Type':mime},
            'intent':signing.dumps(payload, salt='pcmc-upload'),
            'expires_in':settings.UPLOAD_INTENT_SECONDS, 'max_bytes':settings.UPLOAD_MAX_BYTES})

class UploadCompleteSerializer(serializers.Serializer):
    intent = serializers.CharField(max_length=4096)

class UploadCompleteView(APIView):
    permission_classes = [IsAdminUser]
    def post(self, request):
        serializer = UploadCompleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            payload = signing.loads(serializer.validated_data['intent'], salt='pcmc-upload', max_age=settings.UPLOAD_INTENT_SECONDS)
        except signing.BadSignature:
            raise serializers.ValidationError('This upload has expired or is invalid. Upload the file again.')
        if settings.UPLOAD_STORAGE != 's3' or payload.get('user') != request.user.pk:
            raise serializers.ValidationError('This upload does not belong to your staff account.')
        client = storage_client()
        key = payload['key']
        try:
            meta = client.head_object(Bucket=settings.S3_BUCKET_NAME, Key=key)
            if meta['ContentLength'] != payload['size'] or meta.get('ContentType') != payload['mime']:
                raise serializers.ValidationError('Uploaded file size or type does not match. Upload it again.')
            obj = client.get_object(Bucket=settings.S3_BUCKET_NAME, Key=key, Range='bytes=0-11')
            stream = obj['Body']
            try:
                head = stream.read(12)
            finally:
                stream.close()
            if not matches_header(Path(key).suffix.lower(), head):
                raise serializers.ValidationError('The file contents do not match its extension.')
        except (BotoCoreError, ClientError):
            return Response({'detail':'Unable to verify this upload. Check storage settings and try again.'}, status=503)
        asset, _ = Asset.objects.get_or_create(file=key)
        return Response({'id':asset.pk, 'file':asset.file.url}, status=201)
