import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

import Sidebar from "./components/admin_ui/Sidebar";
import Topbar from "./components/admin_ui/Topbar";
import MapView from "./components/admin_ui/MapView";
import ComplaintsTable from "./components/admin_ui/ComplaintsTable";
import ComplaintForm from "./components/admin_ui/ComplaintForm";

/* 🔥 FIXED API BASE */
const API = "https://sahaay-backend.onrender.com";

export default function Admin_Panel() {
  /* ================= STATE ================= */
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("reports");
  const [loading, setLoading] = useState(true);

  /* ================= API CALLS ================= */
  const fetchComplaints = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/complaints/`);
      setComplaints(res.data);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/analytics/summary`);
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
      <div
        className={`overlay ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          closeSidebar={() => setSidebarOpen(false)}
        />
      </aside>

      <div className="main">
        <div className="topbar">
          <span className="hamburger" onClick={() => setSidebarOpen(true)}>
            &#9776;
          </span>
          <Topbar stats={stats} />
        </div>

        <div className="content">
          {loading && <div className="loading-state">Loading data...</div>}

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