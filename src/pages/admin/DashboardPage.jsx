import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./DashboardPage.css";

const API_BASE = "http://127.0.0.1:8000";

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/bolts/stats/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load stats");
        return res.json();
      })
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [token]);

  const cards = [
    { label: "Pending Review",   value: stats?.pending_uploads  },
    { label: "Approved Records", value: stats?.approved_uploads },
    { label: "Total Products",   value: stats?.total_products   },
  ];

  return (
    <div className="dp-root">
      <div className="dp-header">
        <h1>Dashboard</h1>
        <p>Welcome back, <strong>{user?.username}</strong></p>
      </div>
      <div className="dp-cards">
        {cards.map(({ label, value }) => (
          <div className="dp-card" key={label}>
            <span className="dp-card-label">{label}</span>
            <span className="dp-card-value">
              {loading ? "…" : value ?? "—"}
            </span>
          </div>
        ))}
      </div>
      <p className="dp-note">Use the sidebar to navigate to Upload Data or Review &amp; Approve.</p>
    </div>
  );
}
