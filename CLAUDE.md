# Non-Conformance Tracker - Claude Code Instructions

## Project Overview

This is a comprehensive web application for managing quality non-conformances (NCs) from detection through investigation to closure. The system helps track issues, analyze trends, and maintain visibility into quality management processes.

## Architecture

**Monorepo Structure:**
- `frontend/` - React-based UI
- `backend/` - Node.js/Express API server

### Tech Stack

**Frontend:**
- React 18
- React Router for navigation
- Tailwind CSS for styling
- Chart.js with react-chartjs-2 for visualizations
- React Beautiful DnD for drag-and-drop Kanban board

**Backend:**
- Node.js with Express
- SQLite3 for database (file: `backend/ncs.db`)
- Nodemailer for email notifications
- RESTful API design

### Key Features
- Dashboard with real-time statistics and visualizations
- NC lifecycle management (Open → Under Investigation → Action Required → Closed)
- Kanban board with drag-and-drop
- Effectiveness tracking (3-6 month follow-ups)
- Email notifications for assignments and status changes
- Advanced filtering and search
- Department categorization (Sales, Warehouse, Production Lines, Delivery, Admin, Finance)

## Development Workflow

### Starting the Application

**Backend:**
```bash
cd backend
npm install        # First time only
npm start          # Production
npm run dev        # Development with nodemon
```
Backend runs on `http://localhost:5000`

**Frontend:**
```bash
cd frontend
npm install        # First time only
npm start          # Development server
npm run build      # Production build
```
Frontend runs on `http://localhost:3000`

### Environment Variables

Backend uses `.env` file for email configuration (optional):
- Copy `.env.example` to `.env`
- Configure SMTP settings for email notifications
- See [EMAIL_SETUP.md](EMAIL_SETUP.md) for detailed setup

## Project Structure

### Backend Structure
```
backend/
├── server.js              # Express server setup
├── database.js            # SQLite database initialization & queries
├── emailService.js        # Email notification service
├── routes/
│   └── ncs.js            # NC API endpoints
├── seed-data.js          # Sample data for testing
├── ncs.db                # SQLite database (gitignored)
└── .env                  # Email config (gitignored)
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx         # Main dashboard with stats
│   │   ├── NCList.jsx           # NC list view with filters
│   │   ├── NCForm.jsx           # Create/edit form
│   │   ├── NCDetail.jsx         # Detail view
│   │   ├── KanbanBoard.jsx      # Drag-and-drop board
│   │   ├── StatCard.jsx         # Reusable stat card
│   │   └── Charts.jsx           # Chart components
│   ├── App.jsx                  # Main app with routing
│   └── index.css                # Tailwind CSS imports
├── public/
└── package.json (proxy to localhost:5000)
```

## Database Schema

**Main Table: `non_conformances`**

Key fields:
- `id` (INTEGER, PK)
- `title`, `description` (TEXT, required)
- `date_reported` (TEXT, required)
- `status` (TEXT: Open, Under Investigation, Action Required, Closed)
- `severity` (TEXT: Low, Medium, High, Critical)
- `category`, `department` (TEXT, optional)
- `root_cause`, `corrective_actions` (TEXT, optional)
- `responsible_person`, `responsible_person_email` (TEXT, optional)
- `due_date`, `closure_date` (TEXT, optional)
- `effectiveness_check_date`, `effectiveness_score` (for tracking)
- `created_at`, `updated_at` (TEXT, auto-managed)

## API Endpoints

Base URL: `http://localhost:5000/api`

- `GET /ncs` - List all NCs (supports query params: status, severity, category, search)
- `GET /ncs/stats` - Get statistics for dashboard
- `GET /ncs/:id` - Get single NC by ID
- `POST /ncs` - Create new NC
- `PUT /ncs/:id` - Update NC
- `DELETE /ncs/:id` - Delete NC

## Code Guidelines

### General Principles
- Maintain existing code style and patterns
- Prefer editing existing files over creating new ones
- Keep solutions simple and focused
- Don't add features beyond what's requested
- Follow the existing component structure in frontend
- Use async/await for database operations in backend

### Frontend Guidelines
- Use functional components with hooks
- Follow existing Tailwind CSS patterns for styling
- Maintain consistent routing structure in App.jsx
- Keep API calls in components (no separate service layer currently)
- Use React Router's useNavigate for navigation

### Backend Guidelines
- All database operations go through database.js
- Email functionality is centralized in emailService.js
- Route handlers in routes/ncs.js
- Use try-catch blocks for error handling
- Return appropriate HTTP status codes

### Common Patterns
- Date formatting: Store as ISO strings in DB
- Status workflow: Open → Under Investigation → Action Required → Closed
- Severity levels: Low, Medium, High, Critical
- Departments: Sales, Warehouse, Production Line A, Production Line B, Delivery, Admin, Finance

## Testing & Debugging

- Use `seed-data.js` to populate test data
- Check browser console for frontend errors
- Check terminal/console for backend errors
- Database file: `backend/ncs.db` (can delete to reset)
- Email notifications require .env configuration

## Important Files

### Documentation
- [README.md](README.md) - Main documentation and setup guide
- [QUICKSTART.md](QUICKSTART.md) - Quick setup instructions
- [EMAIL_SETUP.md](EMAIL_SETUP.md) - Email notification setup
- [FEATURES_V2.md](FEATURES_V2.md) - Feature documentation
- [V2_IMPLEMENTATION.md](V2_IMPLEMENTATION.md) - Implementation details
- [UPDATES.md](UPDATES.md) - Change log

### Configuration
- `frontend/tailwind.config.js` - Tailwind CSS configuration
- `frontend/package.json` - Includes proxy to backend
- `backend/.env.example` - Template for email config

## Known Considerations

- SQLite is single-file database (good for this use case)
- No user authentication currently implemented
- Email notifications are optional (app works without them)
- Effectiveness checks are time-based (3-6 months post-closure)
- Frontend proxies API requests to backend during development

## Common Tasks

**Add new NC field:**
1. Update database.js schema and migration
2. Update routes/ncs.js endpoints
3. Update NCForm.jsx form inputs
4. Update NCDetail.jsx display

**Modify UI component:**
1. Locate component in frontend/src/components/
2. Edit JSX and Tailwind classes
3. Test in browser (hot reload enabled)

**Change API endpoint:**
1. Edit routes/ncs.js
2. Update corresponding frontend component API calls
3. Test with browser dev tools network tab

**Update email templates:**
1. Edit emailService.js
2. Modify HTML template strings
3. Test with real email configuration
