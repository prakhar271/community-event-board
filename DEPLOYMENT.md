# 🚀 Deployment Guide

Complete guide for deploying Community Event Board to production.

## 🎯 **Quick Deploy (5 minutes)**

### **Option 1: Render.com (Recommended - FREE)**
1. **Fork Repository**: Fork this repo to your GitHub
2. **Connect Render**: Go to [render.com](https://render.com) → Connect GitHub
3. **One-Click Deploy**: Use included `render.yaml` blueprint
4. **Add Environment Variables**: See section below
5. **Done!** App will be live in 5-10 minutes

### **Option 2: Docker (Any Platform)**
```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build individual containers
docker build -f Dockerfile.api -t community-events-api .
docker build -f Dockerfile.client -t community-events-client .
```

## 📋 **Environment Variables**

Add these to your deployment platform:

### **Required Variables**
```bash
# Database (Required)
DATABASE_URL=postgresql://user:password@host:port/database_name

# Authentication (Required)  
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Server Configuration
NODE_ENV=production
PORT=10000
```

### **Optional Variables (Recommended)**
```bash
# Redis Cache (70% performance improvement)
REDIS_URL=redis://host:port

# Email Service (Real emails instead of console logs)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
FROM_EMAIL=noreply@yourdomain.com

# Error Tracking (Professional monitoring)
SENTRY_DSN=https://your-key@sentry.io/project-id

# Payment Processing (When ready for real payments)
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_live_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Rate Limiting & Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
BCRYPT_ROUNDS=12
```

## 🔧 **Platform-Specific Setup**

### **Render.com Setup**
1. **Create Services**:
   - Backend: Web Service (Docker)
   - Frontend: Static Site
   - Database: PostgreSQL
   - Cache: Redis (optional)

2. **Environment Variables**:
   - Go to service → Environment tab
   - Add all variables from above
   - Save changes (triggers redeploy)

3. **Custom Domain** (Optional):
   - Add domain in Render dashboard
   - Update DNS records
   - SSL automatically configured

### **Heroku Setup**
```bash
# Install Heroku CLI and login
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Add Redis (optional)
heroku addons:create heroku-redis:mini

# Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### **AWS/DigitalOcean/VPS Setup**
```bash
# 1. Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 2. Clone repository
git clone https://github.com/prakhar271/community-event-board.git
cd community-event-board

# 3. Set up environment
cp .env.example .env
# Edit .env with your values

# 4. Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# 5. Set up reverse proxy (Nginx)
# Configure SSL with Let's Encrypt
```

## 📊 **Production Monitoring Setup**

### **1. Sentry Error Tracking** (5 minutes - FREE)
```bash
# 1. Sign up: https://sentry.io/signup/
# 2. Create Node.js project
# 3. Copy DSN: https://abc@sentry.io/123
# 4. Add to environment: SENTRY_DSN=your-dsn
# 5. Redeploy - errors now tracked professionally
```

### **2. UptimeRobot Monitoring** (5 minutes - FREE)
```bash
# 1. Sign up: https://uptimerobot.com/
# 2. Add HTTP monitor: https://your-api-url/health
# 3. Set monitoring interval: 5 minutes
# 4. Add email alerts
# 5. Get 24/7 uptime monitoring
```

### **3. Gmail SMTP Email** (5 minutes - FREE)
```bash
# 1. Enable 2FA on Gmail account
# 2. Generate App Password: https://myaccount.google.com/apppasswords
# 3. Add SMTP environment variables (see above)
# 4. Redeploy - real emails now working
```

## 🔍 **Health Checks & Verification**

### **Verify Deployment**
```bash
# 1. Check health endpoint
curl https://your-api-url/health

# Expected response:
{
  "success": true,
  "message": "Community Event Board API is running",
  "timestamp": "2024-12-18T...",
  "version": "1.0.0"
}

# 2. Check frontend
# Visit your frontend URL - should load React app

# 3. Check database connection
# Look for "✅ Connected to PostgreSQL" in logs

# 4. Check Redis (if configured)
# Look for "✅ Connected to Redis" in logs
```

### **Test Core Features**
1. **User Registration**: Create new account
2. **Email Verification**: Check email delivery
3. **Event Creation**: Create test event
4. **Real-time Updates**: Check Socket.IO connection
5. **Payment Flow**: Test with Razorpay test keys

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Database Connection Failed**
```bash
# Check DATABASE_URL format
DATABASE_URL=postgresql://username:password@host:port/database

# Verify database exists
psql $DATABASE_URL -c "SELECT version();"

# Check firewall/network access
```

#### **Build Failures**
```bash
# Check Node.js version (requires 18+)
node --version

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript compilation
npm run build:server
```

#### **Email Not Working**
```bash
# Verify Gmail App Password (not regular password)
# Check SMTP settings:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=16-character-app-password
```

#### **Real-time Features Not Working**
```bash
# Check Socket.IO connection in browser console
# Verify CORS settings for your domain
# Check WebSocket support on hosting platform
```

### **Performance Issues**
```bash
# Enable Redis caching
REDIS_URL=redis://your-redis-url

# Check database indexes
# Monitor API response times
# Review Sentry performance data
```

## 📈 **Scaling & Optimization**

### **Horizontal Scaling**
- Use load balancer (Nginx, Cloudflare)
- Multiple server instances
- Database read replicas
- CDN for static assets

### **Performance Optimization**
- Redis caching (already implemented)
- Database query optimization
- Image compression and CDN
- Gzip compression
- HTTP/2 support

### **Security Hardening**
- Regular dependency updates
- Security headers (already implemented)
- Rate limiting (already implemented)
- Input validation (already implemented)
- Regular security audits

## 💰 **Cost Optimization**

### **Free Tier Limits**
```bash
Render.com:
- 750 hours/month (enough for 1 app)
- 100GB bandwidth/month
- PostgreSQL: 1GB storage
- Redis: 25MB storage

Upgrade When:
- Need custom domain: $7/month
- Need more resources: $25/month
- Need advanced features: $85/month
```

### **Cost-Effective Scaling**
1. **Start Free**: Use all free tiers
2. **Add Monitoring**: Sentry + UptimeRobot (FREE)
3. **Custom Domain**: $10-15/year
4. **Scale Resources**: Upgrade hosting as needed
5. **Add Services**: Email, SMS, advanced analytics

## 🎉 **Success Checklist**

After deployment, verify:

- [ ] ✅ Frontend loads without errors
- [ ] ✅ Backend health check returns 200
- [ ] ✅ Database connection successful
- [ ] ✅ User registration works
- [ ] ✅ Email delivery working (if configured)
- [ ] ✅ Real-time features working
- [ ] ✅ Error tracking active (if configured)
- [ ] ✅ Uptime monitoring active (if configured)
- [ ] ✅ SSL certificate valid
- [ ] ✅ Performance acceptable (<500ms)

## 📞 **Support**

If you encounter issues:

1. **Check Logs**: Platform-specific log viewer
2. **Review Environment**: Verify all required variables
3. **Test Locally**: Ensure it works in development
4. **Check Documentation**: Review this guide
5. **Create Issue**: GitHub repository issues
6. **Community Help**: GitHub Discussions

---

**🚀 Your Community Event Board is now live and ready for users!**