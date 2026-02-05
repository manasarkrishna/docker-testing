import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock API
const mockIssuesApi = {
  getIssues: vi.fn(),
  createIssue: vi.fn(),
  updateIssue: vi.fn(),
  deleteIssue: vi.fn()
};

// Issues List Component
const IssuesList = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');

  const loadIssues = async () => {
    setLoading(true);
    try {
      const data = await mockIssuesApi.getIssues();
      setIssues(data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    try {
      const newIssue = await mockIssuesApi.createIssue({ title, priority });
      setIssues([...issues, newIssue]);
      setTitle('');
      setPriority('medium');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteIssue = async (id) => {
    try {
      await mockIssuesApi.deleteIssue(id);
      setIssues(issues.filter(i => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Issues</h1>

      <form onSubmit={handleCreateIssue}>
        <input
          type="text"
          placeholder="Issue title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          data-testid="issue-title-input"
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)} data-testid="priority-select">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button type="submit" data-testid="create-issue-button">Create Issue</button>
      </form>

      <button onClick={loadIssues} data-testid="load-issues-button">Load Issues</button>

      {loading && <p>Loading...</p>}

      <ul data-testid="issues-list">
        {issues.map(issue => (
          <li key={issue.id} data-testid={`issue-${issue.id}`}>
            <span>{issue.title}</span>
            <span className={`priority-${issue.priority}`}>({issue.priority})</span>
            <button 
              onClick={() => handleDeleteIssue(issue.id)}
              data-testid={`delete-issue-${issue.id}`}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

describe('Issues Management Integration Tests', () => {
  beforeEach(() => {
    mockIssuesApi.getIssues.mockClear();
    mockIssuesApi.createIssue.mockClear();
    mockIssuesApi.updateIssue.mockClear();
    mockIssuesApi.deleteIssue.mockClear();
  });

  describe('Load Issues Flow', () => {
    it('should load and display issues', async () => {
      const user = userEvent.setup();
      mockIssuesApi.getIssues.mockResolvedValue([
        { id: 1, title: 'Bug #1', priority: 'high' },
        { id: 2, title: 'Feature #1', priority: 'low' }
      ]);

      render(<IssuesList />);

      await user.click(screen.getByTestId('load-issues-button'));

      await waitFor(() => {
        expect(screen.getByTestId('issue-1')).toBeInTheDocument();
        expect(screen.getByTestId('issue-2')).toBeInTheDocument();
      });

      expect(screen.getByText('Bug #1')).toBeInTheDocument();
      expect(screen.getByText('Feature #1')).toBeInTheDocument();
    });

    it('should show loading state while fetching', async () => {
      const user = userEvent.setup();
      mockIssuesApi.getIssues.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve([]), 100))
      );

      render(<IssuesList />);

      const loadButton = screen.getByTestId('load-issues-button');
      await user.click(loadButton);

      // Should show loading text briefly
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Create Issue Flow', () => {
    it('should create new issue and add to list', async () => {
      const user = userEvent.setup();
      mockIssuesApi.createIssue.mockResolvedValue({
        id: 1,
        title: 'New Issue',
        priority: 'high'
      });

      render(<IssuesList />);

      // Fill form
      await user.type(screen.getByTestId('issue-title-input'), 'New Issue');
      await user.selectOptions(screen.getByTestId('priority-select'), 'high');

      // Submit
      await user.click(screen.getByTestId('create-issue-button'));

      // Wait for issue to appear
      await waitFor(() => {
        expect(screen.getByText('New Issue')).toBeInTheDocument();
      });

      expect(mockIssuesApi.createIssue).toHaveBeenCalledWith({
        title: 'New Issue',
        priority: 'high'
      });
    });

    it('should reset form after creating issue', async () => {
      const user = userEvent.setup();
      mockIssuesApi.createIssue.mockResolvedValue({
        id: 1,
        title: 'Test Issue',
        priority: 'medium'
      });

      render(<IssuesList />);

      const titleInput = screen.getByTestId('issue-title-input');
      const prioritySelect = screen.getByTestId('priority-select');

      // Create issue
      await user.type(titleInput, 'Test Issue');
      await user.selectOptions(prioritySelect, 'medium');
      await user.click(screen.getByTestId('create-issue-button'));

      // Wait and check form is reset
      await waitFor(() => {
        expect(titleInput).toHaveValue('');
        expect(prioritySelect).toHaveValue('medium');
      });
    });
  });

  describe('Delete Issue Flow', () => {
    it('should delete issue from list', async () => {
      const user = userEvent.setup();
      mockIssuesApi.getIssues.mockResolvedValue([
        { id: 1, title: 'Bug #1', priority: 'high' },
        { id: 2, title: 'Feature #1', priority: 'low' }
      ]);
      mockIssuesApi.deleteIssue.mockResolvedValue({});

      render(<IssuesList />);

      // Load issues
      await user.click(screen.getByTestId('load-issues-button'));

      await waitFor(() => {
        expect(screen.getByTestId('issue-1')).toBeInTheDocument();
      });

      // Delete first issue
      await user.click(screen.getByTestId('delete-issue-1'));

      // Should be removed
      await waitFor(() => {
        expect(screen.queryByTestId('issue-1')).not.toBeInTheDocument();
      });

      expect(mockIssuesApi.deleteIssue).toHaveBeenCalledWith(1);
    });
  });

  describe('Complete CRUD Workflow', () => {
    it('should handle complete issue lifecycle', async () => {
      const user = userEvent.setup();
      mockIssuesApi.createIssue.mockResolvedValue({
        id: 1,
        title: 'Test Issue',
        priority: 'high'
      });
      mockIssuesApi.deleteIssue.mockResolvedValue({});

      render(<IssuesList />);

      // Create issue
      await user.type(screen.getByTestId('issue-title-input'), 'Test Issue');
      await user.selectOptions(screen.getByTestId('priority-select'), 'high');
      await user.click(screen.getByTestId('create-issue-button'));

      // Verify created
      await waitFor(() => {
        expect(screen.getByText('Test Issue')).toBeInTheDocument();
      });

      // Delete issue
      await user.click(screen.getByTestId('delete-issue-1'));

      // Verify deleted
      await waitFor(() => {
        expect(screen.queryByText('Test Issue')).not.toBeInTheDocument();
      });
    });
  });

  describe('Priority Management', () => {
    it('should respect priority selection', async () => {
      const user = userEvent.setup();
      mockIssuesApi.createIssue.mockResolvedValue({
        id: 1,
        title: 'High Priority Issue',
        priority: 'high'
      });

      render(<IssuesList />);

      await user.type(screen.getByTestId('issue-title-input'), 'High Priority Issue');
      await user.selectOptions(screen.getByTestId('priority-select'), 'high');
      await user.click(screen.getByTestId('create-issue-button'));

      expect(mockIssuesApi.createIssue).toHaveBeenCalledWith({
        title: 'High Priority Issue',
        priority: 'high'
      });
    });

    it('should default to medium priority', () => {
      render(<IssuesList />);
      const prioritySelect = screen.getByTestId('priority-select');
      expect(prioritySelect).toHaveValue('medium');
    });
  });
});
