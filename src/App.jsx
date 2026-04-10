import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage     from "./pages/admin/LoginPage";
import AdminLayout   from "./pages/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";

// Placeholders — replace when #8 and #9 are done
function UploadPage() {
  return (
    <div>
      <h2 style={{ color: "#ddeefa", fontSize: "1.5rem", fontWeight: 600 }}>Upload Data</h2>
      <p style={{ color: "#3d6a80", marginTop: "0.5rem" }}>Coming in Issue #8</p>
    </div>
  );
}
function ReviewPage() {
  return (
    <div>
      <h2 style={{ color: "#ddeefa", fontSize: "1.5rem", fontWeight: 600 }}>Review &amp; Approve</h2>
      <p style={{ color: "#3d6a80", marginTop: "0.5rem" }}>Coming in Issue #9</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Protected */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="upload"    element={<UploadPage />} />
            <Route path="review"    element={<ReviewPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}