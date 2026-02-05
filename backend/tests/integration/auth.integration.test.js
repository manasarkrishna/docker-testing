const request = require('supertest');
const express = require('express');

// Mock authentication middleware
const mockAuthMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token === 'valid-token') {
    req.user = { id: 1, username: 'testuser' };
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Mock routes setup
const createAuthApp = () => {
  const app = express();
  app.use(express.json());

  // Auth endpoints
  app.post('/api/auth/register', (req, res) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    res.status(201).json({ 
      id: 1, 
      username, 
      email,
      token: 'valid-token'
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    res.status(200).json({ 
      id: 1, 
      username,
      token: 'valid-token'
    });
  });

  return app;
};

describe('Authentication Flow Integration Tests', () => {
  let app;

  beforeEach(() => {
    app = createAuthApp();
  });

  test('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123'
      })
      .expect(201);

    expect(res.body).toHaveProperty('token');
    expect(res.body.username).toBe('newuser');
    expect(res.body.email).toBe('new@example.com');
  });

  test('should fail registration with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'newuser'
        // missing email and password
      })
      .expect(400);

    expect(res.body).toHaveProperty('error');
  });

  test('should login user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'password123'
      })
      .expect(200);

    expect(res.body).toHaveProperty('token');
    expect(res.body.username).toBe('testuser');
  });

  test('should fail login with missing credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser'
        // missing password
      })
      .expect(400);

    expect(res.body).toHaveProperty('error');
  });
});

describe('Protected Routes with Authentication', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    app.get('/api/protected', mockAuthMiddleware, (req, res) => {
      res.json({ message: 'Protected data', user: req.user });
    });
  });

  test('should access protected route with valid token', async () => {
    const res = await request(app)
      .get('/api/protected')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);

    expect(res.body.user.username).toBe('testuser');
  });

  test('should deny access without token', async () => {
    const res = await request(app)
      .get('/api/protected')
      .expect(401);

    expect(res.body).toHaveProperty('error');
  });

  test('should deny access with invalid token', async () => {
    const res = await request(app)
      .get('/api/protected')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    expect(res.body).toHaveProperty('error');
  });
});
