"""
accounts/tests/test_token_refresh.py
Tests for POST /api/auth/token/refresh/ — JWT token refresh endpoint.
"""

from rest_framework import status
from .base import AccountsTestCase


class TokenRefreshTests(AccountsTestCase):

    def _get_tokens(self, username="admin", password="adminpass"):
        """Helper: perform a login and return (access, refresh) tuple."""
        res = self.anon_client.post(
            "/api/auth/token/",
            {"username": username, "password": password},
            format="json",
        )
        return res.data.get("access"), res.data.get("refresh")

    def test_valid_refresh_token_returns_new_access_token(self):
        """A valid refresh token exchanges for a new access token."""
        _, refresh = self._get_tokens()
        res = self.anon_client.post(
            "/api/auth/token/refresh/",
            {"refresh": refresh},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.data)

    def test_invalid_refresh_token_returns_401(self):
        """A tampered or random refresh token is rejected with 401."""
        res = self.anon_client.post(
            "/api/auth/token/refresh/",
            {"refresh": "this.is.not.a.valid.token"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_missing_refresh_token_returns_400(self):
        """Request with no refresh field returns 400."""
        res = self.anon_client.post("/api/auth/token/refresh/", {}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_access_token_cannot_be_used_as_refresh_token(self):
        """Passing an access token to the refresh endpoint is rejected."""
        access, _ = self._get_tokens()
        res = self.anon_client.post(
            "/api/auth/token/refresh/",
            {"refresh": access},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
