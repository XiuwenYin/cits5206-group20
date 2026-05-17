"""
bolts/tests/test_products.py
Tests for GET /api/bolts/products/ — product listing and filtering.
"""

from rest_framework import status
from .base import BoltsAPITestCase


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
