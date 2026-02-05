const request = require('supertest');
const express = require('express');

// Mock server setup for testing
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Test route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
  });

  return app;
};

describe('Health Check Endpoint', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  test('should return health status', async () => {
    const res = await request(app)
      .get('/api/health')
      .expect(200);

    expect(res.body).toEqual({
      status: 'OK',
      message: 'Server is running'
    });
  });

  test('should return correct content type', async () => {
    const res = await request(app)
      .get('/api/health')
      .expect('Content-Type', /json/);

    expect(res.status).toBe(200);
  });
});

describe('Server Error Handling', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  test('should return 404 for unknown routes', async () => {
    const res = await request(app)
      .get('/api/unknown')
      .expect(404);

    expect(res.status).toBe(404);
  });
});
