import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiGetPendingUploads, apiApproveUpload, apiRejectUpload } from "../../api/review";
import "./ReviewPage.css";

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" }) +
    " " + d.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" });
}

export default function ReviewPage() {
  const { token } = useAuth();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadUploads();
  }, []);

  async function loadUploads() {
    setLoading(true);
    try {
      const data = await apiGetPendingUploads(token);
      setUploads(data);
    } finally {
      setLoading(false);
    }
  }

  function showNotification(msg, type) {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }

  async function handleApprove(id) {
    setActionLoading(id + "_approve");
    try {
      await apiApproveUpload(id, token);
      setUploads((prev) => prev.filter((u) => u.id !== id));
      showNotification("Upload approved and made public.", "success");
    } catch {
      showNotification("Failed to approve. Try again.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id) {
    setActionLoading(id + "_reject");
    try {
      await apiRejectUpload(id, token);
      setUploads((prev) => prev.filter((u) => u.id !== id));
      showNotification("Upload rejected and removed.", "error");
    } catch {
      showNotification("Failed to reject. Try again.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="rp-root">
      <div className="rp-header">
        <div>
          <h1>Review & Approve</h1>
          <p>Review uploaded data before making it publicly visible.</p>
        </div>
        <div className="rp-badge">{uploads.length} Pending</div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`rp-notification ${notification.type}`}>
          {notification.type === "success" ? (
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <circle cx="7.5" cy="7.5" r="6.5" stroke="#68d391" strokeWidth="1.4"/>
              <path d="M5 7.5l2 2 3-3" stroke="#68d391" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <circle cx="7.5" cy="7.5" r="6.5" stroke="#fc8181" strokeWidth="1.4"/>
              <path d="M7.5 4.5v3.2M7.5 10h.01" stroke="#fc8181" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          )}
          {notification.msg}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rp-loading">
          <span className="rp-spinner" />
          <span>Loading pending uploads...</span>
        </div>
      )}

      {/* Empty */}
      {!loading && uploads.length === 0 && (
        <div className="rp-empty">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" stroke="rgba(27,152,224,0.2)" strokeWidth="2"/>
            <path d="M13 20l5 5 9-9" stroke="rgba(27,152,224,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>No pending uploads</p>
          <span>All uploads have been reviewed.</span>
        </div>
      )}

      {/* Upload list */}
      {!loading && uploads.length > 0 && (
        <div className="rp-list">
          {uploads.map((upload) => (
            <div className="rp-card" key={upload.id}>
              <div className="rp-card-icon">
                {upload.filename.endsWith(".csv") ? "CSV" : "JSON"}
              </div>

              <div className="rp-card-info">
                <span className="rp-card-name">{upload.filename}</span>
                <div className="rp-card-meta">
                  <span>{upload.records_parsed} records</span>
                  <span className="rp-dot">·</span>
                  <span>{formatDate(upload.uploaded_at)}</span>
                </div>
              </div>

              <div className="rp-card-status">
                <span className="rp-pending-badge">Pending Review</span>
              </div>

              <div className="rp-card-actions">
                <button
                  className="rp-reject-btn"
                  onClick={() => handleReject(upload.id)}
                  disabled={!!actionLoading}
                >
                  {actionLoading === upload.id + "_reject" ? <span className="rp-spinner-sm" /> : "Reject"}
                </button>
                <button
                  className="rp-approve-btn"
                  onClick={() => handleApprove(upload.id)}
                  disabled={!!actionLoading}
                >
                  {actionLoading === upload.id + "_approve" ? <span className="rp-spinner-sm" /> : "Approve"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}