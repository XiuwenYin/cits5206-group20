"""
bolts/serializers.py
Serializers for Bolt and related models.
Converts model instances to/from JSON for API responses.
"""

from rest_framework import serializers
from .models import Bolt, BoltCategory, EquipmentType, CurveData


class EquipmentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EquipmentType
        fields = ['id', 'equipment_type_name']


class BoltCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BoltCategory
        fields = ['id', 'categoryName']


class BoltSerializer(serializers.ModelSerializer):
    """
    Serializer for Bolt model.
    Includes nested category, equipment, and test methodology information.
    """
    category = BoltCategorySerializer(read_only=True)
    equipment = EquipmentTypeSerializer(many=True, read_only=True)
    test_methodologies = serializers.SerializerMethodField()

    def get_test_methodologies(self, obj):
        return list(
            obj.tests.exclude(test_type__isnull=True)
                     .exclude(test_type='')
                     .values_list('test_type', flat=True)
                     .distinct()
        )

    class Meta:
        model = Bolt
        fields = [
            'id',
            'supplier',
            'name',
            'length_m',
            'diameter_mm',
            'category',
            'equipment',
            'test_methodologies',
        ]


class StatisticsSerializer(serializers.Serializer):
    """
    Serializer for test curve data statistics.
    Computes and returns summary statistics for load and displacement data.
    """
    test_id = serializers.IntegerField()
    data_points_count = serializers.IntegerField()
    
    # Load (kN) statistics
    load_statistics = serializers.DictField(
        child=serializers.FloatField(),
        help_text="Statistics for load values in kN"
    )
    
    # Displacement (mm) statistics
    displacement_statistics = serializers.DictField(
        child=serializers.FloatField(),
        help_text="Statistics for displacement values in mm"
    )


class CurveDataSerializer(serializers.ModelSerializer):
    """
    Serializer for CurveData model.
    Returns individual displacement/load data points for a test.
    """
    class Meta:
        model = CurveData
        fields = ['id', 'displacement_mm', 'load_kn', 'energy_absorbed_kj']


class CurveDataListSerializer(serializers.Serializer):
    """
    Serializer for returning curve data as arrays for a test.
    Returns displacement and load arrays along with test metadata.
    """
    test_id = serializers.IntegerField()
    data_points_count = serializers.IntegerField()
    displacement_mm = serializers.ListField(
        child=serializers.FloatField(),
        help_text="Array of displacement values in millimeters"
    )
    load_kn = serializers.ListField(
        child=serializers.FloatField(),
        help_text="Array of load values in kilonewtons"
    )
    energy_absorbed_kj = serializers.ListField(
        child=serializers.FloatField(),
        allow_null=True,
        help_text="Array of energy absorbed values in kilojoules (may be null)"
    )
