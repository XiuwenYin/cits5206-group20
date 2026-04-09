"""
bolts/urls.py
URL routing for bolt products API endpoints.
Provides routes for querying and filtering bolt inventory.
"""

from django.urls import path
from . import views

urlpatterns = [
    # GET /api/bolts/products/ - list and filter bolt products
    # Query params: supplier, length, category, methodology
    path('products/', views.bolt_list_filter, name='bolt_list_filter'),
]
