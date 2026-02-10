# Deploy to Render - Step by Step Guide

Render has limitations with monorepo structure. Here are two solutions:

## Solution 1: Deploy Backend Only (Recommended)

Deploy just the backend to Render, then use Vercel for frontend.

### Backend on Render

1. Go to https://render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo: `dyotov2/nc-tracker`
4. Configure:
   - **Name**: `nc-tracker-backend`
   - **Region**: Oregon (or nearest)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free
5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   ```
   (Render uses port 10000 by default)
6. Click **"Create Web Service"**
7. Wait 5-10 minutes for build
8. Copy your backend URL: `https://nc-tracker-backend.onrender.com`

### Frontend on Vercel

1. Go to https://vercel.com
2. Import `dyotov2/nc-tracker`
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. Add Environment Variable:
   - `REACT_APP_API_URL` = Your Render backend URL
5. Deploy

---

## Solution 2: Use Railway Instead (Easier)

Railway handles monorepos better:

### Backend on Railway

1. Go to https://railway.app
2. **"New Project"** → **"Deploy from GitHub repo"**
3. Select `nc-tracker` → **Select `backend` folder**
4. Railway auto-detects and deploys
5. Generate domain in Settings
6. Done!

### Frontend on Vercel

(Same as above)

---

## Solution 3: All-in-One Dockerfile (Advanced)

If you want everything on Render, we'd need to modify the Docker setup. Let me know if you want this option.

---

## Recommended: Railway Backend + Vercel Frontend

This is the easiest because:
- ✅ Railway handles monorepo folders natively
- ✅ Both have generous free tiers
- ✅ Automatic HTTPS
- ✅ No configuration needed

---

## Troubleshooting Render Build Errors

If you see errors like:
- `Cannot find module` → Wrong root directory
- `Build failed` → Check logs, likely missing dependencies
- `Port already in use` → Use environment variable PORT

Common fix: Make sure "Root Directory" is set to `backend` in Render dashboard.
