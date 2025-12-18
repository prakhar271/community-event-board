# 🚀 Render.com Deployment Guide

## ✅ Prerequisites Complete
- [x] Code pushed to GitHub: https://github.com/prakhar271/community-event-board
- [x] `render.yaml` configuration file created
- [x] All services and databases configured

## 🎯 One-Click Deployment Steps

### Step 1: Deploy to Render
1. **Go to [render.com](https://render.com)**
2. **Sign up/Sign in with GitHub**
3. **Click "New" → "Blueprint"**
4. **Connect your GitHub account** (if not already connected)
5. **Select repository:** `prakhar271/community-event-board`
6. **Click "Connect"**

### Step 2: Review Configuration
Render will automatically detect your `render.yaml` and show:

**Services to be created:**
- ✅ **Backend API** (`community-events-api`) - $7/month
- ✅ **Frontend** (`community-events-frontend`) - FREE
- ✅ **PostgreSQL Database** (`community-events-db`) - FREE (limited)
- ✅ **Redis Cache** (`community-events-redis`) - FREE (limited)

**Total Cost: $7/month** (just for the backend service!)

### Step 3: Deploy
1. **Review the services** in the blueprint
2. **Click "Create New Resources"**
3. **Wait for deployment** (5-10 minutes)

Render will automatically:
- Build your Docker containers
- Set up databases
- Configure environment variables
- Connect all services
- Generate SSL certificates

## 🌐 Your Live URLs

After deployment completes, you'll get:

**Frontend:** `https://community-events-frontend.onrender.com`
**Backend API:** `https://community-events-api.onrender.com`
**Health Check:** `https://community-events-api.onrender.com/health`

## ⚙️ Optional: Add Email Service

If you want email notifications, add these environment variables to your API service:

1. **Go to your API service dashboard**
2. **Click "Environment"**
3. **Add these variables:**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
```

## 💳 Optional: Add Payment Service

For Razorpay integration, add:

```env
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
```

## 🧪 Testing Your Deployment

### 1. Health Check
Visit: `https://community-events-api.onrender.com/health`
Should return: `{"status": "ok", "timestamp": "..."}`

### 2. Frontend
Visit: `https://community-events-frontend.onrender.com`
Should show your Community Event Board homepage

### 3. Database Connection
Try registering a new user - this tests:
- Frontend → Backend communication
- Database connectivity
- Password hashing
- JWT token generation

### 4. Full Flow Test
1. Register a new account
2. Login with credentials
3. Create a test event
4. View events list
5. Check event details

## 🔧 Troubleshooting

### Backend won't start:
- Check service logs in Render dashboard
- Verify all environment variables are set
- Ensure databases are running (green status)

### Frontend shows errors:
- Check if `VITE_API_BASE_URL` is correctly set
- Verify backend is healthy
- Check browser console for errors

### Database connection errors:
- Wait 2-3 minutes for PostgreSQL to fully initialize
- Check DATABASE_URL in environment variables
- Verify database service is running

### Build failures:
- Check build logs in Render dashboard
- Verify Dockerfile.api is correct
- Ensure all dependencies are in package.json

## 📊 Render.com Benefits

✅ **All-in-One Platform** - Everything in one dashboard
✅ **Automatic SSL** - HTTPS enabled by default
✅ **Managed Databases** - Backups and monitoring included
✅ **Auto-Deploy** - Deploys on every git push
✅ **Scaling** - Easy to scale up as you grow
✅ **Monitoring** - Built-in logs and metrics
✅ **Custom Domains** - Easy to add your own domain

## 🎉 Success!

Once deployed, your Community Event Board will be:
- **Live and accessible** worldwide
- **Secure** with HTTPS
- **Scalable** and production-ready
- **Backed up** automatically
- **Monitored** by Render

**Estimated deployment time:** 10-15 minutes
**Total monthly cost:** ~$21 (includes managed databases)

---

## 🆘 Need Help?

- **Render Docs:** https://render.com/docs
- **Check service logs** in Render dashboard
- **Monitor resource usage** in Render dashboard
- **Contact Render support** if needed

Your app will be production-ready with enterprise-grade infrastructure! 🚀