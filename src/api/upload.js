const API_BASE = "http://127.0.0.1:8000";

async function doUpload(file, dataType, token, testId) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("data_type", dataType);
  if (testId) formData.append("test_id", testId);

  return fetch(`${API_BASE}/api/upload/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
}

// refreshFn is AuthContext.refreshAccessToken — optional, allows auto-retry on 401
export async function apiUploadFile(file, dataType, token, testId = null, refreshFn = null) {
  if (!token) throw new Error("No authentication token found. Please log in again.");
  if (!dataType) throw new Error("Please select a data type before uploading.");

  let res = await doUpload(file, dataType, token, testId);

  // If token expired, try to refresh once and retry
  if (res.status === 401 && refreshFn) {
    const newToken = await refreshFn(); // throws if refresh itself fails
    res = await doUpload(file, dataType, newToken, testId);
  }

  if (!res.ok) {
    let message = `Upload failed (${res.status})`;
    try {
      const err = await res.json();
      message = err?.error || err?.detail || message;
    } catch (_) {}
    throw new Error(message);
  }

  return await res.json();
}