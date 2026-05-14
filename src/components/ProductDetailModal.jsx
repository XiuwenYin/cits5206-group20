import React, { useEffect, useState } from "react";
import TestCurveChart from "./TestCurveChart";

const API_BASE = "http://127.0.0.1:8000";

export default function ProductDetailModal({ product, curves, onClose }) {
  const [stats, setStats] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);

  // Filter curves that belong to this product
  const productCurves = curves.filter((curve) =>
    curve.productName.startsWith(`${product.supplier} — ${product.name}`)
  );

  // Extract test IDs from curve ids (format: "test-1", "test-2", ...)
  const testIds = productCurves.map((c) => parseInt(c.id.replace("test-", ""), 10));

  useEffect(() => {
    if (!testIds.length) return;
    setStatsLoading(true);
    Promise.allSettled(
      testIds.map((id) =>
        fetch(`${API_BASE}/api/bolts/tests/${id}/statistics/`).then((r) => {
          if (!r.ok) throw new Error();
          return r.json();
        })
      )
    )
      .then((results) => {
        const loaded = results
          .filter((r) => r.status === "fulfilled")
          .map((r) => r.value);
        setStats(loaded);
      })
      .finally(() => setStatsLoading(false));
  }, []);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const methodology = productCurves
    .map((c) => {
      const match = c.productName.match(/\((\w+)\)$/);
      return match ? match[1] : null;
    })
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .map((m) => m.charAt(0).toUpperCase() + m.slice(1))
    .join(", ");

  return (
    <div style={styles.backdrop} onClick={handleBackdropClick}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <p style={styles.eyebrow}>Product Details</p>
            <h2 style={styles.title}>{product.name}</h2>
          </div>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Metadata grid */}
        <div style={styles.metaGrid}>
          <MetaItem label="Supplier" value={product.supplier} />
          <MetaItem label="Length" value={`${product.length_m} m`} />
          <MetaItem label="Diameter" value={`${product.diameter_mm} mm`} />
          <MetaItem label="Category" value={product.category?.categoryName || "—"} highlight />
          <MetaItem
            label="Equipment"
            value={product.equipment?.map((e) => e.equipment_type_name).join(", ") || "—"}
          />
          <MetaItem label="Methodology" value={methodology || "—"} />
        </div>

        {/* Curve chart */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Force–Displacement Curves</h3>
          {productCurves.length === 0 ? (
            <p style={styles.muted}>No curve data available for this product.</p>
          ) : (
            <TestCurveChart curves={productCurves} />
          )}
        </div>

        {/* Statistics */}
        {testIds.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Test Statistics</h3>
            {statsLoading ? (
              <p style={styles.muted}>Loading statistics...</p>
            ) : stats.length === 0 ? (
              <p style={styles.muted}>No statistics available.</p>
            ) : (
              stats.map((s, i) => (
                <div key={s.test_id} style={styles.statsBlock}>
                  <p style={styles.statsLabel}>
                    Test {s.test_id} — {s.data_points_count} data points
                  </p>
                  <div style={styles.statsGrid}>
                    <StatCard label="Max Load" value={`${s.load_statistics.max.toFixed(2)} kN`} />
                    <StatCard label="Mean Load" value={`${s.load_statistics.mean.toFixed(2)} kN`} />
                    <StatCard label="Median Load" value={`${s.load_statistics.median.toFixed(2)} kN`} />
                    <StatCard label="P25 Load" value={`${s.load_statistics.percentile_25.toFixed(2)} kN`} />
                    <StatCard label="P75 Load" value={`${s.load_statistics.percentile_75.toFixed(2)} kN`} />
                    <StatCard label="Max Displacement" value={`${s.displacement_statistics.max.toFixed(2)} mm`} />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MetaItem({ label, value, highlight }) {
  return (
    <div style={styles.metaItem}>
      <span style={styles.metaLabel}>{label}</span>
      {highlight ? (
        <span style={styles.badge}>{value}</span>
      ) : (
        <span style={styles.metaValue}>{value}</span>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={styles.statCard}>
      <span style={styles.statValue}>{value}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "24px",
  },
  modal: {
    background: "#ffffff",
    borderRadius: "20px",
    boxShadow: "0 24px 64px rgba(15, 23, 42, 0.18)",
    width: "100%",
    maxWidth: "820px",
    maxHeight: "90vh",
    overflowY: "auto",
    padding: "32px",
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
  },
  eyebrow: {
    color: "#2563eb",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    fontSize: "12px",
    margin: "0 0 6px",
  },
  title: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#172033",
    margin: 0,
  },
  closeBtn: {
    background: "#f1f5f9",
    border: "none",
    borderRadius: "10px",
    padding: "8px",
    cursor: "pointer",
    color: "#475467",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "28px",
    background: "#f8fafc",
    borderRadius: "14px",
    padding: "20px",
    border: "1px solid #e5edf7",
  },
  metaItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  metaLabel: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#667085",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  metaValue: {
    fontSize: "15px",
    color: "#172033",
    fontWeight: 500,
  },
  badge: {
    display: "inline-block",
    background: "#e0f2fe",
    color: "#075985",
    padding: "3px 10px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
    width: "fit-content",
  },
  section: {
    marginBottom: "24px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#172033",
    marginBottom: "12px",
  },
  muted: {
    color: "#667085",
    fontSize: "14px",
  },
  statsBlock: {
    marginBottom: "16px",
  },
  statsLabel: {
    fontSize: "13px",
    color: "#667085",
    marginBottom: "8px",
    fontWeight: 600,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
  },
  statCard: {
    background: "#f8fafc",
    border: "1px solid #e5edf7",
    borderRadius: "12px",
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  statValue: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#0f4c81",
  },
  statLabel: {
    fontSize: "12px",
    color: "#667085",
  },
};
