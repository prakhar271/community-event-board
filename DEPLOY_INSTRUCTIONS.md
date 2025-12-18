# 🚀 Deployment Instructions

## Quick Deploy to Railway + Vercel (Recommended)

### Prerequisites
- GitHub account
- Railway account (https://railway.app)
- Vercel account (https://vercel.com)

---

## Part 1: Deploy Backend to Railway

### Step 1: Push to GitHub
```bash
# Already initialized! Just push:
git add .
git commit -m "Initial commit - ready for deployment"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Deploy to Railway

1. **Go to [railway.app](https://railway.app)** and sign in with GitHub
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Railway will detect the Dockerfile and start building

### Step 3: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will automatically create `DATABASE_URL` variable

### Step 4: Add Redis

1. Click **"+ New"** again
2. Select **"Database"** → **"Redis"**
3. Railway will automatically create `REDIS_URL` variable

### Step 5: Configure Environment Variables

In Railway, go to your API service → **Variables** tab and add:

```env
NODE_ENV=production
JWT_SECRET=your-super-secret-production-jwt-key-change-this
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
PLATFORM_FEE_PERCENTAGE=5
FREE_PLAN_MAX_EVENTS=3
FREE_PLAN_MAX_ATTENDEES=50
PREMIUM_PLAN_PRICE=29900
PRO_PLAN_PRICE=59900
```

### Step 6: Get Your API URL

1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy your Railway URL (e.g., `https://your-app.railway.app`)

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure build settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `src/client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### Step 2: Add Environment Variable

In Vercel, go to **Settings** → **Environment Variables** and add:

```env
VITE_API_BASE_URL=https://your-railway-app.railway.app
```

Replace with your actual Railway URL from Part 1, Step 6.

### Step 3: Deploy

1. Click **"Deploy"**
2. Wait for build to complete
3. Your frontend is live! 🎉

---

## Part 3: Connect Frontend to Backend

### Update API URL in Railway

1. Go back to Railway
2. Add environment variable:
   ```env
   API_BASE_URL=https://your-vercel-app.vercel.app
   ```
3. Railway will automatically redeploy

---

## 🎉 Your App is Live!

- **Frontend:** https://your-app.vercel.app
- **Backend API:** https://your-app.railway.app
- **Health Check:** https://your-app.railway.app/health

---

## Alternative: Deploy Everything to Railway

If you prefer to deploy both frontend and backend to Railway:

1. Deploy backend as described above
2. Add another service for the client:
   - Use `Dockerfile.client`
   - Set root directory to `src/client`
3. Generate domains for both services

---

## Alternative: Deploy to DigitalOcean App Platform

### Cost: ~$25/month (Production Ready)

1. **Go to [digitalocean.com](https://www.digitalocean.com/products/app-platform)**
2. Click **"Create App"**
3. Connect your GitHub repository
4. DigitalOcean will detect your Docker setup
5. Add managed PostgreSQL and Redis databases
6. Configure environment variables
7. Deploy!

**Benefits:**
- Managed databases with backups
- Auto-scaling
- Built-in monitoring
- SSL certificates included
- Better for production traffic

---

## Post-Deployment Checklist

- [ ] Test user registration
- [ ] Test event creation
- [ ] Test payment flow (use Razorpay test mode)
- [ ] Test email notifications
- [ ] Set up custom domain (optional)
- [ ] Configure SSL certificate
- [ ] Set up monitoring/alerts
- [ ] Configure backups
- [ ] Update CORS settings if needed

---

## Troubleshooting

### Backend won't start
- Check Railway logs for errors
- Verify all environment variables are set
- Ensure DATABASE_URL and REDIS_URL are correct

### Frontend can't connect to backend
- Verify VITE_API_BASE_URL is set correctly
- Check CORS settings in backend
- Ensure Railway API is running

### Database connection errors
- Wait for PostgreSQL to fully initialize (2-3 minutes)
- Check DATABASE_URL format
- Verify network connectivity

---

## Need Help?

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Check application logs in respective platforms

---

## Alternative: Deploy to Render.com (All-in-One Platform)

### Cost: $7/month for backend + Free frontend
### Time: 10-15 minutes

Render.com is an excellent alternative that hosts both frontend and backend on one platform.

### Step 1: Push to GitHub
```bash
# Same as above - push your code to GitHub
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Deploy to Render

1. **Go to [render.com](https://render.com)** and sign up with GitHub
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will detect the `render.yaml` file and set up everything automatically:
   - PostgreSQL database
   - Redis cache
   - Backend API service
   - Frontend static site

### Step 3: Configure Environment Variables

Render will automatically configure most variables, but you may want to add:

```env
# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com

# Payments (optional)
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
```

### Step 4: Your App is Live!

- **Frontend**: https://your-app-name.onrender.com
- **Backend API**: https://your-api-name.onrender.com
- **Databases**: Automatically connected

### Render.com Benefits:
- ✅ All-in-one platform (simpler)
- ✅ Automatic database setup
- ✅ Built-in SSL certificates
- ✅ Automatic deployments from GitHub
- ✅ Good free tier for frontend
- ✅ Managed databases with backups

### Render.com Limitations:
- ⚠️ Backend costs $7/month (no free tier)
- ⚠️ Slower cold starts on free tier
- ⚠️ Less customization than Railway

---

## 🎯 Recommendation Summary

**For Learning/Portfolio:**
1. **Railway + Vercel** (Best free option)
2. **Render.com** (Simpler, but $7/month)

**For Production:**
1. **DigitalOcean App Platform** ($25/month, best features)
2. **Render.com** ($7-25/month, good balance)
3. **Railway + Vercel** (Can scale up as needed)

---