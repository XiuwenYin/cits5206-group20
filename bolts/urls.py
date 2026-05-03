"""
bolts/urls.py
URL routing for bolt products API endpoints.
Provides routes for querying and filtering bolt inventory.
"""

from django.urls import path
from . import views
from .views import test_list

urlpatterns = [
    # GET /api/bolts/products/ - list and filter bolt products
    # Query params: supplier, length, category, methodology
    path('products/', views.bolt_list_filter, name='bolt_list_filter'),
    
    # GET /api/tests/<test_id>/curve-data/ - get raw displacement/load curve data
    path('tests/<int:test_id>/curve-data/', views.test_curve_data, name='test_curve_data'),
    
    # GET /api/tests/<test_id>/statistics/ - compute statistics for a test's curve data
    path('tests/<int:test_id>/statistics/', views.test_statistics, name='test_statistics'),

    path("tests/", test_list),
]
