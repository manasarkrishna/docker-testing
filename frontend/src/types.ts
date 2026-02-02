export interface Issue {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface CreateIssueRequest {
  title: string;
  description: string;
}

export interface UpdateIssueRequest {
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
}

export interface ApiError {
  error: string;
  errors?: string[];
}
