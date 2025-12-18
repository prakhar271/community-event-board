# 🚀 Deployment Checklist

## ✅ Completed
- [x] Git repository initialized
- [x] Code committed
- [x] Pushed to GitHub: https://github.com/prakhar271/community-event-board

## 🔄 In Progress - Railway Backend

### Railway Setup:
- [ ] Go to https://railway.app
- [ ] Sign in with GitHub
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose `prakhar271/community-event-board`
- [ ] Wait for initial build to complete

### Add Databases:
- [ ] Click "+ New" → "Database" → "PostgreSQL"
- [ ] Click "+ New" → "Database" → "Redis"
- [ ] Verify DATABASE_URL and REDIS_URL are auto-created

### Configure Environment Variables:
Copy these to Railway → API Service → Variables:
```
NODE_ENV=production
JWT_SECRET=community-event-board-super-secret-jwt-key-prakhar271-production-2024
PLATFORM_FEE_PERCENTAGE=5
FREE_PLAN_MAX_EVENTS=3
FREE_PLAN_MAX_ATTENDEES=50
PREMIUM_PLAN_PRICE=29900
PRO_PLAN_PRICE=59900
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Generate Domain:
- [ ] Go to Settings → Networking
- [ ] Click "Generate Domain"
- [ ] Copy your Railway URL: ___________________________

## 🔄 Next - Vercel Frontend

### Vercel Setup:
- [ ] Go to https://vercel.com
- [ ] Sign in with GitHub
- [ ] Click "Add New" → "Project"
- [ ] Import `prakhar271/community-event-board`

### Build Configuration:
- [ ] Framework Preset: Vite
- [ ] Root Directory: `src/client`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`

### Environment Variable:
- [ ] Add: `VITE_API_BASE_URL` = `https://your-railway-url.railway.app`
- [ ] Click "Deploy"

## 🎉 Final Steps

### Test Your Deployment:
- [ ] Visit your Vercel URL
- [ ] Check Railway health endpoint: `https://your-railway-url.railway.app/health`
- [ ] Test user registration
- [ ] Test event creation
- [ ] Verify database persistence

### Optional Enhancements:
- [ ] Add custom domain to Vercel
- [ ] Configure email service (SMTP)
- [ ] Set up Razorpay for payments
- [ ] Enable monitoring/logging

## 📊 Your Live URLs

**Frontend:** https://_____________________________.vercel.app
**Backend API:** https://_____________________________.railway.app
**Health Check:** https://_____________________________.railway.app/health

---

## 🆘 Troubleshooting

### Backend won't start:
- Check Railway logs for errors
- Verify all environment variables are set
- Ensure PostgreSQL and Redis are running

### Frontend can't connect:
- Verify VITE_API_BASE_URL is correct
- Check browser console for CORS errors
- Ensure Railway API is deployed and healthy

### Database errors:
- Wait 2-3 minutes for PostgreSQL to initialize
- Check DATABASE_URL format in Railway
- Verify migrations ran successfully

---

**Estimated Total Time:** 10-15 minutes
**Total Cost:** FREE (with usage limits)
