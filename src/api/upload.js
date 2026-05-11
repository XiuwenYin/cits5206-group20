const API_BASE = "http://127.0.0.1:8000";

export async function apiUploadFile(file, dataType, token) {
  if (!token) {
    throw new Error("No authentication token found. Please log in again.");
  }

  if (!dataType) {
    throw new Error("Please select a data type before uploading.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("data_type", dataType);

  const res = await fetch(`${API_BASE}/api/upload/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

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