# Non-Conformance Tracking Dashboard

A comprehensive web application for managing quality non-conformances (NCs) from detection through investigation to closure. Track issues, analyze trends, and maintain visibility into your quality management process.

## Features

- **Dashboard Overview**: Real-time statistics and visualizations
  - Total NC count and status breakdown
  - Status distribution (pie chart)
  - Severity distribution (bar chart)
  - Trend analysis over time (line chart)
  - Recent NCs list

- **NC Management**
  - Create new non-conformances with detailed information
  - Edit existing NCs
  - Update status through workflow stages
  - Delete NCs with confirmation
  - Track root cause and corrective actions
  - Assign NCs to responsible persons
  - Department categorization (Sales, Warehouse, Production Lines, Delivery, Admin, Finance)

- **Kanban Board** 🆕
  - Trello-style drag-and-drop interface
  - Visual board with four status columns
  - Move NCs between statuses by dragging
  - Real-time status updates
  - Effectiveness check alerts on board

- **Effectiveness Tracking** 🆕
  - Automatic follow-up checks 3-6 months after closure
  - Score effectiveness from 1-5
  - Measure success of corrective actions
  - Dashboard and board alerts for due checks
  - Document long-term impact

- **Email Notifications** ✨
  - Automatic email when NC is assigned to someone
  - Status change notifications for assigned personnel
  - Professional HTML email templates
  - Works with Gmail, Outlook, and custom SMTP servers

- **Dark Mode** 🌙
  - Toggle between light and dark themes
  - Automatic system preference detection
  - Smooth transitions throughout the app
  - Persistent preference saved locally

- **CSV Import/Export** 📊
  - Export filtered NCs to CSV for reporting
  - Import bulk NCs from spreadsheets
  - Smart column mapping with preview
  - Validation and error reporting

- **Toast Notifications** 🔔
  - Real-time success/error feedback
  - Non-intrusive notifications
  - Auto-dismiss with manual close option
  - Color-coded by type (success, error, warning, info)

- **Advanced Filtering & Search**
  - Filter by status, severity, department, and category
  - Search across title and description
  - Sortable table columns
  - Real-time filtering

- **NC Lifecycle & Status Workflow**
  - **Open**: NC just reported, awaiting investigation
  - **Under Investigation**: Actively researching root cause
  - **Action Required**: Investigation complete, corrective actions needed
  - **Closed**: All actions complete, NC resolved
  - Automatic closure date tracking
  - Status-based quick actions

## Tech Stack

### Frontend
- React 18
- React Router for navigation
- Tailwind CSS for styling
- Chart.js with react-chartjs-2 for visualizations
- React Beautiful DnD for drag-and-drop

### Backend
- Node.js with Express
- SQLite3 for database
- Nodemailer for email notifications
- RESTful API design

## Quick Deploy

### Docker (Recommended - One Command!)

```bash
docker-compose up -d
```
Access at http://localhost:3000

### Alternative Deployment Options
- **Vercel + Railway**: Free cloud hosting → See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Local Development**: Manual setup below

---

## Prerequisites

- Node.js (v14 or higher) OR Docker
- npm (comes with Node.js)

## Installation & Setup

### 1. Clone or Download the Project

Navigate to the project directory:
```bash
cd C:\Users\dyotov\Desktop\nc-tracker
```

### 2. Backend Setup

Install backend dependencies:
```bash
cd backend
npm install
```

Start the backend server:
```bash
npm start
```

The backend server will run on `http://localhost:5000`. The SQLite database (`ncs.db`) will be created automatically in the backend directory.

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:
```bash
cd C:\Users\dyotov\Desktop\nc-tracker\frontend
npm install
```

Start the frontend development server:
```bash
npm start
```

The frontend will open automatically in your browser at `http://localhost:3000`.

### 4. Email Notifications Setup (Optional but Recommended)

To enable email notifications when NCs are assigned or status changes:

1. **Copy the example environment file:**
   ```bash
   cd C:\Users\dyotov\Desktop\nc-tracker\backend
   copy .env.example .env
   ```

2. **Edit `.env` and add your email credentials:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

3. **For Gmail users:** You need to generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Generate a password for "Mail" > "Other (NC Tracker)"
   - Use the 16-character password in your `.env` file

4. **Restart the backend server** after configuring emails

📧 **See [EMAIL_SETUP.md](EMAIL_SETUP.md) for detailed instructions including other email providers.**

**Note:** The system works perfectly without email configuration - notifications just won't be sent.

## Usage Guide

### Creating a Non-Conformance

1. Click "Create NC" in the navigation bar or on the dashboard
2. Fill in required fields:
   - Title (required)
   - Description (required)
   - Date Reported (defaults to today)
   - Status (defaults to Open)
   - Severity (defaults to Medium)
3. Optionally add:
   - Category (e.g., Product, Process, Documentation)
   - Department (Sales, Warehouse, Production Line A/B, Delivery, Admin, Finance)
   - Root Cause
   - Corrective Actions
   - Responsible Person (name)
   - Responsible Person Email (for notifications)
   - Due Date
   - Notes
