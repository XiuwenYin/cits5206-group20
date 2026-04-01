"""
accounts/models.py
Defines the AdminUser model for authenticated admin access.
Extends Django's built-in User model via a one-to-one profile relationship.
"""

from django.db import models
from django.contrib.auth.models import User


class AdminProfile(models.Model):
    """
    Extends the built-in Django User model with admin-specific fields.
    Each AdminUser has a one-to-one relationship with a Django User instance.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"AdminProfile({self.user.username})"