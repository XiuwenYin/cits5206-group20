"""
backend/urls.py
Main URL configuration for the Ground Support Testing Data System.
Routes API requests to the appropriate app-level URL configurations.
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Django built-in admin interface
    path('admin/', admin.site.urls),

    # Authentication endpoints: /api/auth/token/, /api/auth/check/ etc.
    path('api/auth/', include('accounts.urls')),

    # Bolt products API endpoints: /api/bolts/products/
    path('api/bolts/', include('bolts.urls')),
]