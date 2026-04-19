// MOCK implementation — replace with real API when backend is ready
// Real endpoints:
// GET  /api/admin/uploads/pending/  — list pending uploads
// POST /api/admin/uploads/<id>/approve/  — approve an upload
// POST /api/admin/uploads/<id>/reject/   — reject an upload

const MOCK_PENDING = [
  {
    id: "upload_001",
    filename: "bolt_test_static_2024.csv",
    records_parsed: 12,
    uploaded_at: "2026-04-10T08:23:00Z",
    uploaded_by: "admin",
    status: "pending_review",
  },
  {
    id: "upload_002",
    filename: "dynamic_test_results.json",
    records_parsed: 7,
    uploaded_at: "2026-04-11T14:05:00Z",
    uploaded_by: "admin",
    status: "pending_review",
  },
  {
    id: "upload_003",
    filename: "supplier_A_bolts.csv",
    records_parsed: 25,
    uploaded_at: "2026-04-12T09:45:00Z",
    uploaded_by: "admin",
    status: "pending_review",
  },
];

export async function apiGetPendingUploads(token) {
  await new Promise((r) => setTimeout(r, 800));
  return [...MOCK_PENDING];
}

export async function apiApproveUpload(id, token) {
  await new Promise((r) => setTimeout(r, 600));
  return { id, status: "approved" };
}

export async function apiRejectUpload(id, token) {
  await new Promise((r) => setTimeout(r, 600));
  return { id, status: "rejected" };
}