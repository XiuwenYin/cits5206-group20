import React, { createContext, useContext, useState, useCallback } from "react";

const API_BASE = "http://127.0.0.1:8000";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("admin_token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("admin_user");
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((token, userData) => {
    localStorage.setItem("admin_token", token);
    localStorage.setItem("admin_user", JSON.stringify(userData));
    setToken(token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setToken(null);
    setUser(null);
  }, []);

  // Use the stored refresh token to get a new access token.
  // Returns the new access token, or throws if refresh fails (forces re-login).
  const refreshAccessToken = useCallback(async () => {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) throw new Error("Session expired. Please log in again.");

    const res = await fetch(`${API_BASE}/api/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) {
      // Refresh token itself is expired — force logout
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      setToken(null);
      setUser(null);
      throw new Error("Session expired. Please log in again.");
    }

    const data = await res.json();
    localStorage.setItem("admin_token", data.access);
    localStorage.setItem("access", data.access);
    setToken(data.access);
    return data.access;
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, refreshAccessToken, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}