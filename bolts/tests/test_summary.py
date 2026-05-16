"""
bolts/tests/test_summary.py
Tests for GET /api/bolts/tests/summary/ — aggregated statistics panel.
"""

from rest_framework import status
from .base import BoltsAPITestCase


class SummaryStatsTests(BoltsAPITestCase):

    def test_returns_total_tests_and_parameters(self):
        """No filters: aggregates across all tests."""
        res = self.client.get("/api/bolts/tests/summary/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("total_tests", res.data)
        self.assertIn("parameters", res.data)
        self.assertEqual(res.data["total_tests"], 2)

    def test_parameters_contain_required_keys(self):
        """Each parameter entry has count, mean, median, min, max."""
        res = self.client.get("/api/bolts/tests/summary/")
        for param in res.data["parameters"]:
            for key in ("label", "unit", "count", "mean", "median", "min", "max"):
                self.assertIn(key, param)

    def test_filter_by_supplier_reduces_count(self):
        """supplier= filter reduces total_tests to only that supplier's tests."""
        res = self.client.get("/api/bolts/tests/summary/?supplier=Hoek")
        self.assertEqual(res.data["total_tests"], 1)

    def test_filter_by_methodology(self):
        """methodology= filter returns only matching tests."""
        res = self.client.get("/api/bolts/tests/summary/?methodology=dynamic")
        self.assertEqual(res.data["total_tests"], 1)

    def test_no_match_returns_zero_and_empty_parameters(self):
        """Filters that match nothing return total_tests=0 and empty parameters."""
        res = self.client.get("/api/bolts/tests/summary/?supplier=nobody")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["total_tests"], 0)
        self.assertEqual(res.data["parameters"], [])

    def test_peak_strength_mean_is_correct(self):
        """Verify computed mean for peak_strength matches expected value."""
        res = self.client.get("/api/bolts/tests/summary/?supplier=Hoek")
        params = {p["label"]: p for p in res.data["parameters"]}
        self.assertIn("Peak Strength", params)
        self.assertAlmostEqual(float(params["Peak Strength"]["mean"]), 150.0, places=1)
