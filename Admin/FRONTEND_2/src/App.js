import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import MapView from "./components/MapView";
import ComplaintsTable from "./components/ComplaintsTable";
import ComplaintForm from "./components/ComplaintForm";

const API = "http://localhost:8000";

export default function App() {
  /* ================= STATE ================= */
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("reports");
  const [loading, setLoading] = useState(true);

  /* ================= API CALLS ================= */
  const fetchComplaints = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/complaints`);
      setComplaints(res.data);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/analytics`);
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchComplaints(), fetchStats()]);
    setLoading(false);
  }, [fetchComplaints, fetchStats]);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 15000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  /* ================= AFTER COMPLAINT SUBMIT ================= */
  const addNewComplaint = (newComplaint) => {
    if (newComplaint) {
      setComplaints((prev) => [newComplaint, ...prev]);
    }
    setActivePage("reports");
  };

  /* ================= UI ================= */
  return (
    <div className="app">
      {/* MOBILE OVERLAY */}
      <div
        className={`overlay ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          closeSidebar={() => setSidebarOpen(false)}
        />
      </aside>

      {/* MAIN */}
      <div className="main">
        {/* TOPBAR */}
        <div className="topbar">
          <span
            className="hamburger"
            onClick={() => setSidebarOpen(true)}
          >
            &#9776;
          </span>
          <Topbar stats={stats} />
        </div>

        {/* CONTENT */}
        <div className="content">
          {loading && (
            <div className="loading-state">Loading data...</div>
          )}

          {!loading && activePage === "reports" && (
            <div className="page-section">
              <ComplaintsTable complaints={complaints} />
            </div>
          )}

          {!loading && activePage === "map" && (
            <div className="page-section">
              <MapView complaints={complaints} />
            </div>
          )}

          {!loading && activePage === "file" && (
            <div className="page-section">
              <ComplaintForm refreshComplaints={addNewComplaint} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
