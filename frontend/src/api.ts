import { Issue, CreateIssueRequest, UpdateIssueRequest, ApiError } from './types';

const API_BASE_URL = 'http://localhost:3001/api';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || errorData.errors?.join(', ') || 'Request failed');
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async getIssues(status?: string): Promise<Issue[]> {
    const query = status ? `?status=${status}` : '';
    return this.request<Issue[]>(`/issues${query}`);
  }

  async getIssue(id: number): Promise<Issue> {
    return this.request<Issue>(`/issues/${id}`);
  }

  async createIssue(issue: CreateIssueRequest): Promise<Issue> {
    return this.request<Issue>('/issues', {
      method: 'POST',
      body: JSON.stringify(issue),
    });
  }

  async updateIssue(id: number, issue: UpdateIssueRequest): Promise<Issue> {
    return this.request<Issue>(`/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(issue),
    });
  }
}

export const apiClient = new ApiClient();
