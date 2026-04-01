"""
accounts/views.py
Provides API views for admin authentication and verification.
These views are protected by JWT authentication middleware configured in settings.py.
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_check(request):
    """Check if the current user is authenticated. Returns 401 if token is invalid."""
    return Response({
        'username': request.user.username,
        'is_staff': request.user.is_staff,
        'message': 'Authenticated successfully'
    })