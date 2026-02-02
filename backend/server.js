const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Validation helper functions
const validateIssue = (issue) => {
    const errors = [];
    
    if (!issue.title || issue.title.trim().length === 0) {
        errors.push('Title is required and cannot be empty');
    }
    
    if (issue.title && issue.title.length > 200) {
        errors.push('Title must be less than 200 characters');
    }
    
    if (issue.description && issue.description.length > 2000) {
        errors.push('Description must be less than 2000 characters');
    }
    
    if (issue.status && !['open', 'in_progress', 'closed'].includes(issue.status)) {
        errors.push('Status must be one of: open, in_progress, closed');
    }
    
    return errors;
};

// Routes

// GET /api/issues - Get all issues (with optional status filter)
app.get('/api/issues', (req, res) => {
    const { status } = req.query;
    let query = 'SELECT * FROM issues ORDER BY created_at DESC';
    let params = [];
    
    if (status) {
        query = 'SELECT * FROM issues WHERE status = ? ORDER BY created_at DESC';
        params = [status];
    }
    
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Error fetching issues:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(rows);
    });
});

// GET /api/issues/:id - Get single issue
app.get('/api/issues/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM issues WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error('Error fetching issue:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        if (!row) {
            return res.status(404).json({ error: 'Issue not found' });
        }
        
        res.json(row);
    });
});

// POST /api/issues - Create new issue
app.post('/api/issues', (req, res) => {
    const { title, description } = req.body;
    
    // Validation
    const validationErrors = validateIssue({ title, description, status: 'open' });
    if (validationErrors.length > 0) {
        return res.status(400).json({ errors: validationErrors });
    }
    
    const query = `
        INSERT INTO issues (title, description, status)
        VALUES (?, ?, 'open')
    `;
    
    db.run(query, [title, description], function(err) {
        if (err) {
            console.error('Error creating issue:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        // Return the created issue
        db.get('SELECT * FROM issues WHERE id = ?', [this.lastID], (err, row) => {
            if (err) {
                console.error('Error fetching created issue:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.status(201).json(row);
        });
    });
});

// PUT /api/issues/:id - Update issue
app.put('/api/issues/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, status } = req.body;
    
    // Validation
    const validationErrors = validateIssue({ title, description, status });
    if (validationErrors.length > 0) {
        return res.status(400).json({ errors: validationErrors });
    }
    
    // First check if issue exists
    db.get('SELECT * FROM issues WHERE id = ?', [id], (err, existingIssue) => {
        if (err) {
            console.error('Error checking issue:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        if (!existingIssue) {
            return res.status(404).json({ error: 'Issue not found' });
        }
        
        const query = `
            UPDATE issues 
            SET title = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        db.run(query, [title, description, status, id], function(err) {
            if (err) {
                console.error('Error updating issue:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            
            // Return the updated issue
            db.get('SELECT * FROM issues WHERE id = ?', [id], (err, row) => {
                if (err) {
                    console.error('Error fetching updated issue:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                res.json(row);
            });
        });
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
