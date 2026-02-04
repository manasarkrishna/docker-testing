Issue Tracker - Full Stack Web Application

A modern, functional full-stack issue tracking web application built with React, Node.js/Express, and SQLite.

 Features

- Create Issues - Add new issues with title and description
- View Issues - Display all issues with status badges
- Edit Issues - Update title, description, and status
- Delete Issues - Remove issues from the system
- Filter by Status - Filter issues by open, in_progress, or closed
- Input Validation - Client-side and server-side validation
- Error Handling - Comprehensive error messages and feedback
- Responsive Design - Works on desktop, tablet, and mobile devices
- Loading States- Visual feedback during API operations

 Technical Stack

Backend
- Framework: Express.js (Node.js)
- Database: SQLite3
- Language: JavaScript (ES6+)
- Port: 5000

Frontend
- Framework: React 18.2
- Build Tool: Vite
- Styling: CSS3
- Port: 5173

Getting Started

 Prerequisites
- Node.js (v14 or higher)
- npm or yarn

Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd issue-tracker
   ```

2. Install Backend Dependencies
   ```bash
   cd backend
   npm install
   ```

3. Install Frontend Dependencies
   ```bash
   cd ../frontend
   npm install
   ```
Running the Application

Option 1: Run Both Services in Separate Terminals

Terminal 1 - Backend Server:
```bash
cd backend
npm start
# Server will run on http://localhost:5000
```

**Terminal 2 - Frontend Development Server:**
```bash
cd frontend
npm run dev
# Frontend will run on http://localhost:5173
```

Option 2: Using the Provided Start Scripts (Windows)

For Windows:
```bash
# From the root directory
npm run start:all  # Requires appropriate shell setup
```
API Endpoints

 GET /api/issues
Retrieve all issues with optional filtering
- Query Parameters: `status` (optional: open, in_progress, closed)
- Example: `GET /api/issues?status=open`
- Response: Array of issue objects

GET /api/issues/:id
Retrieve a specific issue
- Parameters: `id` (issue ID)
-Response: Single issue object or 404 error

 POST /api/issues
Create a new issue
- Body:
  ```json
  {
    "title": "Issue title (required, 3-200 chars)",
    "description": "Issue description (optional, max 2000 chars)"
  }
  ```
- Response: Created issue object with status 201

PUT /api/issues/:id
Update an existing issue
- Parameters: `id` (issue ID)
- Body: Any combination of:
  ```json
  {
    "title": "Updated title",
    "description": "Updated description",
    "status": "open|in_progress|closed"
  }
  ```
- Response: Updated issue object

DELETE /api/issues/:id
Delete an issue
- Parameters: `id` (issue ID)
- Response: Success message or 404 error

 Database Schema

 Issues Table
```sql
CREATE TABLE issues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK(status IN ('open','in_progress','closed')) DEFAULT 'open',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```
Validation Rules

Title
- Required field
- Minimum 3 characters
- Maximum 200 characters
- Cannot be empty or whitespace only

 Description
- Optional field
- Maximum 2000 characters

Status
- Must be one of: `open`, `in_progress`, `closed`
- Defaults to `open` for new issues

 Project Structure

```
issue-tracker/
├── backend/
│   ├── db.js              # Database initialization and schema
│   ├── server.js          # Express server setup
│   ├── routes/
│   │   └── issues.js      # Issue API endpoints and validation
│   ├── package.json
│   └── issues.db          # SQLite database (auto-created)
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx       # React entry point
│   │   ├── app.jsx        # Main App component
│   │   ├── api.jsx        # API client functions
│   │   ├── App.css        # Global styles
│   │   ├── index.css      # Base styles
│   │   └── components/
│   │       ├── IssueList.jsx      # Issue list view
│   │       ├── IssueList.css      # List component styles
│   │       ├── IssueForm.jsx      # Create issue form
│   │       ├── IssueForm.css      # Form component styles
│   │       ├── IssueEdit.jsx      # Edit issue modal
│   │       └── IssueEdit.css      # Edit component styles
│   ├── index.html         # HTML entry point
│   ├── vite.config.js     # Vite configuration
│   ├── package.json
│   └── public/            # Static assets
│
├── README.md              # This file
└── .gitignore
```
UI Components

 IssueList
- Displays all issues in a responsive grid
- Filter issues by status
- View issue summary with status badge
- Edit/Delete action buttons
- Loading and error states

 IssueForm
- Create new issues with validation
- Character count for title and description
- Form validation and error display
- Success feedback after creation

 IssueEdit
- Modal-based editing interface
- Edit title, description, and status
- Only modify changed fields
- Character limits and validation
- Cancel and save options

 App
- Main application container
- State management for issues and UI modes
- Navigation between list, create, and edit views

 Key Features Explanation

Input Validation
- Frontend: Immediate feedback on form input
- Backend: Server-side validation on all requests
- Error Messages: Clear, actionable error messages for users

State Management
- Uses React hooks (useState, useEffect)
- Centralized state in App component
- Prop drilling for component communication

 Error Handling
- HTTP status codes (400, 404, 500)
- Error message propagation to UI
- User-friendly error displays

Responsive Design
- Mobile-first CSS approach
- Flexible grid layouts
- Touch-friendly button sizes
- Adaptive typography

Testing

 Manual Testing Checklist
- [ ] Create a new issue with title only
- [ ] Create an issue with title and description
- [ ] View all issues in the list
- [ ] Filter issues by each status
- [ ] Edit an issue's title
- [ ] Edit an issue's description
- [ ] Change issue status
- [ ] Delete an issue (with confirmation)
- [ ] Test error cases (invalid input, server down)

 API Testing
You can test the API using curl, Postman, or similar tools:

```bash
# Create an issue
curl -X POST http://localhost:5000/api/issues \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Issue","description":"Test description"}'

