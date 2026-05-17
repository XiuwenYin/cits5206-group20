import React, { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const lineColours = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#9333ea",
  "#ea580c",
  "#0891b2",
];

const getInterpolatedLoad = (points, deformation) => {
  if (!points.length) {
    return null;
  }

  const exactPoint = points.find((point) => point.deformation === deformation);
  if (exactPoint) {
    return exactPoint.load;
  }

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  if (deformation < firstPoint.deformation || deformation > lastPoint.deformation) {
    return null;
  }

  for (let index = 0; index < points.length - 1; index += 1) {
    const left = points[index];
    const right = points[index + 1];

    if (deformation > left.deformation && deformation < right.deformation) {
      const position =
        (deformation - left.deformation) / (right.deformation - left.deformation);

      return left.load + position * (right.load - left.load);
    }
  }

  return null;
};

const buildChartRows = (curves) => {
  const deformationValues = Array.from(
    new Set(
      curves.flatMap((curve) =>
        curve.points.map((point) => point.deformation)
      )
    )
  ).sort((a, b) => a - b);

  return deformationValues.map((deformation) => {
    const row = { deformation };
    const averageLoads = [];

    curves.forEach((curve) => {
      const interpolatedLoad = getInterpolatedLoad(curve.points, deformation);

      row[curve.id] = interpolatedLoad;

      if (interpolatedLoad !== null) {
        averageLoads.push(interpolatedLoad);
      }
    });

    row.average =
      averageLoads.length > 0
        ? averageLoads.reduce((sum, value) => sum + value, 0) / averageLoads.length
        : null;

    return row;
  });
};

const formatNumber = (value) => {
  if (typeof value !== "number") {
    return value;
  }

  return Number.isInteger(value) ? value : value.toFixed(2);
};

export default function TestCurveChart({ curves }) {
  const chartRows = useMemo(() => buildChartRows(curves), [curves]);

  const xUnit = curves[0]?.xUnit || "mm";
  const yUnit = curves[0]?.yUnit || "load";

  if (!curves.length) {
    return (
      <section style={styles.card}>
        <h2 style={styles.title}>Test Curve Visualisation</h2>
        <p style={styles.emptyState}>
          No curve data is available for the current selection.
        </p>
      </section>
    );
  }

  return (
    <section style={styles.card}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Test Curve Visualisation</h2>
          <p style={styles.note}>
            Showing {curves.length} test curve{curves.length !== 1 ? "s" : ""} with an average curve overlay.
          </p>
        </div>

        <div style={styles.unitBadge}>
          {xUnit} / {yUnit}
        </div>
      </div>

      <div style={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={420}>
          <LineChart
            data={chartRows}
            margin={{ top: 16, right: 32, left: 16, bottom: 16 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="deformation"
              name="Deformation"
              unit={` ${xUnit}`}
              tickFormatter={formatNumber}
            />
            <YAxis
              name="Load"
              unit={` ${yUnit}`}
              tickFormatter={formatNumber}
            />
            <Tooltip
              formatter={(value, name) => [formatNumber(value), name]}
              labelFormatter={(value) => `Deformation: ${formatNumber(value)} ${xUnit}`}
            />
            <Legend />

            {curves.map((curve, index) => (
              <Line
                key={curve.id}
                type="monotone"
                dataKey={curve.id}
                name={curve.productName}
                stroke={lineColours[index % lineColours.length]}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}

            <Line
              type="monotone"
              dataKey="average"
              name="Average curve"
              stroke="#111827"
              strokeWidth={4}
              strokeDasharray="8 4"
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

const styles = {
  card: {
    background: "#ffffff",
    border: "1px solid #dbe3ef",
    borderRadius: "18px",
    boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
    padding: "24px 28px",
    marginBottom: "24px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-start",
    marginBottom: "20px",
  },
  title: {
    margin: "0 0 6px",
    fontSize: "22px",
  },
  note: {
    margin: 0,
    color: "#667085",
    fontSize: "14px",
  },
  unitBadge: {
    border: "1px solid #bfdbfe",
    background: "#eff6ff",
    color: "#1d4ed8",
    borderRadius: "999px",
    padding: "8px 12px",
    fontSize: "13px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  chartContainer: {
    width: "100%",
    height: "420px",
  },
  emptyState: {
    color: "#667085",
    margin: 0,
  },
};