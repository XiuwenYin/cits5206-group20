"""
accounts/urls.py
URL routing for authentication endpoints.
Provides JWT token obtain/refresh and admin verification routes.
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    # POST /api/auth/token/ - login with username + password, returns access + refresh tokens
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),

    # POST /api/auth/token/refresh/ - exchange refresh token for a new access token
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # GET /api/auth/check/ - verify current user is authenticated
    path('check/', views.admin_check, name='admin_check'),
]