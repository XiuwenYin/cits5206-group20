import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiLogin } from "../../api/auth";
import "./LoginPage.css";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin/dashboard";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await apiLogin(username, password);
      login(token, user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lp-root">
      <div className="lp-bg">
        <div className="lp-grid" />
        <div className="lp-glow" />
      </div>

      <div className="lp-card">
        <div className="lp-header">
          <div className="lp-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#0F4C75"/>
              <path d="M11 30 L20 11 L29 30" stroke="#1B98E0" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M14.5 23 L25.5 23" stroke="#1B98E0" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="lp-title">Ground Support<br/>Testing System</h1>
          <p className="lp-sub">Administrator Portal</p>
        </div>

        <form className="lp-form" onSubmit={handleSubmit}>
          <div className="lp-field">
            <label htmlFor="username">Username</label>
            <input
              id="username" type="text"
              value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="username" required disabled={loading}
            />
          </div>

          <div className="lp-field">
            <label htmlFor="password">Password</label>
            <input
              id="password" type="password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password" required disabled={loading}
            />
          </div>

          {error && (
            <div className="lp-error" role="alert">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="7.5" cy="7.5" r="6.5" stroke="#fc8181" strokeWidth="1.4"/>
                <path d="M7.5 4.5v3.2M7.5 10h.01" stroke="#fc8181" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <button className="lp-btn" type="submit" disabled={loading}>
            {loading ? <span className="lp-spinner" /> : "Sign In"}
          </button>
        </form>

        <p className="lp-hint">Demo credentials: <code>admin</code> / <code>admin123</code></p>
      </div>
    </div>
  );
}