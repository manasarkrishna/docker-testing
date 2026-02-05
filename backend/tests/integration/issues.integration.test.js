const request = require('supertest');
const express = require('express');

// Mock issues database
let mockIssues = [
  { id: 1, title: 'Bug #1', description: 'Test bug', priority: 'high', status: 'open', userId: 1 },
  { id: 2, title: 'Feature #1', description: 'Test feature', priority: 'low', status: 'open', userId: 1 }
];

// Mock authentication
const mockAuthMiddleware = (req, res, next) => {
  req.user = { id: 1, username: 'testuser' };
  next();
};

const createIssuesApp = () => {
  const app = express();
  app.use(express.json());
  app.use(mockAuthMiddleware);

  // GET all issues
  app.get('/api/issues', (req, res) => {
    res.json(mockIssues);
  });

  // GET issue by ID
  app.get('/api/issues/:id', (req, res) => {
    const issue = mockIssues.find(i => i.id === parseInt(req.params.id));
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    res.json(issue);
  });

  // POST create issue
  app.post('/api/issues', (req, res) => {
    const { title, description, priority } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const newIssue = {
      id: mockIssues.length + 1,
      title,
      description: description || '',
      priority: priority || 'medium',
      status: 'open',
      userId: req.user.id
    };

    mockIssues.push(newIssue);
    res.status(201).json(newIssue);
  });

  // PUT update issue
  app.put('/api/issues/:id', (req, res) => {
    const issue = mockIssues.find(i => i.id === parseInt(req.params.id));
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    Object.assign(issue, req.body);
    res.json(issue);
  });

  // DELETE issue
  app.delete('/api/issues/:id', (req, res) => {
    const index = mockIssues.findIndex(i => i.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    mockIssues.splice(index, 1);
    res.json({ message: 'Issue deleted' });
  });

  return app;
};

describe('Issues API Integration Tests', () => {
  let app;

  beforeEach(() => {
    // Reset mock data
    mockIssues = [
      { id: 1, title: 'Bug #1', description: 'Test bug', priority: 'high', status: 'open', userId: 1 },
      { id: 2, title: 'Feature #1', description: 'Test feature', priority: 'low', status: 'open', userId: 1 }
    ];
    app = createIssuesApp();
  });

  describe('GET /api/issues', () => {
    test('should retrieve all issues', async () => {
      const res = await request(app)
        .get('/api/issues')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });
  });

  describe('GET /api/issues/:id', () => {
    test('should retrieve issue by ID', async () => {
      const res = await request(app)
        .get('/api/issues/1')
        .expect(200);

      expect(res.body.id).toBe(1);
      expect(res.body.title).toBe('Bug #1');
    });

    test('should return 404 for non-existent issue', async () => {
      const res = await request(app)
        .get('/api/issues/999')
        .expect(404);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/issues', () => {
    test('should create a new issue', async () => {
      const res = await request(app)
        .post('/api/issues')
        .send({
          title: 'New Issue',
          description: 'Issue description',
          priority: 'medium'
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('New Issue');
      expect(res.body.status).toBe('open');
    });

    test('should fail to create issue without title', async () => {
      const res = await request(app)
        .post('/api/issues')
        .send({
          description: 'Description without title'
        })
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });

    test('should set default priority if not provided', async () => {
      const res = await request(app)
        .post('/api/issues')
        .send({
          title: 'Issue without priority'
        })
        .expect(201);

      expect(res.body.priority).toBe('medium');
    });
  });

  describe('PUT /api/issues/:id', () => {
    test('should update an existing issue', async () => {
      const res = await request(app)
        .put('/api/issues/1')
        .send({
          title: 'Updated Title',
          status: 'closed'
        })
        .expect(200);

      expect(res.body.title).toBe('Updated Title');
      expect(res.body.status).toBe('closed');
    });

    test('should return 404 when updating non-existent issue', async () => {
      const res = await request(app)
        .put('/api/issues/999')
        .send({ title: 'Updated' })
        .expect(404);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/issues/:id', () => {
    test('should delete an issue', async () => {
      await request(app)
        .delete('/api/issues/1')
        .expect(200);

      const res = await request(app)
        .get('/api/issues')
        .expect(200);

      expect(res.body.length).toBe(1);
      expect(res.body[0].id).toBe(2);
    });

    test('should return 404 when deleting non-existent issue', async () => {
      const res = await request(app)
        .delete('/api/issues/999')
        .expect(404);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Complete CRUD workflow', () => {
    test('should handle complete issue lifecycle', async () => {
      // Create
      const createRes = await request(app)
        .post('/api/issues')
        .send({ title: 'Lifecycle Issue' })
        .expect(201);

      const issueId = createRes.body.id;

      // Read
      const readRes = await request(app)
        .get(`/api/issues/${issueId}`)
        .expect(200);

      expect(readRes.body.title).toBe('Lifecycle Issue');

      // Update
      const updateRes = await request(app)
        .put(`/api/issues/${issueId}`)
        .send({ status: 'closed' })
        .expect(200);

      expect(updateRes.body.status).toBe('closed');

      // Delete
      await request(app)
        .delete(`/api/issues/${issueId}`)
        .expect(200);

      // Verify deleted
      await request(app)
        .get(`/api/issues/${issueId}`)
        .expect(404);
    });
  });
});
