const API_BASE = "http://127.0.0.1:8000";

export async function apiGetPendingUploads(token) {
  const res = await fetch(`${API_BASE}/api/review/pending/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch pending uploads");
  return await res.json();
}

export async function apiApproveUpload(id, token) {
  const res = await fetch(`${API_BASE}/api/review/${id}/approve/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to approve upload");
  return await res.json();
}

export async function apiRejectUpload(id, token) {
  const res = await fetch(`${API_BASE}/api/review/${id}/reject/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to reject upload");
  return await res.json();
}