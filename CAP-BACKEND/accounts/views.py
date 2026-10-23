from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

def user_payload(user):
    return {
        'id': user.id,
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email': user.email,
        'role': user.role,
        'department': user.department,
        'is_staff': user.is_staff,
    }

class LoginView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        data = request.data.copy()
        identifier = data.get('username', '')
        if '@' in identifier:
            from .models import User
            matches = User.objects.filter(email__iexact=identifier)
            if matches.count() == 1:
                data['username'] = matches.first().username
        serializer = self.serializer_class(data=data,context={'request':request})
        serializer.is_valid(raise_exception=True)
        user=serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': user_payload(user)})

class MeView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self, request):
        return Response(user_payload(request.user))

class LogoutView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self, request):
        result = Token.objects.filter(user = request.user)
        result.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)