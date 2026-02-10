# Quick Start Guide

Follow these simple steps to get the NC Tracker up and running.

## Prerequisites Check

1. **Verify Node.js is installed:**
   ```bash
   node --version
   ```
   Should show v14 or higher. If not installed, download from https://nodejs.org/

## Starting the Application

### Step 1: Start Backend Server

Open a terminal/command prompt:

```bash
cd C:\Users\dyotov\Desktop\nc-tracker\backend
npm start
```

You should see:
```
Database initialized successfully
Server is running on port 5000
API available at http://localhost:5000/api
```

**Keep this terminal open!** The backend must stay running.

### Step 2: Start Frontend (New Terminal)

Open a **NEW** terminal/command prompt:

```bash
cd C:\Users\dyotov\Desktop\nc-tracker\frontend
npm start
```

The app will automatically open in your browser at `http://localhost:3000`

If it doesn't open automatically, manually navigate to: **http://localhost:3000**

## Optional: Add Sample Data

To populate the database with sample non-conformances for testing:

```bash
cd C:\Users\dyotov\Desktop\nc-tracker\backend
node seed-data.js
```

This will create 5 sample NCs with different statuses and severities.

## Optional: Enable Email Notifications

To receive email notifications when NCs are assigned or status changes:

1. Copy the example environment file:
   ```bash
   cd C:\Users\dyotov\Desktop\nc-tracker\backend
   copy .env.example .env
   ```

2. Edit `.env` with your email settings (see [EMAIL_SETUP.md](EMAIL_SETUP.md) for details)

3. Restart the backend server

**Note:** The system works great without emails - they're optional!

## Using the Application

### Dashboard (Home Page)
- View statistics: total NCs, status breakdown, severity distribution
- See charts visualizing your data
- Quick access to recent NCs

### Create a New NC
1. Click "Create NC" in the navigation bar
2. Fill in the form (Title and Description are required)
3. Click "Create NC"

### View All NCs
1. Click "All NCs" in the navigation
2. Use filters to narrow down results
3. Click on any NC to view details

### Edit or Update an NC
1. Open the NC detail page
2. Click "Edit" to modify all fields
3. Or use quick status buttons at the bottom

## Stopping the Application

1. In the frontend terminal: Press `Ctrl+C`
2. In the backend terminal: Press `Ctrl+C`

## Troubleshooting

### "Port already in use" error

**Backend (port 5000):**
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

**Frontend (port 3000):**
```bash
# Windows - Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### Frontend can't connect to backend

1. Verify backend is running (check terminal for "Server is running on port 5000")
2. Verify backend URL in browser works: http://localhost:5000/api/health
3. Should return: `{"status":"ok","message":"Server is running"}`

### Database issues

If you encounter database errors, you can reset it:

```bash
cd C:\Users\dyotov\Desktop\nc-tracker\backend
del ncs.db
npm start
```

This will create a fresh database. Then optionally run `node seed-data.js` to add sample data.

## Next Steps

- Read the full README.md for detailed documentation
- Review the API documentation for integration possibilities
- Customize the application to match your workflow
- Add more NC categories specific to your organization

## Getting Help

- Check the README.md file for detailed documentation
- Review the troubleshooting section
- Inspect browser console (F12) for frontend errors
- Check terminal output for backend errors