4. Click "Create NC" to save

**Tip:** If you add a Responsible Person Email, they will automatically receive an email notification about the assignment!

### Viewing NCs

- **Dashboard**: See overview statistics and recent NCs
- **All NCs**: Click "All NCs" in navigation to see complete list
- **NC Detail**: Click on any NC to view full details

### Filtering & Sorting

On the "All NCs" page:
- Use the search box to find NCs by title or description
- Filter by Status dropdown
- Filter by Severity dropdown
- Filter by Department dropdown
- Click column headers to sort
- Click "Clear Filters" to reset

### Updating an NC

1. Navigate to the NC detail page
2. Click "Edit" button
3. Modify any fields
4. Click "Update NC" to save changes

Or use quick status updates:
1. On the NC detail page, use status action buttons at the bottom
2. Click the desired status to update immediately

### Closing an NC

1. Navigate to the NC detail page
2. Click "Close NC" button at the bottom
3. The closure date will be automatically recorded

### Deleting an NC

1. Navigate to the NC detail page
2. Click "Delete" button
3. Confirm deletion in the popup

## API Documentation

### Base URL
`http://localhost:5000/api`

### Endpoints

#### Get All NCs
```
GET /ncs
Query Parameters: status, severity, category, search
Response: Array of NC objects
```

#### Get NC by ID
```
GET /ncs/:id
Response: Single NC object
```

#### Get Statistics
```
GET /ncs/stats
Response: {
  total: number,
  byStatus: { [status]: count },
  bySeverity: { [severity]: count },
  timeline: [{ date, count }]
}
```

#### Create NC
```
POST /ncs
Body: NC object (title, description, date_reported, status, severity required)
Response: Created NC object with ID
```

#### Update NC
```
PUT /ncs/:id
Body: Partial NC object with fields to update
Response: Updated NC object
```

#### Delete NC
```
DELETE /ncs/:id
Response: { message: "Non-conformance deleted successfully" }
```

## Database Schema

### non_conformances Table

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | INTEGER | Auto | Primary key |
| title | TEXT | Yes | NC title |
| description | TEXT | Yes | Detailed description |
| date_reported | TEXT | Yes | Date NC was reported |
| status | TEXT | Yes | Open, Under Investigation, Action Required, Closed |
| severity | TEXT | Yes | Low, Medium, High, Critical |
| category | TEXT | No | Product, Process, Documentation, etc. |
| department | TEXT | No | Sales, Warehouse, Production Line A/B, Delivery, Admin, Finance |
| root_cause | TEXT | No | Identified root cause |
| corrective_actions | TEXT | No | Actions taken to correct |
| responsible_person | TEXT | No | Name of person assigned |
| responsible_person_email | TEXT | No | Email for notifications |
| due_date | TEXT | No | Target completion date |
| closure_date | TEXT | No | Date NC was closed |
| notes | TEXT | No | Additional notes |
| created_at | TEXT | Auto | Record creation timestamp |
| updated_at | TEXT | Auto | Last update timestamp |

## Project Structure

```
nc-tracker/
├── backend/
│   ├── server.js              # Express server setup
│   ├── database.js            # SQLite database logic
│   ├── routes/
│   │   └── ncs.js            # NC API endpoints
│   ├── package.json
│   └── ncs.db                # SQLite database (created at runtime)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx     # Main dashboard
│   │   │   ├── NCList.jsx        # NC list view
│   │   │   ├── NCForm.jsx        # Create/edit form
│   │   │   ├── NCDetail.jsx      # Detail view
│   │   │   ├── StatCard.jsx      # Stat card component
│   │   │   └── Charts.jsx        # Chart components
│   │   ├── App.jsx               # Main app with routing
│   │   ├── index.js              # React entry point
│   │   └── index.css             # Tailwind CSS
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## Development

### Backend Development Server
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development Server
```bash
cd frontend
npm start  # Hot reloads on file changes
```

### Building for Production

Frontend:
```bash
cd frontend
npm run build
```

The optimized production build will be in the `frontend/build` directory.

## Troubleshooting

### Backend won't start
- Ensure port 5000 is not in use
- Check that Node.js is installed: `node --version`
- Verify all dependencies are installed: `npm install`

### Frontend won't start
- Ensure port 3000 is not in use
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### Database errors
- Delete `backend/ncs.db` and restart backend to recreate database
- Check file permissions on the backend directory

### Charts not displaying
- Verify Chart.js is installed: `npm list chart.js react-chartjs-2`
- Check browser console for errors

## Future Enhancements

Potential features for future development:
- User authentication and authorization
- File attachments for NCs
- Email notifications
- PDF/Excel export functionality
- Audit log/history tracking
- Comments and collaboration features
- Advanced reporting and analytics
- Mobile app version

## License

MIT

## Support

For issues or questions, please check the troubleshooting section above or review the code comments for implementation details.
