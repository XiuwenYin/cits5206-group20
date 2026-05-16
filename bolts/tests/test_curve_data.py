"""
bolts/tests/test_curve_data.py
Tests for GET /api/bolts/tests/<id>/curve-data/ — raw curve data endpoint.
"""

from rest_framework import status
from .base import BoltsAPITestCase


class CurveDataTests(BoltsAPITestCase):

    def test_returns_displacement_and_load_arrays(self):
        """Response contains displacement_mm and load_kn as lists."""
        res = self.client.get(f"/api/bolts/tests/{self.test_a.id}/curve-data/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIsInstance(res.data["displacement_mm"], list)
        self.assertIsInstance(res.data["load_kn"], list)

    def test_array_length_matches_data_points_count(self):
        """Array lengths equal data_points_count."""
        res = self.client.get(f"/api/bolts/tests/{self.test_a.id}/curve-data/")
        n = res.data["data_points_count"]
        self.assertEqual(len(res.data["displacement_mm"]), n)
        self.assertEqual(len(res.data["load_kn"]), n)

    def test_ordered_by_displacement_ascending(self):
        """Displacement values are in ascending order."""
        res = self.client.get(f"/api/bolts/tests/{self.test_a.id}/curve-data/")
        d = res.data["displacement_mm"]
        self.assertEqual(d, sorted(d))

    def test_nonexistent_test_returns_404(self):
        """Requesting curve data for a missing test ID returns 404."""
        res = self.client.get("/api/bolts/tests/99999/curve-data/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_test_with_no_curve_data_returns_404(self):
        """Test that exists but has no curve points returns 404."""
        res = self.client.get(f"/api/bolts/tests/{self.test_b.id}/curve-data/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
