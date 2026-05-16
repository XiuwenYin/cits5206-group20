"""
bolts/tests.py
Unit tests for the bolts API endpoints.

Covers:
  - Product listing and filtering (bolt_list_filter)
  - Public test list (test_list)
  - Summary statistics (test_summary)
  - Curve data retrieval (test_curve_data)
  - Per-test statistics (test_statistics)
"""

from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from .models import (
    Bolt, BoltCategory, EquipmentType,
    Test, CurveData,
    InstallationMethod, TestFacility, EncapsulationMethod,
)


# ---------------------------------------------------------------------------
# Shared test fixture
# ---------------------------------------------------------------------------

class BoltsAPITestCase(TestCase):
    """Base class: creates a minimal but realistic set of DB objects."""

    def setUp(self):
        self.client = APIClient()

        # Reference data
        self.category_enc  = BoltCategory.objects.create(categoryName="Encapsulated")
        self.category_fric = BoltCategory.objects.create(categoryName="Friction")
        self.equip_handheld = EquipmentType.objects.create(equipment_type_name="Handheld")
        self.facility = TestFacility.objects.create(facility_name="WA Test Lab")
        self.install  = InstallationMethod.objects.create(installation_name="Resin")
        self.encap    = EncapsulationMethod.objects.create(encapsulation_name="Full")

        # Bolt A — Hoek, static test
        self.bolt_a = Bolt.objects.create(
            supplier="Hoek", name="Resin grouted 22mm rod",
            length_m=3.0, diameter_mm=22.0, category=self.category_enc,
        )
        self.bolt_a.equipment.add(self.equip_handheld)

        # Bolt B — Atlas, dynamic test (no curve data)
        self.bolt_b = Bolt.objects.create(
            supplier="Atlas", name="Split Set 39mm stabiliser",
            length_m=2.4, diameter_mm=39.0, category=self.category_fric,
        )

        shared = dict(
            test_facility=self.facility,
            installation_method=self.install,
            encapsulation_method=self.encap,
            is_approved=True,
        )

        self.test_a = Test.objects.create(
            bolt=self.bolt_a, test_type="static",
            peak_strength=150.0, ultimate_deformation=45.0, **shared,
        )
        self.test_b = Test.objects.create(
            bolt=self.bolt_b, test_type="dynamic",
            peak_strength=200.0, ultimate_deformation=80.0, **shared,
        )

        # 3 curve points for test_a (enough for stats tests)
        for disp, load in [(0.0, 0.0), (10.0, 100.0), (20.0, 150.0)]:
            CurveData.objects.create(test=self.test_a, displacement_mm=disp, load_kn=load)


# ---------------------------------------------------------------------------
# 1. Product listing — GET /api/bolts/products/
# ---------------------------------------------------------------------------

class ProductListTests(BoltsAPITestCase):

    def test_returns_all_products(self):
        """No filters: all bolts returned with count and results."""
        res = self.client.get("/api/bolts/products/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["count"], 2)
        self.assertEqual(len(res.data["results"]), 2)

    def test_response_contains_expected_fields(self):
        """Each product has the fields the frontend expects."""
        res = self.client.get("/api/bolts/products/")
        product = res.data["results"][0]
        for field in ("id", "supplier", "name", "length_m", "diameter_mm",
                      "category", "equipment"):
            self.assertIn(field, product)

    def test_filter_by_supplier_exact(self):
        """supplier= returns only matching bolts (case-insensitive)."""
        res = self.client.get("/api/bolts/products/?supplier=hoek")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["count"], 1)
        self.assertEqual(res.data["results"][0]["supplier"], "Hoek")

    def test_filter_by_supplier_partial(self):
        """Partial supplier name still matches."""
        res = self.client.get("/api/bolts/products/?supplier=atl")
        self.assertEqual(res.data["count"], 1)
        self.assertEqual(res.data["results"][0]["supplier"], "Atlas")

    def test_filter_by_supplier_no_match(self):
        """Unknown supplier returns empty list, not an error."""
        res = self.client.get("/api/bolts/products/?supplier=unknown")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["count"], 0)

    def test_filter_by_length(self):
        """length= exact-matches length_m."""
        res = self.client.get("/api/bolts/products/?length=3.0")
        self.assertEqual(res.data["count"], 1)
        self.assertEqual(res.data["results"][0]["name"], "Resin grouted 22mm rod")

    def test_filter_by_length_invalid(self):
        """Non-numeric length returns 400."""
        res = self.client.get("/api/bolts/products/?length=abc")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_filter_by_category_name(self):
        """category= matches categoryName substring."""
        res = self.client.get("/api/bolts/products/?category=Encapsulated")
        self.assertEqual(res.data["count"], 1)
        self.assertEqual(res.data["results"][0]["supplier"], "Hoek")

    def test_filter_by_methodology_static(self):
        """methodology=static returns only bolts with static tests."""
        res = self.client.get("/api/bolts/products/?methodology=static")
        self.assertEqual(res.data["count"], 1)
        self.assertEqual(res.data["results"][0]["supplier"], "Hoek")

    def test_filter_by_methodology_dynamic(self):
        """methodology=dynamic returns only bolts with dynamic tests."""
        res = self.client.get("/api/bolts/products/?methodology=dynamic")
        self.assertEqual(res.data["count"], 1)
        self.assertEqual(res.data["results"][0]["supplier"], "Atlas")

    def test_filter_by_methodology_invalid(self):
        """Unknown methodology returns 400."""
        res = self.client.get("/api/bolts/products/?methodology=explosive")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_combined_filters_match(self):
        """Combining supplier + methodology narrows results correctly."""
        res = self.client.get("/api/bolts/products/?supplier=hoek&methodology=static")
        self.assertEqual(res.data["count"], 1)

    def test_combined_filters_no_match(self):
        """Filters that together match nothing return empty list, not an error."""
        res = self.client.get("/api/bolts/products/?supplier=hoek&methodology=dynamic")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["count"], 0)


# ---------------------------------------------------------------------------
# 2. Public test list — GET /api/bolts/tests/
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# 3. Summary statistics — GET /api/bolts/tests/summary/
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# 4. Curve data — GET /api/bolts/tests/<id>/curve-data/
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# 5. Per-test statistics — GET /api/bolts/tests/<id>/statistics/
# ---------------------------------------------------------------------------

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
