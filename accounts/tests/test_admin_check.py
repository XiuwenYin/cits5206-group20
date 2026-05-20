"""
accounts/tests/test_admin_check.py
Tests for GET /api/auth/check/ — admin identity verification endpoint.
"""

from rest_framework import status
from .base import AccountsTestCase


class AdminCheckTests(AccountsTestCase):

    def test_admin_can_access_check_endpoint(self):
        """Authenticated admin receives 200 from /api/auth/check/."""
        res = self.admin_client.get("/api/auth/check/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_check_response_contains_expected_fields(self):
        """Response includes username, is_staff, and message."""
        res = self.admin_client.get("/api/auth/check/")
        for field in ("username", "is_staff", "message"):
            self.assertIn(field, res.data)

    def test_check_returns_correct_username(self):
        """Response username matches the authenticated admin's username."""
        res = self.admin_client.get("/api/auth/check/")
        self.assertEqual(res.data["username"], "admin")

    def test_check_returns_is_staff_true_for_admin(self):
        """is_staff is True for a superuser."""
        res = self.admin_client.get("/api/auth/check/")
        self.assertTrue(res.data["is_staff"])

    def test_unauthenticated_request_returns_401(self):
        """Anonymous request to /api/auth/check/ returns 401."""
        res = self.anon_client.get("/api/auth/check/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_regular_user_is_forbidden(self):
        """Non-admin (non-staff) user receives 403 from /api/auth/check/."""
        res = self.regular_client.get("/api/auth/check/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
