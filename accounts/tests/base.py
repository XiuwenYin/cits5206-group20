"""
accounts/tests/base.py
Shared fixture for accounts/auth test modules.
"""

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient


class AccountsTestCase(TestCase):
    """
    Base class that creates an admin superuser and a regular (non-staff) user.
    Each test gets a clean DB via Django's TestCase transaction rollback.
    """

    def setUp(self):
        # Admin superuser — can access all protected endpoints
        self.admin = User.objects.create_superuser(
            username="admin", password="adminpass", email="admin@test.com"
        )

        # Regular (non-admin) user — can obtain a token but cannot access /check/
        self.regular_user = User.objects.create_user(
            username="regular", password="regularpass"
        )

        # Unauthenticated client (no credentials set)
        self.anon_client = APIClient()

        # Admin client — token set via force_authenticate (bypasses JWT for unit tests)
        self.admin_client = APIClient()
        self.admin_client.force_authenticate(user=self.admin)

        # Regular-user client — token set via force_authenticate
        self.regular_client = APIClient()
        self.regular_client.force_authenticate(user=self.regular_user)
