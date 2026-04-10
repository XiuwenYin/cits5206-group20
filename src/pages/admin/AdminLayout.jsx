import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiLogout } from "../../api/auth";
import "./AdminLayout.css";

const NAV = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="10" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="1" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="10" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    to: "/admin/upload",
    label: "Upload Data",
    icon: (
      <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
        <path d="M8.5 11V3M8.5 3L5.5 6M8.5 3L11.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2.5 13.5h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    to: "/admin/review",
    label: "Review & Approve",
    icon: (
      <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
        <path d="M2 8.5h13M2 4.5h13M2 12.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="13.5" cy="12.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M12.7 12.5l.65.65 1.3-1.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function AdminLayout() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await apiLogout(token);
    logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="al-root">
      <aside className="al-sidebar">
        <div className="al-top">
          <div className="al-brand">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="7" fill="#0F4C75"/>
              <path d="M7 21L14 8l7 13" stroke="#1B98E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M10 17h8" stroke="#1B98E0" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <span className="al-brand-name">GSTS Admin</span>
          </div>

          <nav className="al-nav">
            {NAV.map((item) => (
              <NavLink
                key={item.to} to={item.to}
                className={({ isActive }) => `al-link${isActive ? " active" : ""}`}
              >
                <span className="al-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="al-bottom">
          <div className="al-user">
            <div className="al-avatar">
              {user?.username?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="al-user-info">
              <span className="al-username">{user?.username ?? "Admin"}</span>
              <span className="al-role">Administrator</span>
            </div>
          </div>
          <button className="al-logout" onClick={handleLogout} title="Sign out">
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <path d="M6.5 3H3a1 1 0 00-1 1v9a1 1 0 001 1h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M11 11.5l3-3-3-3M14 8.5H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </aside>

      <main className="al-main">
        <Outlet />
      </main>
    </div>
  );
}