"""
uploads/tests/base.py
Shared fixture for upload workflow tests.
"""

import io
import json

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from uploads.models import PendingUpload
from bolts.models import (
    Bolt, BoltCategory, EquipmentType,
    Test, InstallationMethod, TestFacility, EncapsulationMethod,
)

# Minimal valid bolts JSON (matches the upload parser's expected keys)
SAMPLE_BOLTS_JSON = [
    {
        "supplier": "TestCo",
        "product_name": "Test Bolt 22mm",
        "bolt_length": 3.0,
        "bolt_diameter": "22mm",
        "bolt_category": "Encapsulated",
        "equipment_compatibility": ["Handheld"],
    }
]

# Minimal valid CSV for curve data (header + 2 data rows)
SAMPLE_CURVE_CSV = "Deformation (mm),Load (tonnes)\n0.0,0.0\n10.0,10.0\n"


class UploadTestCase(TestCase):
    """
    Base class that creates an admin user and a regular user,
    and seeds the DB with a bolt + test for curve upload tests.
    """

    def setUp(self):
        # Admin user (authenticated for all protected endpoints)
        self.admin = User.objects.create_superuser(
            username="admin", password="adminpass", email="admin@test.com"
        )

        # Non-admin user (used to test permission rejection)
        self.regular_user = User.objects.create_user(
            username="regular", password="regularpass"
        )

        # Authenticated client (force_authenticate bypasses JWT for unit tests)
        self.auth_client = APIClient()
        self.auth_client.force_authenticate(user=self.admin)

        # Unauthenticated client
        self.anon_client = APIClient()

        # Seed a bolt + test so curve uploads have something to attach to
        category = BoltCategory.objects.create(categoryName="Encapsulated")
        facility = TestFacility.objects.create(facility_name="Test Lab")
        install = InstallationMethod.objects.create(installation_name="Resin")
        encap = EncapsulationMethod.objects.create(encapsulation_name="Full")

        bolt = Bolt.objects.create(
            supplier="TestCo", name="Test Bolt 22mm",
            length_m=3.0, diameter_mm=22.0, category=category,
        )
        self.test_obj = Test.objects.create(
            bolt=bolt, test_type="static",
            test_facility=facility,
            installation_method=install,
            encapsulation_method=encap,
        )

    # ------------------------------------------------------------------
    # Helpers for building in-memory file objects
    # ------------------------------------------------------------------

    def json_file(self, data, filename="data.json"):
        """Return a file-like object containing JSON data."""
        content = json.dumps(data).encode("utf-8")
        f = io.BytesIO(content)
        f.name = filename
        return f

    def csv_file(self, content=SAMPLE_CURVE_CSV, filename="curves.csv"):
        """Return a file-like object containing CSV data."""
        f = io.BytesIO(content.encode("utf-8"))
        f.name = filename
        return f
