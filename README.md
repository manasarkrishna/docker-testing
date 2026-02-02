# Issue Tracker

A full-stack web application for creating, viewing, updating, and managing issue tickets.

## Tech Stack

### Backend
- **Node.js** with Express.js
- **SQLite** database
- **CORS** for cross-origin requests

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **REST API** integration

## Features

- ✅ Create new issues with title and description
- ✅ View list of all issues with status indicators
- ✅ Filter issues by status (Open, In Progress, Closed)
- ✅ View detailed issue information
- ✅ Edit existing issues
- ✅ Real-time validation and error handling
- ✅ Responsive design
- ✅ Loading indicators

## Project Structure

```
issue-tracker/
├── backend/
│   ├── database.js          # SQLite database setup and schema
│   ├── server.js            # Express server and API endpoints
│   ├── package.json         # Backend dependencies
│   └── issues.db           # SQLite database file (created automatically)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── IssueList.tsx    # Issue list view with filtering
│   │   │   ├── IssueForm.tsx    # Create/edit issue form
│   │   │   └── IssueDetail.tsx  # Issue detail view
│   │   ├── types.ts             # TypeScript type definitions
│   │   ├── api.ts               # API client
│   │   └── App.tsx              # Main application component
│   ├── package.json            # Frontend dependencies
│   └── tailwind.config.js      # Tailwind configuration
└── README.md
```

## API Endpoints

### Issues
- `GET /api/issues` - Get all issues (optional `?status={open|in_progress|closed}` filter)
- `GET /api/issues/:id` - Get single issue by ID
- `POST /api/issues` - Create new issue
- `PUT /api/issues/:id` - Update existing issue

### Data Model
```typescript
interface Issue {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  created_at: string;
  updated_at: string;
}
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Usage

1. Start both the backend and frontend servers as described above
2. Open `http://localhost:3000` in your browser
3. Create your first issue using the "Create New Issue" button
4. View, edit, and manage issues from the main dashboard

## Validation Rules

- **Title**: Required, max 200 characters
- **Description**: Optional, max 2000 characters  
- **Status**: Must be one of: 'open', 'in_progress', 'closed'

## Error Handling

The application includes comprehensive error handling:
- Frontend validation with user-friendly error messages
- Backend validation with appropriate HTTP status codes
- Network error handling with retry capabilities
- Loading states for better UX

## Development Notes

- The SQLite database is created automatically when the backend starts
- All timestamps are stored in UTC and displayed in local time
- The application uses TypeScript for type safety
- Tailwind CSS provides responsive, utility-first styling

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Issue assignment to users
- [ ] Comments and attachments
- [ ] Search functionality
- [ ] Unit tests
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Production deployment

## License

MIT License
