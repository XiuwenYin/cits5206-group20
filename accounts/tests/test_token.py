"""
accounts/tests/test_token.py
Tests for POST /api/auth/token/ — JWT login endpoint.
"""

from rest_framework import status
from .base import AccountsTestCase


class TokenObtainTests(AccountsTestCase):

    def test_valid_admin_credentials_return_tokens(self):
        """Admin login with correct credentials returns access and refresh tokens."""
        res = self.anon_client.post(
            "/api/auth/token/",
            {"username": "admin", "password": "adminpass"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.data)
        self.assertIn("refresh", res.data)

    def test_valid_regular_user_credentials_return_tokens(self):
        """Non-admin user can also obtain a token pair."""
        res = self.anon_client.post(
            "/api/auth/token/",
            {"username": "regular", "password": "regularpass"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.data)

    def test_wrong_password_returns_401(self):
        """Incorrect password is rejected with 401."""
        res = self.anon_client.post(
            "/api/auth/token/",
            {"username": "admin", "password": "wrongpass"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_nonexistent_user_returns_401(self):
        """Login for a user that does not exist returns 401."""
        res = self.anon_client.post(
            "/api/auth/token/",
            {"username": "ghost", "password": "ghostpass"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_missing_password_returns_400(self):
        """Request without password field returns 400."""
        res = self.anon_client.post(
            "/api/auth/token/",
            {"username": "admin"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_username_returns_400(self):
        """Request without username field returns 400."""
        res = self.anon_client.post(
            "/api/auth/token/",
            {"password": "adminpass"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_empty_body_returns_400(self):
        """Request with an empty body returns 400."""
        res = self.anon_client.post("/api/auth/token/", {}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
