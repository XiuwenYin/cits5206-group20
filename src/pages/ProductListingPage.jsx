import React from "react";

const sampleProducts = [
  {
    id: 1,
    supplier: "Supplier A",
    product_name: "Resin Bolt A D20 mm x 2.4 m",
    bolt_length: "2.4",
    bolt_diameter: "20",
    bolt_category: "Encapsulated",
    equipment_compatibility: ["Handheld", "Mechanized Bolting Machine A", "Multi-OEM"],
  },
  {
    id: 2,
    supplier: "Supplier A",
    product_name: "Hybrid Bolt D39 x 2.4 m",
    bolt_length: "2.4",
    bolt_diameter: "20",
    bolt_category: "Hybrid",
    equipment_compatibility: ["Handheld", "Mechanized Bolting Machine A", "Multi-OEM"],
  },
  {
    id: 3,
    supplier: "Hoek",
    product_name: "Cement grouted 20mm diameter steel rebar",
    bolt_length: "3",
    bolt_diameter: "20",
    bolt_category: "Encapsulated",
    equipment_compatibility: ["Handheld", "Multi-OEM"],
  },
  {
    id: 4,
    supplier: "Hoek",
    product_name: "EXL Swellex dowel",
    bolt_length: "3",
    bolt_diameter: "26",
    bolt_category: "Encapsulated",
    equipment_compatibility: ["Handheld", "Multi-OEM"],
  },
];

export default function ProductListingPage() {
  return (
    <main style={styles.page}>
      <section style={styles.header}>
        <p style={styles.eyebrow}>Public Database</p>
        <h1 style={styles.title}>Rock Bolt Products</h1>
        <p style={styles.description}>
          Browse available ground support products before comparing their test results.
        </p>
      </section>

      <section style={styles.summaryRow}>
        <div style={styles.summaryCard}>
          <span style={styles.summaryNumber}>{sampleProducts.length}</span>
          <span style={styles.summaryLabel}>Products loaded</span>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryNumber}>2</span>
          <span style={styles.summaryLabel}>Suppliers</span>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryNumber}>FR1</span>
          <span style={styles.summaryLabel}>Product listing</span>
        </div>
      </section>

      <section style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Available Products</h2>
          <p style={styles.cardNote}>
            This first version uses client-provided sample data. Backend API integration will
            be connected once the endpoint is ready.
          </p>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>Supplier</th>
                <th style={styles.th}>Length</th>
                <th style={styles.th}>Diameter</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Equipment Compatibility</th>
              </tr>
            </thead>
            <tbody>
              {sampleProducts.map((product) => (
                <tr key={product.id}>
                  <td style={styles.tdStrong}>{product.product_name}</td>
                  <td style={styles.td}>{product.supplier}</td>
                  <td style={styles.td}>{product.bolt_length} m</td>
                  <td style={styles.td}>{product.bolt_diameter} mm</td>
                  <td style={styles.td}>
                    <span style={styles.badge}>{product.bolt_category}</span>
                  </td>
                  <td style={styles.td}>
                    {product.equipment_compatibility.join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    color: "#172033",
    padding: "48px",
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  header: {
    maxWidth: "900px",
    marginBottom: "28px",
  },
  eyebrow: {
    color: "#2563eb",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    margin: "0 0 8px",
  },
  title: {
    fontSize: "42px",
    lineHeight: 1.1,
    margin: "0 0 12px",
  },
  description: {
    color: "#526175",
    fontSize: "17px",
    margin: 0,
  },
  summaryRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  summaryCard: {
    background: "#ffffff",
    border: "1px solid #dbe3ef",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
  },
  summaryNumber: {
    display: "block",
    fontSize: "28px",
    fontWeight: 800,
    color: "#0f4c81",
  },
  summaryLabel: {
    display: "block",
    marginTop: "4px",
    color: "#667085",
    fontSize: "14px",
  },
  card: {
    background: "#ffffff",
    border: "1px solid #dbe3ef",
    borderRadius: "18px",
    boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
    overflow: "hidden",
  },
  cardHeader: {
    padding: "24px 28px",
    borderBottom: "1px solid #e5edf7",
  },
  cardTitle: {
    margin: "0 0 6px",
    fontSize: "22px",
  },
  cardNote: {
    margin: 0,
    color: "#667085",
    fontSize: "14px",
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
    padding: "14px 16px",
    borderBottom: "1px solid #e5edf7",
  },
  td: {
    padding: "16px",
    borderBottom: "1px solid #eef2f7",
    color: "#475467",
    verticalAlign: "top",
  },
  tdStrong: {
    padding: "16px",
    borderBottom: "1px solid #eef2f7",
    color: "#172033",
    fontWeight: 700,
    verticalAlign: "top",
  },
  badge: {
    display: "inline-block",
    background: "#e0f2fe",
    color: "#075985",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
  },
};