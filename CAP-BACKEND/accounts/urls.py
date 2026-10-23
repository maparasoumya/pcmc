from django.urls import path
from .views import LoginView, LogoutView, MeView

urlpatterns = [
    path('auth/token/', LoginView.as_view(), name='api_token_auth'),
    path('auth/me/', MeView.as_view(), name='api_me'),
    path('auth/logout/', LogoutView.as_view(), name='api_logout'),
]