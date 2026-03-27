# Landscape App - Production Deployment Guide

## Overview

This document provides step-by-step instructions for deploying the Landscape Management Application to production using:
- **Backend:** Render (Node.js/Express)
- **Frontend:** Vercel (React/Vite)
- **Database:** PostgreSQL on Render

---

## Backend Deployment (Render)

### Prerequisites
- Render account ([https://render.com](https://render.com))
- GitHub repository with the project code
- PostgreSQL database (can be created on Render)

### Step 1: Create PostgreSQL Database on Render

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name:** `landscape-db`
   - **Database:** `landscape`
   - **User:** `landscape_user`
   - **Region:** Select closest to your users
   - **Plan:** Free tier for testing, Paid for production
4. Click **"Create Database"**
5. Copy the **Internal Database URL** (format: `postgresql://user:password@host:port/database`)

### Step 2: Create Backend Service on Render

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `landscape-backend`
   - **Environment:** `Node`
   - **Build Command:** `pnpm install && pnpm build`
   - **Start Command:** `pnpm start`
   - **Plan:** Free tier for testing
4. Add Environment Variables:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   NODE_ENV=production
   JWT_SECRET=<generate-random-secret>
   VITE_APP_ID=<from-manus>
   OAUTH_SERVER_URL=<from-manus>
   ```
5. Click **"Create Web Service"**
6. Wait for deployment to complete
7. Copy the service URL (format: `https://landscape-backend.onrender.com`)

### Step 3: Run Database Migrations

1. Once backend is deployed, trigger the migration endpoint:
   ```
   curl "https://landscape-backend.onrender.com/api/migrate?secret=landscape-migrate-2024"
   ```
2. Expected response:
   ```json
   { "success": true, "message": "Database migration completed" }
   ```

### Step 4: Verify Backend Health

```bash
curl https://landscape-backend.onrender.com/api/health
```

Expected response:
```json
{ "status": "ok", "timestamp": "2026-03-27T...", "mode": "real" }
```

---

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account ([https://vercel.com](https://vercel.com))
- GitHub repository with the project code
- Backend URL from Render (from Step 2 above)

### Step 1: Configure Environment Variables

In your GitHub repository, create a `.env.production` file (or configure in Vercel):

```
VITE_API_URL=https://landscape-backend.onrender.com
```

**Important:** Do NOT include `/api/trpc` suffix or trailing slash.

### Step 2: Deploy to Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Select your GitHub repository
4. Configure:
   - **Framework Preset:** `Vite`
   - **Build Command:** `pnpm build`
   - **Output Directory:** `dist`
5. Add Environment Variables:
   ```
   VITE_API_URL=https://landscape-backend.onrender.com
   VITE_APP_ID=<from-manus>
   VITE_OAUTH_PORTAL_URL=<from-manus>
   VITE_FRONTEND_FORGE_API_URL=<from-manus>
   VITE_FRONTEND_FORGE_API_KEY=<from-manus>
   VITE_ANALYTICS_ENDPOINT=<from-manus>
   VITE_ANALYTICS_WEBSITE_ID=<from-manus>
   ```
6. Click **"Deploy"**
7. Wait for deployment to complete
8. Copy the Vercel URL (format: `https://landscape-app.vercel.app`)

### Step 3: Verify Frontend

1. Open the Vercel URL in your browser
2. Check browser console for logs:
   - `[App] Starting Landscape Management Application`
   - `[App] API URL from env: https://landscape-backend.onrender.com`
   - `[tRPC Client] Connecting to: https://landscape-backend.onrender.com/api/trpc`
3. Log in with your Manus account
4. Navigate to `/plants` and `/inventory` routes

---

## Testing Checklist

### Backend Tests

- [ ] Health check endpoint responds: `GET /api/health`
- [ ] CORS headers present in response
- [ ] Migration endpoint works: `GET /api/migrate?secret=landscape-migrate-2024`
- [ ] tRPC endpoint responds: `POST /api/trpc`
- [ ] Database connection logs show "Connected to PostgreSQL"

### Frontend Tests

- [ ] Application loads without errors
- [ ] Console logs show correct API URL
- [ ] Login flow works
- [ ] Navigate to `/plants` - page loads
- [ ] Navigate to `/inventory` - page loads
- [ ] Add plant - creates successfully
- [ ] List plants - displays all plants
- [ ] Delete plant - removes from database
- [ ] Add inventory item - creates successfully
- [ ] List inventory - displays all items

### Integration Tests

- [ ] Frontend connects to backend API
- [ ] tRPC procedures execute successfully
- [ ] Database operations persist data
- [ ] Cross-origin requests work (CORS enabled)
- [ ] Authentication flow completes

---

## Troubleshooting

### Backend Issues

**Error: "Cannot find module 'cors'"**
- Solution: Run `pnpm install cors` in backend directory

**Error: "DATABASE_URL not provided"**
- Solution: Add `DATABASE_URL` environment variable to Render service settings
- Backend will fall back to mock mode if not provided

**Error: "Port already in use"**
- Solution: Render automatically assigns PORT via environment variable
- Ensure code uses `process.env.PORT` instead of hardcoded port

### Frontend Issues

**Error: "VITE_API_URL not set"**
- Solution: Add `VITE_API_URL` to Vercel environment variables
- Frontend will fall back to relative path `/api/trpc` if not provided

**Error: "CORS error when calling API"**
- Solution: Verify backend has CORS middleware enabled
- Check that `origin: "*"` is configured in Express CORS settings

**Error: "tRPC connection failed"**
- Solution: Check browser console for actual API URL being used
- Verify backend URL is correct and accessible
- Ensure no trailing slash in `VITE_API_URL`

---

## Environment Variables Reference

### Backend (Render)

| Variable | Required | Example | Purpose |
|----------|----------|---------|---------|
| `DATABASE_URL` | No | `postgresql://...` | PostgreSQL connection string |
| `NODE_ENV` | Yes | `production` | Environment mode |
| `PORT` | Auto | `3000` | Server port (set by Render) |
| `JWT_SECRET` | Yes | `random-secret-key` | Session signing secret |
| `VITE_APP_ID` | Yes | `app-id-from-manus` | OAuth application ID |
| `OAUTH_SERVER_URL` | Yes | `https://api.manus.im` | OAuth server URL |

### Frontend (Vercel)

| Variable | Required | Example | Purpose |
|----------|----------|---------|---------|
| `VITE_API_URL` | No | `https://landscape-backend.onrender.com` | Backend API base URL |
| `VITE_APP_ID` | Yes | `app-id-from-manus` | OAuth application ID |
| `VITE_OAUTH_PORTAL_URL` | Yes | `https://oauth.manus.im` | OAuth portal URL |
| `VITE_FRONTEND_FORGE_API_URL` | Yes | `https://api.manus.im` | Manus API URL |
| `VITE_FRONTEND_FORGE_API_KEY` | Yes | `api-key` | Manus API key |
| `VITE_ANALYTICS_ENDPOINT` | Yes | `https://analytics.manus.im` | Analytics endpoint |
| `VITE_ANALYTICS_WEBSITE_ID` | Yes | `website-id` | Analytics website ID |

---

## Production Monitoring

### Logging

- **Backend:** Check Render service logs for database connection status
- **Frontend:** Monitor Vercel deployment logs for build errors
- **Browser Console:** Check for tRPC connection logs and API errors

### Health Checks

Regular health checks to ensure production stability:

```bash
# Backend health
curl https://landscape-backend.onrender.com/api/health

# Frontend availability
curl https://landscape-app.vercel.app
```

### Database Backups

Render PostgreSQL provides automatic backups. Configure in Render dashboard:
1. Go to PostgreSQL service settings
2. Enable automated backups
3. Set backup retention period

---

## Rollback Procedures

### Backend Rollback (Render)

1. Go to Render dashboard
2. Select `landscape-backend` service
3. Click **"Deployments"**
4. Select previous deployment
5. Click **"Redeploy"**

### Frontend Rollback (Vercel)

1. Go to Vercel dashboard
2. Select `landscape-app` project
3. Click **"Deployments"**
4. Select previous deployment
5. Click **"Redeploy"**

---

## Performance Optimization

### Backend Optimization

- Enable caching for database queries
- Implement rate limiting for API endpoints
- Use connection pooling for PostgreSQL

### Frontend Optimization

- Enable code splitting in Vite build
- Optimize images and assets
- Enable Vercel edge caching

---

## Security Considerations

1. **Environment Variables:** Never commit secrets to GitHub
2. **CORS:** Keep `origin: "*"` for development; restrict in production if needed
3. **Database:** Use strong passwords for PostgreSQL
4. **SSL/TLS:** Both Render and Vercel provide automatic HTTPS
5. **Authentication:** Manus OAuth handles user authentication

---

## Support & Resources

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **tRPC Docs:** https://trpc.io/docs
- **Express Docs:** https://expressjs.com/
- **React Docs:** https://react.dev

---

## Deployment Checklist

- [ ] GitHub repository created and code pushed
- [ ] PostgreSQL database created on Render
- [ ] Backend service created on Render
- [ ] Backend environment variables configured
- [ ] Database migrations executed
- [ ] Backend health check verified
- [ ] Frontend project created on Vercel
- [ ] Frontend environment variables configured
- [ ] Frontend deployment completed
- [ ] Frontend health check verified
- [ ] End-to-end testing completed
- [ ] Monitoring and logging configured
- [ ] Backup procedures tested

---

**Last Updated:** March 27, 2026
**Status:** Production Ready
