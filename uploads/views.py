import json
import csv
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response

from bolts.models import (
    Bolt, Test, StaticTest, DynamicTest,
    BoltCategory, EquipmentType,
    TestFacility, InstallationMethod, EncapsulationMethod, CurveData
)


class FileUploadView(APIView):

    def post(self, request):
        products_file = request.FILES.get("products")
        tests_file = request.FILES.get("tests")
        test_id = request.data.get("test_id")
        curves_file = request.FILES.get("curves")

        if not products_file and not tests_file and not curves_file:
            return Response({"error": "No files provided"}, status=400)

        if curves_file and test_id:
            self.handle_curves(curves_file, test_id)
            return Response({"message": "Curve uploaded successfully"})

        try:
            products_data = json.load(products_file)
            tests_data = json.load(tests_file)

            with transaction.atomic():
                bolt_map = self.handle_products(products_data)
                self.handle_tests(tests_data, bolt_map)

            return Response({"message": "Success"})

        except Exception as e:
            return Response({"error": str(e)}, status=400)

    # Bolts Upload
    def handle_products(self, products):
        bolt_map = {}

        for p in products:
            category, _ = BoltCategory.objects.get_or_create(
                categoryName=p["bolt_category"]
            )

            bolt, _ = Bolt.objects.update_or_create(
                supplier=p["supplier"],
                name=p["product_name"],
                defaults={
                    "length_m": float(p["bolt_length"]),
                    "diameter_mm": self.clean_diameter(p["bolt_diameter"]),
                    "category": category,
                }
            )

            """ Many-to-Many Relationship Handling """
            bolt.equipment.clear()
            for eq in p.get("equipment_compatibility", []):
                equipment_obj, _ = EquipmentType.objects.get_or_create(
                    equipment_type_name=eq
                )
                bolt.equipment.add(equipment_obj)

            bolt_map[(p["supplier"], p["product_name"])] = bolt

        return bolt_map

    # Tests Upload
    def handle_tests(self, tests, bolt_map):
        for t in tests:
            key = (t["supplier"], t["product_name"])

            if key not in bolt_map:
                raise Exception(f"Bolt not found: {key}")

            bolt = bolt_map[key]

            facility, _ = TestFacility.objects.get_or_create(
                facility_name=t["test_facility"]
            )

            installation, _ = InstallationMethod.objects.get_or_create(
                installation_name=t["installation_method"]
            )

            encapsulation, _ = EncapsulationMethod.objects.get_or_create(
                encapsulation_name=t["encapsulation_method"]
            )

            test = Test.objects.create(
                bolt=bolt,
                peak_strength=t.get("peak_strength"),
                bond_strength=t.get("bond_strength"),
                ultimate_deformation=t.get("ultimate_deformation"),
                stiffness=t.get("stiffness"),
                test_facility=facility,
                installation_method=installation,
                encapsulation_method=encapsulation,
                test_type=t.get("test_methodology"),
            )

            # Static Test
            if t.get("test_methodology") == "static":
                StaticTest.objects.create(
                    test=test,
                    loading_rate=t.get("loading_rate")
                )

            # Dynamic Test
            elif t.get("test_methodology") == "dynamic":
                DynamicTest.objects.create(
                    test=test,
                    number_of_drops=t.get("number_of_drops"),
                    energy_absorption_kj=t.get("energy_absorption"),
                )

    # Utility Functions
    def clean_diameter(self, value):
        return float(str(value).replace("mm", ""))

    def handle_curves(self, file, test_id):
        try:
            test = Test.objects.get(id=test_id)
        except Test.DoesNotExist:
            raise Exception(f"Test with id {test_id} not found")


        # Remove existing curve data (prevents duplicates)
        CurveData.objects.filter(test=test).delete()

        decoded = file.read().decode("utf-8").splitlines()
        reader = csv.DictReader(decoded)
        reader.fieldnames = [field.strip() for field in reader.fieldnames]
        print("HEADERS:", reader.fieldnames)
        curve_objects = []

        for row in reader:
            row = {k.strip(): v.strip() for k, v in row.items()}
            try:
                displacement = float(row["Deformation (mm)"])
                load_tonnes = float(row["Load (tonnes)"])

                # Convert tonnes → kN
                load_kn = load_tonnes * 9.81

                curve_objects.append(
                    CurveData(
                        test=test,
                        displacement_mm=displacement,
                        load_kn=load_kn
                    )
                )

            except Exception as e:
                # Skip bad rows instead of crashing
                print(f"Skipping row: {row} | Error: {e}")

        # Bulk insert for performance
        CurveData.objects.bulk_create(curve_objects)

    def get(self, request):
        return Response({
            "message": "Use POST with files: products, tests"
        })