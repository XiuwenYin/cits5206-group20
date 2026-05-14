import React, { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

export default function FilterSummaryStats({ filters }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.supplier)    params.set("supplier", filters.supplier);
    if (filters.length)      params.set("length", filters.length);
    if (filters.category)    params.set("category", filters.category);
    if (filters.methodology) params.set("methodology", filters.methodology);

    setLoading(true);
    fetch(`${API_BASE}/api/bolts/tests/summary/?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [filters]);

  // Don't render if no test data at all
  if (!loading && (!data || data.total_tests === 0)) return null;

  return (
    <section style={styles.card}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Summary Statistics</h2>
          <p style={styles.subtitle}>
            {loading
              ? "Loading…"
              : `Aggregated across ${data.total_tests} test${data.total_tests !== 1 ? "s" : ""} matching current filters`}
          </p>
        </div>
      </div>

      {!loading && data?.parameters?.length > 0 && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Parameter</th>
                <th style={styles.th}>Tests</th>
                <th style={styles.th}>Mean</th>
                <th style={styles.th}>Median</th>
                <th style={styles.th}>Min</th>
                <th style={styles.th}>Max</th>
              </tr>
            </thead>
            <tbody>
              {data.parameters.map((p) => (
                <tr key={p.label}>
                  <td style={styles.tdStrong}>
                    {p.label}
                    <span style={styles.unit}> ({p.unit})</span>
                  </td>
                  <td style={styles.td}>{p.count}</td>
                  <td style={styles.tdHighlight}>{p.mean.toFixed(2)}</td>
                  <td style={styles.tdHighlight}>{p.median.toFixed(2)}</td>
                  <td style={styles.td}>{p.min.toFixed(2)}</td>
                  <td style={styles.td}>{p.max.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && data?.parameters?.length === 0 && (
        <p style={styles.muted}>
          No numeric test parameters available for the current selection.
        </p>
      )}
    </section>
  );
}

const styles = {
  card: {
    background: "#ffffff",
    border: "1px solid #dbe3ef",
    borderRadius: "18px",
    boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
    overflow: "hidden",
    marginBottom: "24px",
  },
  header: {
    padding: "20px 28px",
    borderBottom: "1px solid #e5edf7",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    margin: "0 0 4px",
    fontSize: "18px",
    fontWeight: 700,
    color: "#172033",
  },
  subtitle: {
    margin: 0,
    fontSize: "13px",
    color: "#667085",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    background: "#f8fafc",
    color: "#344054",
    fontSize: "13px",
    fontWeight: 700,
    padding: "12px 16px",
    borderBottom: "1px solid #e5edf7",
  },
  td: {
    padding: "14px 16px",
    borderBottom: "1px solid #eef2f7",
    color: "#475467",
    fontSize: "14px",
  },
  tdStrong: {
    padding: "14px 16px",
    borderBottom: "1px solid #eef2f7",
    color: "#172033",
    fontWeight: 600,
    fontSize: "14px",
  },
  tdHighlight: {
    padding: "14px 16px",
    borderBottom: "1px solid #eef2f7",
    color: "#0f4c81",
    fontWeight: 700,
    fontSize: "14px",
  },
  unit: {
    color: "#94a3b8",
    fontWeight: 400,
    fontSize: "12px",
  },
  muted: {
    padding: "20px 28px",
    color: "#667085",
    fontSize: "14px",
    margin: 0,
  },
};
