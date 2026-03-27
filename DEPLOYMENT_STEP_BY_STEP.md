# Landscape App - Step-by-Step Deployment Guide

## ⚠️ IMPORTANT: Regenerate Your Tokens

Since you shared tokens in the chat, **REGENERATE THEM IMMEDIATELY:**

1. **GitHub:** https://github.com/settings/tokens → Delete old token → Create new one
2. **Render:** https://dashboard.render.com/account/tokens → Regenerate
3. **Vercel:** https://vercel.com/account/tokens → Regenerate

---

## Phase 1: Prepare GitHub Repository

### Step 1.1: Create GitHub Repository

1. Go to https://github.com/new
2. Create repository name: `landscape-app`
3. Set to **Private** (recommended)
4. Click **"Create repository"**
5. Copy the repository URL (e.g., `https://github.com/yourusername/landscape-app.git`)

### Step 1.2: Push Code to GitHub

```bash
cd /home/ubuntu/landscape-app
git remote set-url origin https://github.com/yourusername/landscape-app.git
git branch -M main
git push -u origin main
```

**Expected Output:**
```
Enumerating objects: ...
Counting objects: 100% (...)
...
To https://github.com/yourusername/landscape-app.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

## Phase 2: Deploy Backend to Render

### Step 2.1: Create PostgreSQL Database on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name:** `landscape-db`
   - **Database:** `landscape`
   - **User:** `landscape_user`
   - **Region:** Choose closest to you
   - **Plan:** Free tier
4. Click **"Create Database"**
5. ⏳ Wait 2-3 minutes for database creation
6. Copy the **Internal Database URL** from the dashboard (format: `postgresql://user:password@host:port/database`)

### Step 2.2: Create Backend Web Service on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Select **"Deploy an existing repository"** → Connect GitHub
4. Authorize GitHub and select `landscape-app` repository
5. Configure:
   - **Name:** `landscape-backend`
   - **Environment:** `Node`
   - **Build Command:** `pnpm install && pnpm build`
   - **Start Command:** `pnpm start`
   - **Plan:** Free tier
6. Click **"Advanced"** and add Environment Variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `postgresql://...` (from Step 2.1) |
| `JWT_SECRET` | Generate random: `openssl rand -base64 32` |
| `VITE_APP_ID` | From your Manus account |
| `OAUTH_SERVER_URL` | `https://api.manus.im` |
| `OWNER_OPEN_ID` | From your Manus account |
| `OWNER_NAME` | Your name |
| `BUILT_IN_FORGE_API_URL` | `https://api.manus.im` |
| `BUILT_IN_FORGE_API_KEY` | From your Manus account |

7. Click **"Create Web Service"**
8. ⏳ Wait for deployment (5-10 minutes)
9. Copy the backend URL (e.g., `https://landscape-backend.onrender.com`)

### Step 2.3: Verify Backend Deployment

```bash
curl https://landscape-backend.onrender.com/api/health
```

**Expected Response:**
```json
{"status":"ok","timestamp":"2026-03-27T...","mode":"real"}
```

### Step 2.4: Run Database Migrations

```bash
curl "https://landscape-backend.onrender.com/api/migrate?secret=landscape-migrate-2024"
```

**Expected Response:**
```json
{"success":true,"message":"Database migration completed"}
```

---

## Phase 3: Deploy Frontend to Vercel

### Step 3.1: Create Vercel Project

1. Go to https://vercel.com/new
2. Select **"Import Git Repository"**
3. Authorize GitHub and select `landscape-app`
4. Configure:
   - **Framework Preset:** `Vite`
   - **Build Command:** `pnpm build`
   - **Output Directory:** `dist`
   - **Install Command:** `pnpm install`
5. Click **"Advanced"** and add Environment Variables:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://landscape-backend.onrender.com` (from Step 2.2) |
| `VITE_APP_ID` | From your Manus account |
| `VITE_OAUTH_PORTAL_URL` | `https://oauth.manus.im` |
| `VITE_FRONTEND_FORGE_API_URL` | `https://api.manus.im` |
| `VITE_FRONTEND_FORGE_API_KEY` | From your Manus account |
| `VITE_ANALYTICS_ENDPOINT` | From your Manus account |
| `VITE_ANALYTICS_WEBSITE_ID` | From your Manus account |

6. Click **"Deploy"**
7. ⏳ Wait for deployment (3-5 minutes)
8. Copy the Vercel URL (e.g., `https://landscape-app.vercel.app`)

