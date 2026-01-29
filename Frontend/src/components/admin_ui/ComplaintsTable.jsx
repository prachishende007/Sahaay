import React, { useState } from "react";

export default function ComplaintsTable({ complaints = [] }) {
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const filteredComplaints = complaints.filter((c) => {
    return (
      (!statusFilter || c.status === statusFilter) &&
      (!priorityFilter || c.priority === priorityFilter)
    );
  });

  return (
    <div className="content-card">
      {/* HEADER */}
      <div className="reports-header">
        <h2>📋 Reports</h2>
        <p className="reports-subtitle">
          All complaints submitted by citizens
        </p>
      </div>

      {/* FILTERS */}
      <div className="filters-bar">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Assigned">Assigned</option>
          <option value="Resolved">Resolved</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">All Priority</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="reports-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Category</th>
              <th>Area / Ward</th>
              <th>Priority</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredComplaints.map((c) => (
              <tr key={c.id}>
                <td>
                  {c.createdAt
                    ? new Date(c.createdAt).toLocaleString()
                    : "—"}
                </td>

                <td>{c.category}</td>

                <td>{c.area || "Ward 12"}</td>

                <td>
                  <span
                    className={`badge priority-${(
                      c.priority || "medium"
                    ).toLowerCase()}`}
                  >
                    {c.priority || "Medium"}
                  </span>
                </td>

                <td>
                  <span
                    className={`badge status-${c.status
                      ?.toLowerCase()
                      ?.replace(" ", "-")}`}
                  >
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}

            {filteredComplaints.length === 0 && (
              <tr>
                <td colSpan="5">
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h3>No reports found</h3>
                    <p>
                      Submitted complaints will appear here once available.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
