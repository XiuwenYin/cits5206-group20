
// MOCK implementation — replace with real API when backend is ready
// Real endpoint: POST /api/admin/upload/ (multipart/form-data, Authorization: Bearer <token>)
// const API_BASE = "http://127.0.0.1:8000";

export async function apiUploadFile(file, token) {
  await new Promise((r) => setTimeout(r, 1500));
  if (file.name.includes("error")) {
    throw new Error("Server rejected file: invalid format");
  }
  return {
    id: "upload_" + Date.now(),
    filename: file.name,
    records_parsed: Math.floor(Math.random() * 40) + 5,
    status: "pending_review",
    uploaded_at: new Date().toISOString(),
  };
}