### Step 3.2: Verify Frontend Deployment

1. Open `https://landscape-app.vercel.app` in browser
2. Open browser console (F12)
3. Check for logs:
   - `[App] Starting Landscape Management Application`
   - `[App] API URL from env: https://landscape-backend.onrender.com`
   - `[tRPC Client] Connecting to: https://landscape-backend.onrender.com/api/trpc`
4. Log in with your Manus account
5. Navigate to `/plants` and `/inventory`

---

## Phase 4: End-to-End Testing

### Test 1: Add Plant

1. Go to `/plants`
2. Click **"Add Plant"**
3. Fill in:
   - Plant Name: `Test Plant`
   - Species: `Test Species`
   - Location: `Test Location`
4. Click **"Add Plant"**
5. ✅ Plant should appear in the list

### Test 2: List Plants

1. Refresh the page
2. ✅ Plant should still be visible

### Test 3: Delete Plant

1. Click **"Delete"** on the plant
2. Confirm deletion
3. ✅ Plant should be removed

### Test 4: Add Inventory Item

1. Go to `/inventory`
2. Click **"Add Item"**
3. Fill in:
   - Item Name: `Test Item`
   - Quantity: `5`
   - Category: `Test`
4. Click **"Add Item"**
5. ✅ Item should appear in the table

### Test 5: Backend Logging

1. Go to Render dashboard
2. Select `landscape-backend` service
3. Click **"Logs"**
4. ✅ Should see logs like:
   ```
   [Database] Connected to PostgreSQL via DATABASE_URL
   [Server] Running on port 3000
   [CORS] Enabled for all origins with credentials
   ```

---

## Troubleshooting

### Issue: "CORS error" in browser console

**Solution:**
1. Verify `VITE_API_URL` is set correctly in Vercel
2. Check backend has CORS enabled (should see `[CORS] Enabled...` in logs)
3. Ensure no trailing slash in `VITE_API_URL`

### Issue: "Cannot connect to database"

**Solution:**
1. Verify `DATABASE_URL` is set in Render
2. Check database is running: Go to Render → PostgreSQL service
3. Verify database credentials are correct
4. Backend will use mock mode if DB unavailable

### Issue: "Unauthorized" error on login

**Solution:**
1. Verify `VITE_APP_ID` and `OAUTH_SERVER_URL` are correct
2. Check `JWT_SECRET` is set in backend
3. Clear browser cookies and retry

### Issue: "Build failed" on Render

**Solution:**
1. Check Render build logs for errors
2. Verify all environment variables are set
3. Ensure `package.json` build script is correct
4. Try rebuilding: Render dashboard → Service → **"Manual Deploy"**

### Issue: "Build failed" on Vercel

**Solution:**
1. Check Vercel build logs for errors
2. Verify `VITE_*` environment variables are set
3. Ensure `pnpm` is available
4. Try redeploying: Vercel dashboard → Project → **"Redeploy"**

---

## Monitoring & Maintenance

### Daily Health Checks

```bash
# Backend health
curl https://landscape-backend.onrender.com/api/health

# Frontend availability
curl https://landscape-app.vercel.app
```

### View Logs

**Backend (Render):**
- Dashboard → `landscape-backend` → **"Logs"**

**Frontend (Vercel):**
- Dashboard → `landscape-app` → **"Deployments"** → Latest → **"Logs"**

### Update Code

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your message"
   git push origin main
   ```
3. Render and Vercel will automatically redeploy

---

## Production URLs

| Component | URL |
|-----------|-----|
| Frontend | `https://landscape-app.vercel.app` |
| Backend | `https://landscape-backend.onrender.com` |
| API Health | `https://landscape-backend.onrender.com/api/health` |
| Database | Render PostgreSQL (internal only) |

---

## Security Checklist

- [ ] GitHub repository is private
- [ ] All tokens regenerated and updated
- [ ] Environment variables set in both Render and Vercel
- [ ] No secrets committed to GitHub
- [ ] HTTPS enabled (automatic on both platforms)
- [ ] Database backups configured (Render)
- [ ] Monitoring alerts configured (optional)

---

## Support

For issues:
1. Check backend logs: Render dashboard → Logs
2. Check frontend logs: Vercel dashboard → Logs
3. Check browser console (F12)
4. Review [API.md](./API.md) for API details
5. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for more info

---

**Last Updated:** March 27, 2026
**Status:** Ready for Production Deployment
