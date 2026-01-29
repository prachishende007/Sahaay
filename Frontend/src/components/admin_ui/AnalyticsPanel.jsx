import React from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function AnalyticsPanel({ stats, complaints }) {
  // Count complaints by category (from props)
  const categories = {};
  complaints.forEach((c) => {
    categories[c.category] = (categories[c.category] || 0) + 1;
  });

  const barData = {
    labels: Object.keys(categories),
    datasets: [
      {
        label: "Complaints by Category",
        data: Object.values(categories),
        backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4CAF50", "#9C27B0"],
      },
    ],
  };

  // Use backend stats for status pie chart
  const pieData = {
    labels: ["Pending", "Resolved"],
    datasets: [
      {
        data: [stats.pending ?? 0, stats.resolved ?? 0],
        backgroundColor: ["#FF6384", "#4CAF50"],
      },
    ],
  };

  return (
    <div className="analytics">
      <h3>📊 Analytics</h3>

      {/* KPI Cards */}
      <div className="kpi-cards" style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <div style={{ padding: "0.5rem 1rem", background: "#f5f5f5", borderRadius: "8px" }}>
          Total: {stats.total ?? complaints.length}
        </div>
        <div style={{ padding: "0.5rem 1rem", background: "#ffe0e0", borderRadius: "8px" }}>
          Pending: {stats.pending ?? 0}
        </div>
        <div style={{ padding: "0.5rem 1rem", background: "#e0ffe0", borderRadius: "8px" }}>
          Resolved: {stats.resolved ?? 0}
        </div>
      </div>

      {/* Bar chart */}
      <div style={{ height: 200, marginBottom: "2rem" }}>
        <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>

      {/* Pie chart */}
      <div style={{ height: 200 }}>
        <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
    </div>
  );
}
