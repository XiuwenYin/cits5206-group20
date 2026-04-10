import React from "react";
import { useAuth } from "../../context/AuthContext";
import "./DashboardPage.css";

export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <div className="dp-root">
      <div className="dp-header">
        <h1>Dashboard</h1>
        <p>Welcome back, <strong>{user?.username}</strong></p>
      </div>
      <div className="dp-cards">
        {["Pending Review", "Approved Records", "Total Products"].map((label) => (
          <div className="dp-card" key={label}>
            <span className="dp-card-label">{label}</span>
            <span className="dp-card-value">—</span>
          </div>
        ))}
      </div>
      <p className="dp-note">Use the sidebar to navigate to Upload Data or Review &amp; Approve.</p>
    </div>
  );
}