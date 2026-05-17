"""
uploads/tests/test_review.py
Tests for the review workflow:
  GET  /api/review/pending/        — list pending uploads
  POST /api/review/<pk>/approve/   — approve an upload
  POST /api/review/<pk>/reject/    — reject an upload
"""

from rest_framework import status
from uploads.models import PendingUpload
from .base import UploadTestCase, SAMPLE_BOLTS_JSON


class PendingListTests(UploadTestCase):

    def setUp(self):
        super().setUp()
        # Create one pending upload to list
        PendingUpload.objects.create(
            filename="bolts.json",
            data_type="bolts",
            file_content=SAMPLE_BOLTS_JSON,
            records_parsed=1,
        )

    def test_unauthenticated_cannot_view_pending(self):
        """Anonymous users cannot access the pending list."""
        res = self.anon_client.get("/api/review/pending/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_can_view_pending(self):
        """Admin can retrieve the pending uploads list."""
        res = self.auth_client.get("/api/review/pending/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIsInstance(res.data, list)

    def test_pending_list_returns_only_pending_uploads(self):
        """Only uploads with status=pending are returned."""
        PendingUpload.objects.create(
            filename="approved.json", data_type="bolts",
            file_content=[], status="approved",
        )
        res = self.auth_client.get("/api/review/pending/")
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]["filename"], "bolts.json")

    def test_pending_list_items_have_expected_fields(self):
        """Each item has id, filename, data_type, records_parsed, uploaded_at."""
        res = self.auth_client.get("/api/review/pending/")
        item = res.data[0]
        for field in ("id", "filename", "data_type", "records_parsed", "uploaded_at"):
            self.assertIn(field, item)


class ApproveUploadTests(UploadTestCase):

    def setUp(self):
        super().setUp()
        self.pending = PendingUpload.objects.create(
            filename="bolts.json",
            data_type="bolts",
            file_content=SAMPLE_BOLTS_JSON,
            records_parsed=1,
        )

    def test_unauthenticated_cannot_approve(self):
        """Anonymous users cannot approve uploads."""
        res = self.anon_client.post(f"/api/review/{self.pending.id}/approve/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_approve_changes_status_to_approved(self):
        """Approving a pending upload sets its status to 'approved'."""
        self.auth_client.post(f"/api/review/{self.pending.id}/approve/")
        self.pending.refresh_from_db()
        self.assertEqual(self.pending.status, "approved")

    def test_approve_returns_success_message(self):
        """Approve response contains a success message."""
        res = self.auth_client.post(f"/api/review/{self.pending.id}/approve/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("message", res.data)

    def test_approve_nonexistent_upload_returns_404(self):
        """Approving a non-existent upload returns 404."""
        res = self.auth_client.post("/api/review/99999/approve/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_already_approved_upload_returns_404(self):
        """Cannot re-approve an already approved upload."""
        self.pending.status = "approved"
        self.pending.save()
        res = self.auth_client.post(f"/api/review/{self.pending.id}/approve/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)


class RejectUploadTests(UploadTestCase):

    def setUp(self):
        super().setUp()
        self.pending = PendingUpload.objects.create(
            filename="bolts.json",
            data_type="bolts",
            file_content=SAMPLE_BOLTS_JSON,
            records_parsed=1,
        )

    def test_unauthenticated_cannot_reject(self):
        """Anonymous users cannot reject uploads."""
        res = self.anon_client.post(f"/api/review/{self.pending.id}/reject/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_reject_changes_status_to_rejected(self):
        """Rejecting a pending upload sets its status to 'rejected'."""
        self.auth_client.post(f"/api/review/{self.pending.id}/reject/")
        self.pending.refresh_from_db()
        self.assertEqual(self.pending.status, "rejected")

    def test_reject_returns_success_message(self):
        """Reject response contains a success message."""
        res = self.auth_client.post(f"/api/review/{self.pending.id}/reject/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("message", res.data)

    def test_reject_nonexistent_upload_returns_404(self):
        """Rejecting a non-existent upload returns 404."""
        res = self.auth_client.post("/api/review/99999/reject/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_already_rejected_upload_returns_404(self):
        """Cannot re-reject an already rejected upload."""
        self.pending.status = "rejected"
        self.pending.save()
        res = self.auth_client.post(f"/api/review/{self.pending.id}/reject/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
