import React, { useState } from 'react';
import { Issue } from './types';
import { apiClient } from './api';
import IssueList from './components/IssueList';
import IssueForm from './components/IssueForm';
import IssueDetail from './components/IssueDetail';
import './App.css';

type View = 'list' | 'form' | 'detail';

function App() {
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedIssue, setSelectedIssue] = useState<Issue | undefined>();

  const handleSelectIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setCurrentView('detail');
  };

  const handleCreateNew = () => {
    setSelectedIssue(undefined);
    setCurrentView('form');
  };

  const handleEditIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setCurrentView('form');
  };

  const handleSaveIssue = (issue: Issue) => {
    setSelectedIssue(undefined);
    setCurrentView('list');
  };

  const handleDeleteIssue = async (issue: Issue) => {
    try {
      // Note: The API doesn't have a delete endpoint, so we'll just go back to list
      // In a real implementation, you would add a DELETE endpoint to the backend
      setCurrentView('list');
      setSelectedIssue(undefined);
    } catch (error) {
      console.error('Failed to delete issue:', error);
    }
  };

  const handleBack = () => {
    setCurrentView('list');
    setSelectedIssue(undefined);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'list':
        return (
          <IssueList
            onSelectIssue={handleSelectIssue}
            onCreateNew={handleCreateNew}
          />
        );
      case 'form':
        return (
          <IssueForm
            issue={selectedIssue}
            onSave={handleSaveIssue}
            onCancel={handleBack}
          />
        );
      case 'detail':
        return selectedIssue ? (
          <IssueDetail
            issue={selectedIssue}
            onEdit={handleEditIssue}
            onDelete={handleDeleteIssue}
            onBack={handleBack}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 text-center">
            Issue Tracker
          </h1>
          <p className="text-center text-gray-600 mt-2">
            Manage your project issues efficiently
          </p>
        </header>
        
        <main>
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}

export default App;
