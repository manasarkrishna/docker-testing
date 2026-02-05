import React, { useState } from "react";
import { createIssue } from "../api";
import "./IssueForm.css";

export default function IssueForm({ onIssueCreated, onCancel }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage("");
    setLoading(true);

    try {
      const newIssue = await createIssue(title, description);
      setSuccessMessage("Issue created successfully!");
      setTitle("");
      setDescription("");

      // Show success message for 2 seconds then refresh
      setTimeout(() => {
        onIssueCreated();
      }, 1000);
    } catch (error) {
      console.error("Create issue error:", error); // Debug log
      setErrors([error.message || "Failed to create issue"]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="issue-form-container">
      <div className="form-box">
        <h2>Create New Issue</h2>

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
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter issue title"
              maxLength="200"
              disabled={loading}
              className="form-input"
            />
            <small className="char-count">{title.length}/200</small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter issue description (optional)"
              maxLength="2000"
              rows="6"
              disabled={loading}
              className="form-textarea"
            />
            <small className="char-count">{description.length}/2000</small>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading || !title.trim()}>
              {loading ? "Creating..." : "Create Issue"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
