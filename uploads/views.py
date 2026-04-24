import json
import csv
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import PendingUpload

from bolts.models import (
    Bolt, Test, StaticTest, DynamicTest,
    BoltCategory, EquipmentType,
    TestFacility, InstallationMethod, EncapsulationMethod, CurveData
)

@method_decorator(csrf_exempt, name='dispatch')
class FileUploadView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get("file")
        data_type = request.data.get("data_type")

        if not file:
            return Response({"error": "No file provided"}, status=400)

        if data_type not in ["bolts", "tests", "curves"]:
            return Response({"error": "Invalid data_type"}, status=400)

        try:
            filename = file.name
            pending = None

            if data_type in ["bolts", "tests"]:
                data = json.load(file)
                pending = PendingUpload.objects.create(
                    filename=filename,
                    data_type=data_type,
                    file_content=data,
                    records_parsed=len(data),
                )

            elif data_type == "curves":
                test_id = request.data.get("test_id")
                if not test_id:
                    return Response({"error": "test_id is required for curve upload"}, status=400)
                csv_text = file.read().decode("utf-8")
                record_count = len(csv_text.strip().splitlines()) - 1  # subtract header
                pending = PendingUpload.objects.create(
                    filename=filename,
                    data_type=data_type,
                    csv_content=csv_text,
                    test_id=test_id,
                    records_parsed=max(record_count, 0),
                )

            return Response({
                "message": "Upload received and pending review",
                "filename": pending.filename,
                "records_parsed": pending.records_parsed,
            }, status=200)

        except json.JSONDecodeError:
            return Response({"error": "Invalid JSON file"}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

    #Bolts Upload
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

    #Tests Upload
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

            #Static Test
            if t.get("test_methodology") == "static":
                StaticTest.objects.create(
                    test=test,
                    loading_rate=t.get("loading_rate")
                )

            #Dynamic Test
            elif t.get("test_methodology") == "dynamic":
                DynamicTest.objects.create(
                    test=test,
                    number_of_drops=t.get("number_of_drops"),
                    energy_absorption_kj=t.get("energy_absorption"),
                )

    #Utility Functions
    def clean_diameter(self, value):
        return float(str(value).replace("mm", ""))

    def handle_curves(self, file, test_id):
        try:
            test = Test.objects.get(id=test_id)
        except Test.DoesNotExist:
            raise Exception(f"Test with id {test_id} not found")

        CurveData.objects.filter(test=test).delete()

        # Handle both raw uploaded files (bytes) and StringIO (already decoded)
        if hasattr(file, 'read'):
            content = file.read()
            if isinstance(content, bytes):
                content = content.decode("utf-8")
            lines = content.splitlines()
        else:
            lines = file.splitlines()

        reader = csv.DictReader(lines)
        reader.fieldnames = [field.strip() for field in reader.fieldnames]

        curve_objects = []
        for row in reader:
            row = {k.strip(): v.strip() for k, v in row.items()}
            try:
                displacement = float(row["Deformation (mm)"])
                load_kn = float(row["Load (tonnes)"]) * 9.81
                curve_objects.append(CurveData(
                    test=test,
                    displacement_mm=displacement,
                    load_kn=load_kn
                ))
            except Exception as e:
                print(f"Skipping row: {row} | Error: {e}")

        CurveData.objects.bulk_create(curve_objects)

    def get(self, request):
        return Response({
            "message": "Use POST with files: products, tests"
        })
    
class PendingUploadsListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        uploads = PendingUpload.objects.filter(status="pending").order_by("-uploaded_at")
        data = [
            {
                "id": u.id,
                "filename": u.filename,
                "data_type": u.data_type,
                "records_parsed": u.records_parsed,
                "uploaded_at": u.uploaded_at.isoformat(),
            }
            for u in uploads
        ]
        return Response(data, status=200)


class ApproveUploadView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            pending = PendingUpload.objects.get(id=pk, status="pending")
        except PendingUpload.DoesNotExist:
            return Response({"error": "Pending upload not found"}, status=404)

        try:
            with transaction.atomic():
                if pending.data_type == "bolts":
                    self._commit_bolts(pending.file_content)

                elif pending.data_type == "tests":
                    bolt_map = {(b.supplier, b.name): b for b in Bolt.objects.all()}
                    self._commit_tests(pending.file_content, bolt_map)

                elif pending.data_type == "curves":
                    import io
                    uploader = FileUploadView()
                    csv_file = io.StringIO(pending.csv_content)
                    uploader.handle_curves(csv_file, pending.test_id)

                pending.status = "approved"
                pending.save()

            return Response({"message": "Upload approved"}, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=400)

    def _commit_bolts(self, data):
        uploader = FileUploadView()
        uploader.handle_products(data)

    def _commit_tests(self, data, bolt_map):
        uploader = FileUploadView()
        uploader.handle_tests(data, bolt_map)


class RejectUploadView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            pending = PendingUpload.objects.get(id=pk, status="pending")
        except PendingUpload.DoesNotExist:
            return Response({"error": "Pending upload not found"}, status=404)

        pending.status = "rejected"
        pending.save()
        return Response({"message": "Upload rejected"}, status=200)