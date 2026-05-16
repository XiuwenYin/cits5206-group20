"""
bolts/tests/test_test_list.py
Tests for GET /api/bolts/tests/ — public test list endpoint.
"""

from rest_framework import status
from .base import BoltsAPITestCase


class TestListTests(BoltsAPITestCase):

    def test_returns_all_tests(self):
        """Returns a flat list of all tests."""
        res = self.client.get("/api/bolts/tests/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIsInstance(res.data, list)
        self.assertEqual(len(res.data), 2)

    def test_each_item_has_id_and_label(self):
        """Each entry has id and label fields (used by Upload dropdown)."""
        res = self.client.get("/api/bolts/tests/")
        for item in res.data:
            self.assertIn("id", item)
            self.assertIn("label", item)

    def test_accessible_without_authentication(self):
        """Endpoint is public — no token required."""
        self.client.credentials()
        res = self.client.get("/api/bolts/tests/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_accessible_with_invalid_token(self):
        """Expired/invalid token must NOT block the response (AllowAny)."""
        self.client.credentials(HTTP_AUTHORIZATION="Bearer this.is.invalid")
        res = self.client.get("/api/bolts/tests/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
