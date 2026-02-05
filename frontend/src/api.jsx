// API configuration and helper functions for backend communication
const API_BASE_URL = "http://localhost:5000/api";

// Helper to get auth token
const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Helper to set auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Authentication APIs
export const register = async (username, email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Registration failed");
    }

    const data = await response.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  } catch (error) {
    throw new Error(error.message || "Network error during registration");
  }
};

export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Login failed");
    }

    const data = await response.json();
    console.log("Login response:", data); // Debug log
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user || { username }));
      console.log("Token saved to localStorage"); // Debug log
    } else {
      console.warn("No token in login response"); // Debug log
    }
    return data;
  } catch (error) {
    throw new Error(error.message || "Network error during login");
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Fetch all issues with optional status filter
export const fetchIssues = async (status = null) => {
  try {
    const url = new URL(`${API_BASE_URL}/issues`);
    if (status) {
      url.searchParams.append("status", status);
    }

    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch issues");
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Network error while fetching issues");
  }
};

// Fetch a single issue by ID
export const fetchIssueById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch issue");
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Network error while fetching issue");
  }
};

// Create a new issue
export const createIssue = async (title, description = "") => {
  try {
    const token = getAuthToken();
    console.log("Creating issue with token:", token ? "EXISTS" : "MISSING"); // Debug
    
    const response = await fetch(`${API_BASE_URL}/issues`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, description }),
    });

    console.log("Create issue response status:", response.status); // Debug

    if (!response.ok) {
      let errorMessage = "Failed to create issue";
      try {
        const errorData = await response.json();
        console.log("Error data:", errorData); // Debug
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.join(", ");
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        console.log("Could not parse error response"); // Debug
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error("Create issue error:", error.message); // Debug
    throw new Error(error.message || "Network error while creating issue");
  }
};

// Update an issue
export const updateIssue = async (id, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.errors
        ? errorData.errors.join(", ")
        : errorData.error || "Failed to update issue";
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Network error while updating issue");
  }
};

// Delete an issue
export const deleteIssue = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete issue");
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Network error while deleting issue");
  }
};
