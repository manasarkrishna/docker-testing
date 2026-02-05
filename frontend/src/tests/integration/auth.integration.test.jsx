import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock API
const mockApi = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn()
};

// Complete Login/Register Flow Component
const AuthFlow = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const result = await mockApi.login({ username, password });
        setUser(result);
      } else {
        const result = await mockApi.register({ username, email, password });
        setUser(result);
      }
      // Reset form
      setUsername('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div>
        <h1>Welcome, {user.username}</h1>
        <button onClick={() => {
          setUser(null);
          mockApi.logout();
        }}>Logout</button>
      </div>
    );
  }

  return (
    <div>
      <h1>{isLogin ? 'Login' : 'Register'}</h1>
      {error && <p data-testid="error-message">{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          data-testid="username-input"
        />
        
        {!isLogin && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="email-input"
          />
        )}
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          data-testid="password-input"
        />
        
        <button type="submit" disabled={loading} data-testid="submit-button">
          {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
        </button>
      </form>

      <button onClick={() => setIsLogin(!isLogin)} data-testid="toggle-button">
        {isLogin ? 'Need to register?' : 'Already have an account?'}
      </button>
    </div>
  );
};

describe('Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    mockApi.login.mockClear();
    mockApi.register.mockClear();
    mockApi.logout.mockClear();
  });

  describe('Login Flow', () => {
    it('should complete login flow successfully', async () => {
      const user = userEvent.setup();
      mockApi.login.mockResolvedValue({ username: 'testuser', id: 1 });

      render(<AuthFlow />);

      // Enter credentials
      await user.type(screen.getByTestId('username-input'), 'testuser');
      await user.type(screen.getByTestId('password-input'), 'password123');

      // Submit
      await user.click(screen.getByTestId('submit-button'));

      // Wait for success
      await waitFor(() => {
        expect(screen.getByText('Welcome, testuser')).toBeInTheDocument();
      });

      expect(mockApi.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      });
    });

    it('should display error on login failure', async () => {
      const user = userEvent.setup();
      mockApi.login.mockRejectedValue(new Error('Invalid credentials'));

      render(<AuthFlow />);

      await user.type(screen.getByTestId('username-input'), 'testuser');
      await user.type(screen.getByTestId('password-input'), 'wrongpass');
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
    });

    it('should disable submit button while loading', async () => {
      const user = userEvent.setup();
      mockApi.login.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ username: 'testuser' }), 100))
      );

      render(<AuthFlow />);

      await user.type(screen.getByTestId('username-input'), 'testuser');
      await user.type(screen.getByTestId('password-input'), 'password123');
      
      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
    });
  });

  describe('Register Flow', () => {
    it('should switch to register mode and submit', async () => {
      const user = userEvent.setup();
      mockApi.register.mockResolvedValue({ username: 'newuser', id: 2 });

      render(<AuthFlow />);

      // Switch to register
      await user.click(screen.getByTestId('toggle-button'));

      // Now email field should be visible
      expect(screen.getByTestId('email-input')).toBeInTheDocument();

      // Fill form
      await user.type(screen.getByTestId('username-input'), 'newuser');
      await user.type(screen.getByTestId('email-input'), 'new@example.com');
      await user.type(screen.getByTestId('password-input'), 'password123');

      // Submit
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(screen.getByText('Welcome, newuser')).toBeInTheDocument();
      });

      expect(mockApi.register).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123'
      });
    });
  });

  describe('Logout Flow', () => {
    it('should logout and return to login form', async () => {
      const user = userEvent.setup();
      mockApi.login.mockResolvedValue({ username: 'testuser', id: 1 });

      render(<AuthFlow />);

      // Login
      await user.type(screen.getByTestId('username-input'), 'testuser');
      await user.type(screen.getByTestId('password-input'), 'password123');
      await user.click(screen.getByTestId('submit-button'));

      // Wait for welcome message
      await waitFor(() => {
        expect(screen.getByText('Welcome, testuser')).toBeInTheDocument();
      });

      // Logout
      const logoutButton = screen.getByText('Logout');
      await user.click(logoutButton);

      // Should be back at login form
      await waitFor(() => {
        expect(screen.getByTestId('username-input')).toBeInTheDocument();
      });

      expect(mockApi.logout).toHaveBeenCalled();
    });
  });

  describe('Toggle Between Login and Register', () => {
    it('should toggle between login and register modes', async () => {
      const user = userEvent.setup();
      render(<AuthFlow />);

      // Initially in login mode
      expect(screen.queryByTestId('email-input')).not.toBeInTheDocument();

      // Toggle to register
      await user.click(screen.getByTestId('toggle-button'));
      expect(screen.getByTestId('email-input')).toBeInTheDocument();

      // Toggle back to login
      await user.click(screen.getByTestId('toggle-button'));
      expect(screen.queryByTestId('email-input')).not.toBeInTheDocument();
    });
  });
});
