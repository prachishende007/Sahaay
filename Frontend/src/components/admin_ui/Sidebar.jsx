import React from "react";

export default function Sidebar({
  setActivePage,
  activePage,
  closeSidebar,
  logout,
}) {
  const goTo = (page) => {
    setActivePage(page);
    if (closeSidebar) closeSidebar();
  };

  return (
    <aside className="sidebar">
      {/* BRAND */}
      <div className="sidebar-brand">
        <h2>SAHAAY</h2>
        <span className="sidebar-subtitle">Admin Dashboard</span>
      </div>

      {/* NAVIGATION */}
      <nav className="sidebar-nav">
        <button
          className={activePage === "reports" ? "active" : ""}
          onClick={() => goTo("reports")}
        >
          <span className="icon">📋</span>
          <span>Reports</span>
        </button>

        <button
          className={activePage === "map" ? "active" : ""}
          onClick={() => goTo("map")}
        >
          <span className="icon">🗺️</span>
          <span>Map View</span>
        </button>

        <button
          className={activePage === "file" ? "active" : ""}
          onClick={() => goTo("file")}
        >
          
        </button>

        <hr />

        <button className="logout-btn" onClick={logout}>
          <span className="icon">🚪</span>
          <span>Logout</span>
        </button>
      </nav>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <span>© {new Date().getFullYear()} SAHAAY</span>
      </div>
    </aside>
  );
}
