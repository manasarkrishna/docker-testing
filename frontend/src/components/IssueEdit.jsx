import React, { useState, useEffect } from "react";
import { fetchIssueById, updateIssue } from "../api";
import "./IssueEdit.css";

export default function IssueEdit({ issueId, onClose, onRefresh }) {
  const [issue, setIssue] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("open");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadIssue = async () => {
      try {
        const data = await fetchIssueById(issueId);
        setIssue(data);
        setTitle(data.title);
        setDescription(data.description || "");
        setStatus(data.status);
        setErrors([]);
      } catch (error) {
        setErrors([error.message || "Failed to load issue"]);
      } finally {
        setLoading(false);
      }
    };

    loadIssue();
  }, [issueId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage("");
    setSaving(true);

    try {
      const updates = {};
      if (title !== issue.title) updates.title = title;
      if (description !== (issue.description || "")) updates.description = description;
      if (status !== issue.status) updates.status = status;

      if (Object.keys(updates).length === 0) {
        setSuccessMessage("No changes to save");
        setTimeout(() => onClose(), 1000);
        return;
      }

      await updateIssue(issueId, updates);
      setSuccessMessage("Issue updated successfully!");

      setTimeout(() => {
        onRefresh();
        onClose();
      }, 1000);
    } catch (error) {
      setErrors([error.message || "Failed to update issue"]);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="modal-overlay"><div className="modal-content"><div className="loading">Loading issue...</div></div></div>;
  }

  if (!issue) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="error-message">Failed to load issue</div>
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Issue #{issueId}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {successMessage && <div className="success-message">{successMessage}</div>}
        {errors.length > 0 && (
          <div className="error-box">
            {errors.map((error, idx) => (
              <div key={idx} className="error-item">
                {error}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="edit-title">Title *</label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={saving}
              maxLength="200"
              className="form-input"
            />
            <small className="char-count">{title.length}/200</small>
          </div>

          <div className="form-group">
            <label htmlFor="edit-description">Description</label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
              maxLength="2000"
              rows="6"
              className="form-textarea"
            />
            <small className="char-count">{description.length}/2000</small>
          </div>

          <div className="form-group">
            <label htmlFor="edit-status">Status</label>
            <select
              id="edit-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={saving}
              className="form-select"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
