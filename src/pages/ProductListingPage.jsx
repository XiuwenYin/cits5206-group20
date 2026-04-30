import React, { useMemo, useState } from "react";
import { sampleProducts } from "../frontend/sampleProducts";

const initialFilters = {
  supplier: "",
  length: "",
  category: "",
  equipment: "",
  methodology: "",
};

// Temporary helper for sample data.
// Supplier A sample data is dynamic, while Hoek sample data is static.
// Later this should come directly from the backend test records.
const getProductMethodologies = (product) => {
  if (Array.isArray(product.test_methodologies)) {
    return product.test_methodologies;
  }

  return product.supplier === "Hoek" ? ["static"] : ["dynamic"];
};

const formatMethodology = (methodology) => {
  if (!methodology) return "";
  return methodology.charAt(0).toUpperCase() + methodology.slice(1);
};

const getUniqueOptions = (items, getValue) => {
  return Array.from(new Set(items.map(getValue).filter(Boolean))).sort();
};

export default function ProductListingPage() {
  const [filters, setFilters] = useState(initialFilters);

  const filterOptions = useMemo(() => {
    const methodologies = sampleProducts.flatMap((product) =>
      getProductMethodologies(product)
    );

    return {
      suppliers: getUniqueOptions(sampleProducts, (product) => product.supplier),
      lengths: getUniqueOptions(sampleProducts, (product) => product.bolt_length),
      categories: getUniqueOptions(sampleProducts, (product) => product.bolt_category),
      equipmentTypes: getUniqueOptions(
        sampleProducts.flatMap((product) => product.equipment_compatibility),
        (equipment) => equipment
      ),
      methodologies: Array.from(new Set(methodologies)).sort(),
    };
  }, []);

  const filteredProducts = useMemo(() => {
    return sampleProducts.filter((product) => {
      const productMethodologies = getProductMethodologies(product);

      const matchesSupplier =
        !filters.supplier || product.supplier === filters.supplier;

      const matchesLength =
        !filters.length || product.bolt_length === filters.length;

      const matchesCategory =
        !filters.category || product.bolt_category === filters.category;

      const matchesEquipment =
        !filters.equipment ||
        product.equipment_compatibility.includes(filters.equipment);

      const matchesMethodology =
        !filters.methodology ||
        productMethodologies.includes(filters.methodology);

      return (
        matchesSupplier &&
        matchesLength &&
        matchesCategory &&
        matchesEquipment &&
        matchesMethodology
      );
    });
  }, [filters]);

  // Count unique suppliers from the currently displayed products.
  const supplierCount = new Set(filteredProducts.map((product) => product.supplier)).size;

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  // Placeholder action for FR1. Later features can connect this to test details or charts.
  const handleViewDetails = (product) => {
    window.alert(`Selected product: ${product.product_name}`);
  };

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
          <span style={styles.summaryNumber}>{filteredProducts.length}</span>
          <span style={styles.summaryLabel}>Products shown</span>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryNumber}>{supplierCount}</span>
          <span style={styles.summaryLabel}>Suppliers shown</span>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryNumber}>FR2</span>
          <span style={styles.summaryLabel}>Filtering UI</span>
        </div>
      </section>

      <section style={styles.filterCard}>
        <div style={styles.filterHeader}>
          <div>
            <h2 style={styles.cardTitle}>Filter Products</h2>
            <p style={styles.cardNote}>
              Filter the product list by supplier, length, category, equipment compatibility,
              and test methodology.
            </p>
          </div>

          <button
            type="button"
            style={{
              ...styles.clearButton,
              opacity: hasActiveFilters ? 1 : 0.55,
              cursor: hasActiveFilters ? "pointer" : "not-allowed",
            }}
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
          >
            Clear filters
          </button>
        </div>

        <div style={styles.filterGrid}>
          <label style={styles.filterLabel}>
            <span style={styles.labelText}>Supplier</span>
            <select
              name="supplier"
              value={filters.supplier}
              onChange={handleFilterChange}
              style={styles.select}
            >
              <option value="">All suppliers</option>
              {filterOptions.suppliers.map((supplier) => (
                <option key={supplier} value={supplier}>
                  {supplier}
                </option>
              ))}
            </select>
          </label>

          <label style={styles.filterLabel}>
            <span style={styles.labelText}>Bolt length</span>
            <select
              name="length"
              value={filters.length}
              onChange={handleFilterChange}
              style={styles.select}
            >
              <option value="">All lengths</option>
              {filterOptions.lengths.map((length) => (
                <option key={length} value={length}>
                  {length} m
                </option>
              ))}
            </select>
          </label>

          <label style={styles.filterLabel}>
            <span style={styles.labelText}>Category</span>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              style={styles.select}
            >
              <option value="">All categories</option>
              {filterOptions.categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label style={styles.filterLabel}>
            <span style={styles.labelText}>Equipment</span>
            <select
              name="equipment"
              value={filters.equipment}
              onChange={handleFilterChange}
              style={styles.select}
            >
              <option value="">All equipment</option>
              {filterOptions.equipmentTypes.map((equipment) => (
                <option key={equipment} value={equipment}>
                  {equipment}
                </option>
              ))}
            </select>
          </label>

          <label style={styles.filterLabel}>
            <span style={styles.labelText}>Test methodology</span>
            <select
              name="methodology"
              value={filters.methodology}
              onChange={handleFilterChange}
              style={styles.select}
            >
              <option value="">All methodologies</option>
              {filterOptions.methodologies.map((methodology) => (
                <option key={methodology} value={methodology}>
                  {formatMethodology(methodology)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Available Products</h2>
          <p style={styles.cardNote}>
            Showing {filteredProducts.length} of {sampleProducts.length} client-sample products.
            Backend API integration will be connected once the endpoint is ready.
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
                <th style={styles.th}>Methodology</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
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
                    <td style={styles.td}>
                      {getProductMethodologies(product)
                        .map(formatMethodology)
                        .join(", ")}
                    </td>
                    <td style={styles.td}>
                      <button
                        type="button"
                        style={styles.actionButton}
                        onClick={() => handleViewDetails(product)}
                      >
                        View details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td style={styles.emptyState} colSpan="8">
                    No products match the selected filters. Clear filters or try a different
                    combination.
                  </td>
                </tr>
              )}
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
  filterCard: {
    background: "#ffffff",
    border: "1px solid #dbe3ef",
    borderRadius: "18px",
    boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
    padding: "24px 28px",
    marginBottom: "24px",
  },
  filterHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-start",
    marginBottom: "18px",
  },
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: "14px",
  },
  filterLabel: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  labelText: {
    color: "#344054",
    fontSize: "13px",
    fontWeight: 700,
  },
  select: {
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    padding: "10px 12px",
    background: "#ffffff",
    color: "#172033",
    fontSize: "14px",
  },
  clearButton: {
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    color: "#344054",
    borderRadius: "10px",
    padding: "10px 14px",
    fontWeight: 700,
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
  actionButton: {
    border: "1px solid #bfdbfe",
    background: "#eff6ff",
    color: "#1d4ed8",
    borderRadius: "10px",
    padding: "8px 12px",
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  emptyState: {
    padding: "28px",
    textAlign: "center",
    color: "#667085",
    borderBottom: "1px solid #eef2f7",
  },
};