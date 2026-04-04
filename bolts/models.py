""" Need to confirm data types for stiffness and loading rate --- requires additional sample data from Matt""""""
bolts/models.py
Defines the core data models for the Ground Support Testing Data System.
Based on the ER diagram agreed with the client (Matthew Heinsen Egan).

Models:
    - Bolt: rock bolt product information
    - Equipment: equipment compatibility options (many-to-many with Bolt)
    - Test: shared test metadata
    - StaticTest: static methodology-specific fields
    - DynamicTest: dynamic methodology-specific fields
    - CurveData: force-displacement data points per test
"""

from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

class EquipmentType(models.Model):
    equipment_type_name = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.equipment_type_name

class BoltCategory(models.Model):   
    categoryName = models.CharField(max_length=30, unique=True)

    def __str__(self):
        return self.categoryName
    
class Bolt(models.Model):
    """
    Represents a rock bolt product.
    Corresponds to products.json in the example data.
    """

    supplier = models.CharField(max_length=70)
    name = models.CharField(max_length=100)
    length_m = models.FloatField(help_text="Bolt length in metres")
    diameter_mm = models.FloatField(help_text="Bolt diameter in millimetres")

    category = models.ForeignKey(BoltCategory, on_delete=models.CASCADE, related_name='bolts')
    """Following our ER diagram, we would need a junction table for the equipment. But apparently Django makes it automatically. Will need to check this later just to ensure it's not making problems though."""
    equipment = models.ManyToManyField(EquipmentType,related_name='bolts', blank=True)

    def __str__(self):
        return f"{self.supplier} - {self.name}"

class InstallationMethod(models.Model):
    installation_name = models.CharField(max_length=30, unique=True)

    def __str__(self):
        return f"{self.installation_name}"
    
class TestFacility(models.Model):
    facility_name = models.CharField(max_length=30, unique=True)

    def __str__(self):
        return f"{self.facility_name}"

class EncapsulationMethod(models.Model):
    encapsulation_name = models.CharField(max_length=15, unique=True)

    def __str__(self):
        return f"{self.encapsulation_name}"
    


class Test(models.Model):
    """
    Shared test metadata for both static and dynamic tests.
    Corresponds to tests.json in the example data.
    """
    """Both stiffness (both types) and loading rate (static only), are decimal fields for safety. We don't have any data on them in our sample data, so if we ever get proper data we can change their types to appropriate ones like float (if necessary)."""

    bolt = models.ForeignKey(Bolt, on_delete=models.CASCADE, related_name='tests')

    peak_strength = models.DecimalField(max_digits=18, decimal_places=15, blank=True, null=True)
    bond_strength = models.DecimalField(max_digits=18, decimal_places=12, blank=True, null=True)
    ultimate_deformation = models.DecimalField(max_digits=6, decimal_places=3, blank=True, null=True)
    
    stiffness = models.DecimalField(max_digits=18, decimal_places=12,blank=True, null=True)
    test_facility = models.ForeignKey(TestFacility, on_delete=models.PROTECT)
    installation_method = models.ForeignKey(InstallationMethod, on_delete=models.PROTECT)
    encapsulation_method = models.ForeignKey(EncapsulationMethod, on_delete=models.PROTECT)
    approved_by = models.ForeignKey(User, on_delete=models.PROTECT, null=True, blank=True)

    is_approved = models.BooleanField(default=False)
    approval_date = models.DateTimeField(null=True, blank=True)

    """ Needs code on creation screen that ensures tests can't be both static and dynamic at the same time."""
    test_type = models.CharField(max_length=10, choices=[('static', 'Static'), ('dynamic', 'Dynamic')], blank=True, null=True)


    """Ensures that a test cannot be both static and dynamic -- Might not be necessary in the future depending on implementation of above."""
    def clean(self):
        if self.test_type == 'static' and hasattr(self, 'dynamic_details'):
            raise ValidationError("A static test should not be associated with a dynamic test.")

        if self.test_type == 'dynamic' and hasattr(self, 'static_details'):
            raise ValidationError("A dynamic test should not be associated with a static test.")
    

    def __str__(self):
        return f"Test {self.id} - {self.bolt.name}"

class StaticTest(models.Model):
    """Static methodology-specific fields."""
    test = models.OneToOneField(Test, on_delete=models.CASCADE, related_name='static_details')
    loading_rate = models.DecimalField(max_digits=10, decimal_places=5, blank=True, null=True)

    def __str__(self):
        return f"StaticTest for Test {self.test.id}"


class DynamicTest(models.Model):
    """Dynamic methodology-specific fields."""
    test = models.OneToOneField(Test, on_delete=models.CASCADE, related_name='dynamic_details')
    number_of_drops = models.IntegerField(blank=True, null=True)
    energy_absorption_kj = models.FloatField(blank=True, null=True)

    def __str__(self):
        return f"DynamicTest for Test {self.test.id}"

class CurveData(models.Model):
    """
    Stores individual force-displacement data points for a test.
    Corresponds to test_curves.csv in the example data.
    Each test has approximately 400 data points.
    """
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='curve_data')
    displacement_mm = models.FloatField()
    load_kn = models.FloatField()
    energy_absorbed_kj = models.FloatField(blank=True, null=True)

    class Meta:
        ordering = ['displacement_mm']

    def __str__(self):
        return f"CurveData(test={self.test.id}, displacement={self.displacement_mm})"