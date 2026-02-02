import React, { useState, useEffect } from 'react';
import { Issue, CreateIssueRequest, UpdateIssueRequest } from '../types';
import { apiClient } from '../api';

interface IssueFormProps {
  issue?: Issue;
  onSave: (issue: Issue) => void;
  onCancel: () => void;
}

const IssueForm: React.FC<IssueFormProps> = ({ issue, onSave, onCancel }) => {
  const [title, setTitle] = useState(issue?.title || '');
  const [description, setDescription] = useState(issue?.description || '');
  const [status, setStatus] = useState<'open' | 'in_progress' | 'closed'>(
    issue?.status || 'open'
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (!title.trim()) {
      newErrors.push('Title is required');
    }
    
    if (title.length > 200) {
      newErrors.push('Title must be less than 200 characters');
    }
    
    if (description.length > 2000) {
      newErrors.push('Description must be less than 2000 characters');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      let savedIssue: Issue;

      if (issue) {
        // Update existing issue
        savedIssue = await apiClient.updateIssue(issue.id, {
          title,
          description,
          status,
        });
      } else {
        // Create new issue
        savedIssue = await apiClient.createIssue({
          title,
          description,
        });
      }

      onSave(savedIssue);
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Failed to save issue']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {issue ? 'Edit Issue' : 'Create New Issue'}
      </h2>

      {errors.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <ul className="list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter issue title"
            disabled={loading}
          />
          <div className="text-sm text-gray-500 mt-1">
            {title.length}/200 characters
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter issue description"
            disabled={loading}
          />
          <div className="text-sm text-gray-500 mt-1">
            {description.length}/2000 characters
          </div>
        </div>

        {issue && (
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'open' | 'in_progress' | 'closed')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {issue ? 'Updating...' : 'Creating...'}
              </span>
            ) : (
              issue ? 'Update Issue' : 'Create Issue'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IssueForm;
