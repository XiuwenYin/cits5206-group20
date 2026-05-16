"""
bolts/tests/test_statistics.py
Tests for GET /api/bolts/tests/<id>/statistics/ — per-test statistics endpoint.
"""

from rest_framework import status
from .base import BoltsAPITestCase


class TestStatisticsTests(BoltsAPITestCase):

    def test_returns_load_and_displacement_statistics(self):
        """Response includes both load_statistics and displacement_statistics."""
        res = self.client.get(f"/api/bolts/tests/{self.test_a.id}/statistics/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("load_statistics", res.data)
        self.assertIn("displacement_statistics", res.data)

    def test_load_statistics_contain_all_keys(self):
        """load_statistics has mean, median, min, max, percentile_25, percentile_75."""
        res = self.client.get(f"/api/bolts/tests/{self.test_a.id}/statistics/")
        for key in ("mean", "median", "min", "max", "percentile_25", "percentile_75"):
            self.assertIn(key, res.data["load_statistics"])

    def test_load_min_max_match_seeded_data(self):
        """Min and max load match the seeded curve data (0.0 and 150.0)."""
        res = self.client.get(f"/api/bolts/tests/{self.test_a.id}/statistics/")
        stats = res.data["load_statistics"]
        self.assertAlmostEqual(float(stats["min"]), 0.0, places=2)
        self.assertAlmostEqual(float(stats["max"]), 150.0, places=2)

    def test_nonexistent_test_returns_404(self):
        """Statistics for a missing test ID return 404."""
        res = self.client.get("/api/bolts/tests/99999/statistics/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_test_with_no_curve_data_returns_404(self):
        """Statistics for a test with no curve points return 404."""
        res = self.client.get(f"/api/bolts/tests/{self.test_b.id}/statistics/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
