import React, { useEffect, useMemo, useState } from "react";
import TestCurveChart from "../components/TestCurveChart";
import ProductDetailModal from "../components/ProductDetailModal";
import FilterSummaryStats from "../components/FilterSummaryStats";
import {
  filterProducts,
  formatMethodology,
  getFilterOptions,
  getProductMethodologies,
  initialFilters,
} from "../frontend/productFilters";

const API_BASE = "http://127.0.0.1:8000";

export default function ProductListingPage() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  const [curves, setCurves] = useState([]);
  const [curvesLoading, setCurvesLoading] = useState(true);
  const [curvesError, setCurvesError] = useState("");

  const [filters, setFilters] = useState(initialFilters);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch products from backend
  useEffect(() => {
    fetch(`${API_BASE}/api/bolts/products/`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => setProducts(data.results))
      .catch((err) => setProductsError(err.message))
      .finally(() => setProductsLoading(false));
  }, []);

  // Fetch all tests, then fetch curve data for each test
  useEffect(() => {
    fetch(`${API_BASE}/api/bolts/tests/`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch tests");
        return res.json();
      })
      .then(async (tests) => {
        if (!tests.length) {
          setCurves([]);
          return;
        }

        // Fetch curve data for every test in parallel
        const results = await Promise.allSettled(
          tests.map((test) =>
            fetch(`${API_BASE}/api/bolts/tests/${test.id}/curve-data/`)
              .then((res) => {
                if (!res.ok) throw new Error(`No curve data for test ${test.id}`);
                return res.json();
              })
              .then((data) => ({
                // Map to the shape TestCurveChart expects
                id: `test-${test.id}`,
                productName: test.label,
                xUnit: "mm",
                yUnit: "kN",
                points: data.displacement_mm.map((d, i) => ({
                  deformation: d,
                  load: data.load_kn[i],
                })),
              }))
          )
        );

        // Only keep successfully loaded curves
        const loaded = results
          .filter((r) => r.status === "fulfilled")
          .map((r) => r.value);

        setCurves(loaded);
      })
      .catch((err) => setCurvesError(err.message))
      .finally(() => setCurvesLoading(false));
  }, []);

  const filterOptions = useMemo(() => getFilterOptions(products), [products]);

  const filteredProducts = useMemo(
    () => filterProducts(products, filters),
    [products, filters]
  );

  const supplierCount = new Set(filteredProducts.map((p) => p.supplier)).size;
  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleClearFilters = () => setFilters(initialFilters);

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
  };

  return (
    <main style={styles.page}>
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          curves={curves}
          onClose={() => setSelectedProduct(null)}
        />
      )}
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
          <span style={styles.summaryNumber}>{products.length}</span>
          <span style={styles.summaryLabel}>Total products</span>
        </div>
      </section>

      <section style={styles.filterCard}>
        <div style={styles.filterHeader}>
          <div>
            <h2 style={styles.cardTitle}>Filter Products</h2>
            <p style={styles.cardNote}>
              Filter the product list by supplier, length, category, equipment
              compatibility, and test methodology.
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
            <select name="supplier" value={filters.supplier} onChange={handleFilterChange} style={styles.select}>
              <option value="">All suppliers</option>
              {filterOptions.suppliers.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <label style={styles.filterLabel}>
            <span style={styles.labelText}>Bolt length</span>
            <select name="length" value={filters.length} onChange={handleFilterChange} style={styles.select}>
              <option value="">All lengths</option>
              {filterOptions.lengths.map((l) => (
                <option key={l} value={l}>{l} m</option>
              ))}
            </select>
          </label>

          <label style={styles.filterLabel}>
            <span style={styles.labelText}>Category</span>
            <select name="category" value={filters.category} onChange={handleFilterChange} style={styles.select}>
              <option value="">All categories</option>
              {filterOptions.categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label style={styles.filterLabel}>
            <span style={styles.labelText}>Equipment</span>
            <select name="equipment" value={filters.equipment} onChange={handleFilterChange} style={styles.select}>
              <option value="">All equipment</option>
              {filterOptions.equipmentTypes.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </label>

          <label style={styles.filterLabel}>
            <span style={styles.labelText}>Test methodology</span>
            <select name="methodology" value={filters.methodology} onChange={handleFilterChange} style={styles.select}>
              <option value="">All methodologies</option>
              {filterOptions.methodologies.map((m) => (
                <option key={m} value={m}>{formatMethodology(m)}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {/* Summary Statistics */}
      <FilterSummaryStats filters={filters} />

      {/* Curve Chart */}
      {curvesLoading ? (
        <section style={styles.curveStatusCard}>
          Loading curve data...
        </section>
      ) : curvesError ? (
        <section style={styles.curveErrorCard}>
          Could not load curve data: {curvesError}
        </section>
      ) : (
        <TestCurveChart curves={curves} />
      )}

      <section style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Available Products</h2>
          <p style={styles.cardNote}>
            {productsLoading
              ? "Loading products..."
              : productsError
              ? `Error: ${productsError}`
              : `Showing ${filteredProducts.length} of ${products.length} products.`}
          </p>
        </div>

        {productsLoading && (
          <div style={styles.centred}>
            <p style={styles.mutedText}>Loading products...</p>
          </div>
        )}

        {!productsLoading && productsError && (
          <div style={styles.centred}>
            <p style={styles.errorText}>Error: {productsError}</p>
          </div>
        )}

        {!productsLoading && !productsError && (
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
                      <td style={styles.tdStrong}>{product.name}</td>
                      <td style={styles.td}>{product.supplier}</td>
                      <td style={styles.td}>{product.length_m} m</td>
                      <td style={styles.td}>{product.diameter_mm} mm</td>
                      <td style={styles.td}>
                        <span style={styles.badge}>
                          {product.category?.categoryName || "—"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {product.equipment?.map((e) => e.equipment_type_name).join(", ") || "—"}
                      </td>
                      <td style={styles.td}>
                        {getProductMethodologies(product)
                          .map(formatMethodology)
                          .join(", ") || "—"}
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
                      No products match the selected filters. Clear filters or try a
                      different combination.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
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
  curveStatusCard: {
    background: "#ffffff",
    border: "1px solid #dbe3ef",
    borderRadius: "18px",
    padding: "24px 28px",
    marginBottom: "24px",
    color: "#667085",
    boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
  },
  curveErrorCard: {
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    borderRadius: "18px",
    padding: "24px 28px",
    marginBottom: "24px",
    color: "#be123c",
    boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
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
  centred: {
    padding: "48px",
    textAlign: "center",
  },
  mutedText: {
    color: "#667085",
    fontSize: "15px",
  },
  errorText: {
    color: "#e53e3e",
    fontSize: "15px",
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
