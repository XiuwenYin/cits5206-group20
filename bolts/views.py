"""
bolts/views.py
API views for bolt products and test data.
Provides endpoints for querying and filtering bolt inventory.
"""

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
import numpy as np
from .models import Bolt, Test, CurveData
from .serializers import BoltSerializer, StatisticsSerializer, CurveDataListSerializer


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
        q = Q(category__categoryName__icontains=category)
        try:
            q |= Q(category__id=int(category))
        except ValueError:
            pass
        queryset = queryset.filter(q)
    
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


def _compute_percentile(data, percentile):
    """
    Helper function to compute percentile values using numpy.
    
    Args:
        data: List or array of numerical values
        percentile: Percentile value (0-100)
    
    Returns:
        Float value of the computed percentile
    """
    return float(np.percentile(data, percentile))


@api_view(['GET'])
def test_statistics(request, test_id):
    """
    GET /api/tests/<test_id>/statistics/
    
    Returns summary statistics for a test's curve data.
    Computes mean, median, min, max, 25th percentile, and 75th percentile
    for both load (kN) and displacement (mm) values.
    
    Parameters:
    - test_id: The ID of the test
    
    Returns:
    {
        "test_id": <int>,
        "data_points_count": <int>,
        "load_statistics": {
            "mean": <float>,
            "median": <float>,
            "min": <float>,
            "max": <float>,
            "percentile_25": <float>,
            "percentile_75": <float>
        },
        "displacement_statistics": {
            "mean": <float>,
            "median": <float>,
            "min": <float>,
            "max": <float>,
            "percentile_25": <float>,
            "percentile_75": <float>
        }
    }
    """
    try:
        test = Test.objects.get(id=test_id)
    except Test.DoesNotExist:
        return Response(
            {'error': f'Test with ID {test_id} not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get all curve data for the test
    curve_data = CurveData.objects.filter(test=test).order_by('displacement_mm')
    
    if not curve_data.exists():
        return Response(
            {'error': f'No curve data found for test ID {test_id}.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Extract load and displacement values
    load_values = np.array([data.load_kn for data in curve_data])
    displacement_values = np.array([data.displacement_mm for data in curve_data])
    
    # Compute statistics for load (kN)
    load_stats = {
        'mean': float(np.mean(load_values)),
        'median': float(np.median(load_values)),
        'min': float(np.min(load_values)),
        'max': float(np.max(load_values)),
        'percentile_25': _compute_percentile(load_values, 25),
        'percentile_75': _compute_percentile(load_values, 75),
    }
    
    # Compute statistics for displacement (mm)
    displacement_stats = {
        'mean': float(np.mean(displacement_values)),
        'median': float(np.median(displacement_values)),
        'min': float(np.min(displacement_values)),
        'max': float(np.max(displacement_values)),
        'percentile_25': _compute_percentile(displacement_values, 25),
        'percentile_75': _compute_percentile(displacement_values, 75),
    }
    
    response_data = {
        'test_id': test.id,
        'data_points_count': len(curve_data),
        'load_statistics': load_stats,
        'displacement_statistics': displacement_stats,
    }
    
    # Validate using serializer
    serializer = StatisticsSerializer(response_data)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def test_curve_data(request, test_id):
    """
    GET /api/tests/<test_id>/curve-data/
    
    Returns the raw displacement/load curve data for a test as arrays.
    
    Parameters:
    - test_id: The ID of the test
    
    Returns:
    {
        "test_id": <int>,
        "data_points_count": <int>,
        "displacement_mm": [<float>, ...],
        "load_kn": [<float>, ...],
        "energy_absorbed_kj": [<float|null>, ...]
    }
    
    The returned arrays are ordered by displacement values (ascending).
    All arrays have the same length as data_points_count.
    """
    try:
        test = Test.objects.get(id=test_id)
    except Test.DoesNotExist:
        return Response(
            {'error': f'Test with ID {test_id} not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get all curve data for the test, ordered by displacement
    curve_data = CurveData.objects.filter(test=test).order_by('displacement_mm')
    
    if not curve_data.exists():
        return Response(
            {'error': f'No curve data found for test ID {test_id}.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Extract data into arrays
    displacement_array = [data.displacement_mm for data in curve_data]
    load_array = [data.load_kn for data in curve_data]
    energy_array = [data.energy_absorbed_kj for data in curve_data]
    
    response_data = {
        'test_id': test.id,
        'data_points_count': len(curve_data),
        'displacement_mm': displacement_array,
        'load_kn': load_array,
        'energy_absorbed_kj': energy_array,
    }
    
    # Validate using serializer
    serializer = CurveDataListSerializer(response_data)
    return Response(serializer.data, status=status.HTTP_200_OK)
