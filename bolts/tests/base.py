"""
bolts/tests/base.py
Shared test fixture used by all bolts test modules.
"""

from django.test import TestCase
from rest_framework.test import APIClient

from bolts.models import (
    Bolt, BoltCategory, EquipmentType,
    Test, CurveData,
    InstallationMethod, TestFacility, EncapsulationMethod,
)


class BoltsAPITestCase(TestCase):
    """
    Base class that seeds a minimal but realistic set of DB objects.
    All bolts test classes inherit from this.
    """

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

        # 3 curve points for test_a (enough for statistics tests)
        for disp, load in [(0.0, 0.0), (10.0, 100.0), (20.0, 150.0)]:
            CurveData.objects.create(test=self.test_a, displacement_mm=disp, load_kn=load)
