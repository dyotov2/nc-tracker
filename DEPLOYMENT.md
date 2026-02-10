# NC Tracker - Deployment Guide

This guide provides multiple deployment options for the NC Tracker application.

## Table of Contents
- [Docker Deployment (Recommended)](#docker-deployment-recommended)
- [Vercel Frontend + Railway Backend](#vercel-frontend--railway-backend)
- [Local Production Build](#local-production-build)
- [Environment Variables](#environment-variables)

---

## Docker Deployment (Recommended)

The easiest way to deploy NC Tracker is using Docker Compose.

### Prerequisites
- Docker and Docker Compose installed
- Port 3000 and 5000 available

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd nc-tracker
   ```

2. **Configure email notifications (optional)**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your SMTP settings
   ```

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild after code changes
docker-compose up -d --build

# Stop and remove all data
docker-compose down -v
```

### Data Persistence

The SQLite database is stored in a Docker volume and persists between restarts. To backup your data:

```bash
# Backup database
docker cp nc-tracker-backend-1:/app/ncs.db ./backup-ncs.db

# Restore database
docker cp ./backup-ncs.db nc-tracker-backend-1:/app/ncs.db
docker-compose restart backend
```

---

## Vercel Frontend + Railway Backend

Deploy the frontend to Vercel (free) and backend to Railway (free tier available).

### Backend Deployment (Railway)

1. **Create Railway account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy backend**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose the `backend` folder
   - Railway will auto-detect Node.js

3. **Configure environment variables**
   ```
   NODE_ENV=production
   PORT=5000
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

4. **Get your backend URL**
   - Railway will provide a URL like: `https://your-app.up.railway.app`

### Frontend Deployment (Vercel)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy frontend**
   ```bash
   cd frontend
   vercel
   ```

3. **Configure build settings**
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

4. **Set environment variables**
   ```bash
   vercel env add REACT_APP_API_URL
   # Enter your Railway backend URL
   ```

5. **Update package.json proxy**

   In `frontend/package.json`, remove the proxy line or update your API calls to use the full Railway URL.

### Alternative: Deploy Button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/nc-tracker)

---

## Local Production Build

Build and run the production version locally.

### Backend

```bash
cd backend
npm install --production
NODE_ENV=production node server.js
```

### Frontend

```bash
cd frontend
npm install
npm run build

# Serve with a static server
npx serve -s build -p 3000
```

---

## Environment Variables

### Backend (.env)

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Email Notifications (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# For other email providers:
# Outlook: smtp.office365.com:587
# Yahoo: smtp.mail.yahoo.com:587
# Custom SMTP: your-smtp-server.com:587
```

### Frontend (Vercel only)

```env
REACT_APP_API_URL=https://your-backend-url.com
```

---

## Deployment Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production` in backend
- [ ] Configure SMTP settings for email notifications
- [ ] Update CORS settings in `backend/server.js` if deploying to different domains
- [ ] Backup your SQLite database regularly
- [ ] Set up SSL/HTTPS (automatically handled by Vercel/Railway)
- [ ] Test all features in production environment
- [ ] Monitor application logs for errors

---

## Troubleshooting

### Docker Issues

**Container won't start**
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild from scratch
docker-compose down -v
docker-compose up --build
```

**Port already in use**
```bash
# Change ports in docker-compose.yml
ports:
  - "3001:3000"  # Frontend
  - "5001:5000"  # Backend
```

### Vercel Issues

**Build fails**
- Ensure `npm run build` works locally first
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`

**API calls fail**
- Check CORS settings in backend
- Verify `REACT_APP_API_URL` environment variable
- Ensure backend is running and accessible

### Railway Issues

**Database not persisting**
- Railway's free tier may restart containers
- Consider using Railway's volume mounts for SQLite
- Or migrate to PostgreSQL for production

**Out of memory**
- Railway free tier has 512MB limit
- Optimize your code or upgrade plan

---

## Scaling Considerations

For larger deployments:

1. **Database**: Migrate from SQLite to PostgreSQL or MySQL
2. **File Storage**: Use S3 or similar for attachments (future feature)
3. **Caching**: Add Redis for session management
4. **Load Balancing**: Use multiple backend instances
5. **Monitoring**: Add error tracking (Sentry) and analytics

---

## Support

For issues or questions:
- Check the [main README](README.md)
- Review [troubleshooting section](README.md#troubleshooting)
- Open an issue on GitHub

---

## Quick Reference

| Deployment | Best For | Cost | Difficulty |
|------------|----------|------|-----------|
| Docker | Local/Self-hosted | Free | Easy |
| Vercel + Railway | Small teams | Free tier | Medium |
| VPS (DigitalOcean) | Full control | $5-10/mo | Hard |

**Recommended for beginners**: Docker (local) or Vercel + Railway (cloud)
