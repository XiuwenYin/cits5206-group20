"""
uploads/tests/test_upload.py
Tests for POST /api/upload/ — file upload endpoint.
"""

from rest_framework import status
from uploads.models import PendingUpload
from .base import UploadTestCase, SAMPLE_BOLTS_JSON, SAMPLE_CURVE_CSV


class FileUploadAuthTests(UploadTestCase):

    def test_unauthenticated_upload_returns_401(self):
        """Anonymous users cannot upload files."""
        f = self.json_file(SAMPLE_BOLTS_JSON)
        res = self.anon_client.post(
            "/api/upload/", {"file": f, "data_type": "bolts"}, format="multipart"
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_upload_is_allowed(self):
        """Authenticated admin can upload files."""
        f = self.json_file(SAMPLE_BOLTS_JSON)
        res = self.auth_client.post(
            "/api/upload/", {"file": f, "data_type": "bolts"}, format="multipart"
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)


class FileUploadBoltsTests(UploadTestCase):

    def test_bolts_upload_creates_pending_record(self):
        """Uploading a bolts JSON creates one PendingUpload with status=pending."""
        f = self.json_file(SAMPLE_BOLTS_JSON)
        self.auth_client.post(
            "/api/upload/", {"file": f, "data_type": "bolts"}, format="multipart"
        )
        self.assertEqual(PendingUpload.objects.filter(status="pending").count(), 1)

    def test_bolts_upload_response_contains_filename_and_records(self):
        """Response body includes filename and records_parsed."""
        f = self.json_file(SAMPLE_BOLTS_JSON, filename="bolts.json")
        res = self.auth_client.post(
            "/api/upload/", {"file": f, "data_type": "bolts"}, format="multipart"
        )
        self.assertIn("filename", res.data)
        self.assertIn("records_parsed", res.data)
        self.assertEqual(res.data["filename"], "bolts.json")
        self.assertEqual(res.data["records_parsed"], 1)

    def test_bolts_upload_sets_correct_data_type(self):
        """PendingUpload.data_type is set to 'bolts'."""
        f = self.json_file(SAMPLE_BOLTS_JSON)
        self.auth_client.post(
            "/api/upload/", {"file": f, "data_type": "bolts"}, format="multipart"
        )
        upload = PendingUpload.objects.first()
        self.assertEqual(upload.data_type, "bolts")

    def test_invalid_json_returns_400(self):
        """Malformed JSON file returns 400."""
        import io
        bad_file = io.BytesIO(b"not valid json {{{")
        bad_file.name = "bad.json"
        res = self.auth_client.post(
            "/api/upload/", {"file": bad_file, "data_type": "bolts"}, format="multipart"
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class FileUploadCurvesTests(UploadTestCase):

    def test_curves_upload_creates_pending_record(self):
        """Uploading a curves CSV creates one PendingUpload with status=pending."""
        f = self.csv_file()
        res = self.auth_client.post(
            "/api/upload/",
            {"file": f, "data_type": "curves", "test_id": self.test_obj.id},
            format="multipart",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(PendingUpload.objects.filter(data_type="curves").count(), 1)

    def test_curves_upload_stores_test_id(self):
        """PendingUpload.test_id matches the submitted test_id."""
        f = self.csv_file()
        self.auth_client.post(
            "/api/upload/",
            {"file": f, "data_type": "curves", "test_id": self.test_obj.id},
            format="multipart",
        )
        upload = PendingUpload.objects.get(data_type="curves")
        self.assertEqual(upload.test_id, self.test_obj.id)

    def test_curves_upload_without_test_id_returns_400(self):
        """Curve upload missing test_id returns 400."""
        f = self.csv_file()
        res = self.auth_client.post(
            "/api/upload/", {"file": f, "data_type": "curves"}, format="multipart"
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class FileUploadValidationTests(UploadTestCase):

    def test_missing_file_returns_400(self):
        """Request with no file returns 400."""
        res = self.auth_client.post(
            "/api/upload/", {"data_type": "bolts"}, format="multipart"
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_data_type_returns_400(self):
        """Unknown data_type returns 400."""
        f = self.json_file(SAMPLE_BOLTS_JSON)
        res = self.auth_client.post(
            "/api/upload/", {"file": f, "data_type": "unknown"}, format="multipart"
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
