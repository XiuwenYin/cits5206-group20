"""
bolts/views.py
API views for bolt products and test data.
Provides endpoints for querying and filtering bolt inventory.
"""

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .models import Bolt
from .serializers import BoltSerializer


@api_view(['GET'])
def bolt_list_filter(request):
    """
    GET /api/bolts/products/
    
    Returns a filtered list of bolt products.
    Supports query parameter filtering by:
    - supplier: Filter by bolt supplier name (case-insensitive substring match)
    - length: Filter by bolt length in meters (exact match)
    - category: Filter by category ID or name
    - methodology: Filter by test methodology (static or dynamic)
    
    Examples:
    - /api/bolts/products/?supplier=acme
    - /api/bolts/products/?length=5.0
    - /api/bolts/products/?category=1
    - /api/bolts/products/?methodology=static
    - /api/bolts/products/?supplier=acme&length=5.0&category=1
    """
    
    queryset = Bolt.objects.all()
    
    # Filter by supplier (case-insensitive substring match)
    supplier = request.query_params.get('supplier', None)
    if supplier:
        queryset = queryset.filter(supplier__icontains=supplier)
    
    # Filter by length
    length = request.query_params.get('length', None)
    if length:
        try:
            length_value = float(length)
            queryset = queryset.filter(length_m=length_value)
        except ValueError:
            return Response(
                {'error': 'Invalid length parameter. Must be a valid number.'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Filter by category (by ID or name)
    category = request.query_params.get('category', None)
    if category:
        # Try to filter by category ID first, then by name
        queryset = queryset.filter(
            Q(category__id=category) | Q(category__categoryName__icontains=category)
        )
    
    # Filter by test methodology (static or dynamic)
    methodology = request.query_params.get('methodology', None)
    if methodology:
        # Validate methodology value
        valid_methodologies = ['static', 'dynamic']
        if methodology.lower() not in valid_methodologies:
            return Response(
                {'error': f'Invalid methodology. Must be one of: {", ".join(valid_methodologies)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        # Filter bolts that have tests with the specified methodology
        queryset = queryset.filter(tests__test_type=methodology.lower()).distinct()
    
    # Serialize and return results
    serializer = BoltSerializer(queryset, many=True)
    return Response({
        'count': queryset.count(),
        'results': serializer.data
    })
