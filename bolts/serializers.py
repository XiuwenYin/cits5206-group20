"""
bolts/serializers.py
Serializers for Bolt and related models.
Converts model instances to/from JSON for API responses.
"""

from rest_framework import serializers
from .models import Bolt, BoltCategory, EquipmentType


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
    Includes nested category and equipment information.
    """
    category = BoltCategorySerializer(read_only=True)
    equipment = EquipmentTypeSerializer(many=True, read_only=True)

    class Meta:
        model = Bolt
        fields = [
            'id',
            'supplier',
            'name',
            'length_m',
            'diameter_mm',
            'category',
            'equipment'
        ]
