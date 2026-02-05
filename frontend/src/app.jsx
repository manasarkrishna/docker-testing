import React, { useState, useEffect } from "react";
import IssueList from "./components/IssueList";
import IssueForm from "./components/IssueForm";
import IssueEdit from "./components/IssueEdit";
import Login from "./components/Login";
import Register from "./components/Register";
import { fetchIssues, getCurrentUser, logout, isAuthenticated } from "./api";
import "./App.css";

export default function App() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingIssueId, setEditingIssueId] = useState(null);
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    if (isAuthenticated()) {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      loadIssues();
    } else {
      setLoading(false);
    }
  }, []);

  const loadIssues = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIssues();
      setIssues(data);
    } catch (err) {
      setError(err.message || "Failed to load issues");
      // If authentication error, log out
      if (err.message.includes("Authentication") || err.message.includes("token")) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    loadIssues();
  };

  const handleRegister = (userData) => {
    setUser(userData);
    loadIssues();
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setIssues([]);
    setShowForm(false);
    setEditingIssueId(null);
  };

  const handleIssueCreated = () => {
    setShowForm(false);
    loadIssues();
  };

  const handleEditIssue = (id) => {
    setEditingIssueId(id);
  };

  const handleCloseEdit = () => {
    setEditingIssueId(null);
  };

  const handleRefresh = () => {
    loadIssues();
  };

  // If not authenticated, show login/register
  if (!user) {
    return showRegister ? (
      <Register
        onRegister={handleRegister}
        onSwitchToLogin={() => setShowRegister(false)}
      />
    ) : (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>📋 Issue Tracker</h1>
            <p className="subtitle">Manage your project issues efficiently</p>
          </div>
          <div className="user-info">
            <span className="welcome-text">👤 {user.username}</span>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {!showForm && !editingIssueId && (
          <div className="button-bar">
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary btn-lg"
            >
              + New Issue
            </button>
            <button
              onClick={loadIssues}
              className="btn btn-secondary btn-sm"
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        )}

        {showForm && (
          <IssueForm
            onIssueCreated={handleIssueCreated}
            onCancel={() => setShowForm(false)}
          />
        )}

        {editingIssueId && (
          <IssueEdit
            issueId={editingIssueId}
            onClose={handleCloseEdit}
            onRefresh={handleRefresh}
          />
        )}

        {!showForm && !editingIssueId && (
          <IssueList
            issues={issues}
            onEdit={handleEditIssue}
            onRefresh={handleRefresh}
            loading={loading}
            error={error}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>© 2026 Issue Tracker - Built with React & Node.js</p>
      </footer>
    </div>
  );
}
