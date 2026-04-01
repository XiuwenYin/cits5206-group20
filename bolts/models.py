"""
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


class Equipment(models.Model):
    """Represents a type of equipment compatible with one or more bolts."""
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Bolt(models.Model):
    """
    Represents a rock bolt product.
    Corresponds to products.json in the example data.
    """
    CATEGORY_CHOICES = [
        ('Encapsulated', 'Encapsulated'),
        ('Hybrid', 'Hybrid'),
        ('Friction', 'Friction'),
    ]

    supplier = models.CharField(max_length=200)
    name = models.CharField(max_length=200)
    length_m = models.FloatField(help_text="Bolt length in metres")
    diameter_mm = models.FloatField(help_text="Bolt diameter in millimetres")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    equipment_compatibility = models.ManyToManyField(
        Equipment,
        related_name='bolts',
        blank=True
    )

    def __str__(self):
        return f"{self.supplier} - {self.name}"


class Test(models.Model):
    """
    Shared test metadata for both static and dynamic tests.
    Corresponds to tests.json in the example data.
    """
    METHODOLOGY_CHOICES = [
        ('Static', 'Static'),
        ('Dynamic', 'Dynamic'),
    ]

    bolt = models.ForeignKey(Bolt, on_delete=models.CASCADE, related_name='tests')
    methodology = models.CharField(max_length=10, choices=METHODOLOGY_CHOICES)
    facility = models.CharField(max_length=200)
    installation_method = models.CharField(max_length=200, blank=True, null=True)
    encapsulation_method = models.CharField(max_length=200, blank=True, null=True)
    peak_strength_kn = models.FloatField(blank=True, null=True)
    yield_strength_kn = models.FloatField(blank=True, null=True)
    ultimate_deformation_mm = models.FloatField(blank=True, null=True)
    is_approved = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Test {self.id} - {self.bolt.name} ({self.methodology})"


class StaticTest(models.Model):
    """Static methodology-specific fields."""
    test = models.OneToOneField(Test, on_delete=models.CASCADE, related_name='static_details')
    bond_strength = models.FloatField(blank=True, null=True)
    stiffness = models.FloatField(blank=True, null=True)
    loading_rate = models.FloatField(blank=True, null=True)

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