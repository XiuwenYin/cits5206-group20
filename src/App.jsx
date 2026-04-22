import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage     from "./pages/admin/LoginPage";
import AdminLayout   from "./pages/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import UploadPage from "./pages/admin/UploadPage";
import ReviewPage from "./pages/admin/ReviewPage";

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