import React, { useState, useEffect } from "react";
import { fetchIssues, deleteIssue } from "../api";
import "./IssueList.css";

export default function IssueList({ issues, onEdit, onRefresh, loading, error }) {
  const [statusFilter, setStatusFilter] = useState("");
  const [filteredIssues, setFilteredIssues] = useState(issues);
  const [deleteError, setDeleteError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (statusFilter) {
      setFilteredIssues(issues.filter((issue) => issue.status === statusFilter));
    } else {
      setFilteredIssues(issues);
    }
  }, [statusFilter, issues]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) {
      return;
    }

    setDeletingId(id);
    setDeleteError(null);

    try {
      await deleteIssue(id);
      onRefresh();
    } catch (err) {
      setDeleteError(err.message || "Failed to delete issue");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "#ff6b6b";
      case "in_progress":
        return "#ffd93d";
      case "closed":
        return "#51cf66";
      default:
        return "#999";
    }
  };

  const getStatusLabel = (status) => {
    return status.replace("_", " ").toUpperCase();
  };

  if (loading) {
    return <div className="loading">Loading issues...</div>;
  }

  return (
    <div className="issue-list-container">
      <div className="list-header">
        <h2>Issues</h2>
        <div className="filter-section">
          <label htmlFor="status-filter">Filter by Status:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="">All</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {deleteError && <div className="error-message">{deleteError}</div>}

      {filteredIssues.length === 0 ? (
        <div className="no-issues">
          {statusFilter ? "No issues found with this status." : "No issues yet. Create one to get started!"}
        </div>
      ) : (
        <div className="issues-grid">
          {filteredIssues.map((issue) => (
            <div key={issue.id} className="issue-card">
              <div className="issue-header">
                <h3>{issue.title}</h3>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(issue.status) }}
                >
                  {getStatusLabel(issue.status)}
                </span>
              </div>

              {issue.description && (
                <p className="issue-description">{issue.description.substring(0, 100)}...</p>
              )}

              <div className="issue-meta">
                <small>Created: {new Date(issue.created_at).toLocaleDateString()}</small>
              </div>

              <div className="issue-actions">
                <button
                  onClick={() => onEdit(issue.id)}
                  className="btn btn-primary"
                  disabled={deletingId === issue.id}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(issue.id)}
                  className="btn btn-danger"
                  disabled={deletingId === issue.id}
                >
                  {deletingId === issue.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