# Get all issues
curl http://localhost:5000/api/issues

# Get issue by ID
curl http://localhost:5000/api/issues/1

# Update an issue
curl -X PUT http://localhost:5000/api/issues/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"in_progress"}'

# Delete an issue
curl -X DELETE http://localhost:5000/api/issues/1
```

Notes & Design Decisions

1. SQLite Database: Chosen for simplicity and zero-configuration setup. Suitable for this project scale. Can be migrated to PostgreSQL/MySQL for production.

2. Validation Approach: Both client-side and server-side validation ensure data integrity and provide better UX.

3. Component Structure: Separated concerns with dedicated components for list, create, and edit operations.

4. CSS Approach: Utility-first with component-scoped styles. No external CSS framework for lightweight solution.

5. API Design: RESTful principles with clear status codes and error handling.

6. State Management: React hooks sufficient for this app's complexity. Redux/Context API could be added for scaling.

 Deployment

Backend (Render, Heroku, DigitalOcean)
1. Push code to Git repository
2. Set environment variable for database path
3. Deploy with `npm start`

 Frontend (Vercel, Netlify)
1. Build: `npm run build`
2. Output directory: `dist/`
3. Set environment variable for API URL

Docker (Optional)
Create a multi-stage Dockerfile for containerization.

 Additional Resources

- [Express Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [SQLite Documentation](https://www.sqlite.org/)
- [REST API Best Practices](https://restfulapi.net/)

 Troubleshooting

 Port Already in Use
```bash
# Backend (port 5000)
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # macOS/Linux

# Frontend (port 5173)
netstat -ano | findstr :5173  # Windows
lsof -i :5173                 # macOS/Linux
```

CORS Issues
- Ensure backend is running on http://localhost:5000
- Check frontend API URL in `frontend/src/api.jsx`

Database Issues
- Delete `backend/issues.db` to reset the database
- Ensure SQLite3 is properly installed


 Author

Issue Tracker - Case Study Project 2026
