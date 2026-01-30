import React from "react";

export default function Topbar({ stats = {} }) {
  return (
    <header className="topbar">
      {/* LEFT: SEARCH */}
      <div className="search">
        <input
          type="text"
          placeholder="Search complaints..."
          className="search-input"
        />
      </div>

      {/* CENTER: STATS */}
      <div className="stats-bar">
        <div className="stat-card">
          <div className="stat-title">TOTAL</div>
          <div className="stat-value stat-total">
            {stats.total ?? 0}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title">PENDING</div>
          <div className="stat-value stat-pending">
            {stats.pending ?? 0}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title">RESOLVED</div>
          <div className="stat-value stat-resolved">
            {stats.resolved ?? 0}
          </div>
        </div>
      </div>

      {/* RIGHT: PROFILE */}
      <div className="profile">
        <span className="profile-name">Admin</span>
        <span className="profile-caret">▾</span>
      </div>
    </header>
  );
}
