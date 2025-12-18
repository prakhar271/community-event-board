# ⚡ Setup Guide

Quick setup guide for Community Event Board - from development to production.

## 🚀 **Quick Start (5 minutes)**

### **1. Clone & Install**
```bash
git clone https://github.com/prakhar271/community-event-board.git
cd community-event-board
npm install
cd src/client && npm install && cd ../..
```

### **2. Environment Setup**
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```bash
# Minimum required for development
DATABASE_URL=postgresql://localhost:5432/community_events
JWT_SECRET=your-development-secret-key-here
NODE_ENV=development
```

### **3. Database Setup**
```bash
# Create PostgreSQL database
createdb community_events

# Tables are auto-created on first run
```

### **4. Start Development**
```bash
# Terminal 1 - Backend (port 3000)
npm run dev:server

# Terminal 2 - Frontend (port 3001)
npm run dev:client
```

Visit: **http://localhost:3001**

## 📋 **Production Setup (15 minutes)**

### **Step 1: Deploy to Render.com** (5 minutes)
1. Fork this repository to your GitHub
2. Go to [render.com](https://render.com) and connect GitHub
3. Use the `render.yaml` file for one-click deployment
4. Add environment variables (see below)
5. Wait 5-10 minutes for deployment

### **Step 2: Add Environment Variables** (5 minutes)
In Render dashboard, add these variables:

**Required:**
```bash
DATABASE_URL=postgresql://... (auto-provided by Render)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
NODE_ENV=production
```

**Optional (but recommended):**
```bash
# Redis Cache (70% performance boost)
REDIS_URL=redis://... (auto-provided by Render)

# Email Service (real emails)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
FROM_EMAIL=noreply@yourdomain.com

# Error Tracking
SENTRY_DSN=https://your-key@sentry.io/project-id
```

### **Step 3: Setup Monitoring** (5 minutes)
1. **Sentry**: https://sentry.io/signup/ → Create Node.js project → Copy DSN
2. **UptimeRobot**: https://uptimerobot.com/ → Add monitor for your API URL
3. **Gmail SMTP**: Enable 2FA → Generate App Password → Add to environment

## 🔧 **Development Tools**

### **Available Scripts**
```bash
npm run dev:server      # Backend development
npm run dev:client      # Frontend development
npm run build          # Production build
npm run test           # Run tests (7/7 passing)
npm run lint           # Code linting
npm start              # Production server
```

### **Database Management**
```bash
# Connect to local database
psql community_events

# Connect to production database
psql $DATABASE_URL

# View tables
\dt

# View users
SELECT * FROM users LIMIT 5;
```

### **Testing**
```bash
# Run all tests
npm test

# Run specific test
npm test PaymentService

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 🛠️ **Configuration Options**

### **Environment Variables Reference**
```bash
# Server
NODE_ENV=development|production
PORT=3000
API_BASE_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://host:port (optional)

# Authentication
JWT_SECRET=minimum-32-character-secret
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourdomain.com

# Payments
RAZORPAY_KEY_ID=rzp_test_or_live_key
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=webhook_secret

# Monitoring
SENTRY_DSN=https://key@sentry.io/project

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp

# Business Logic
PLATFORM_FEE_PERCENTAGE=5
FREE_PLAN_MAX_EVENTS=3
FREE_PLAN_MAX_ATTENDEES=50
PREMIUM_PLAN_PRICE=29900
PRO_PLAN_PRICE=59900
```

### **Feature Flags**
```bash
# Enable/disable features via environment
ENABLE_PAYMENTS=true
ENABLE_REAL_TIME=true
ENABLE_EMAIL=true
ENABLE_CACHING=true
ENABLE_ANALYTICS=true
```

## 🔍 **Verification & Testing**

### **Health Checks**
```bash
# API Health
curl http://localhost:3000/health

# Database Connection
curl http://localhost:3000/api/health/db

# Redis Connection (if enabled)
curl http://localhost:3000/api/health/redis
```

### **Feature Testing**
1. **User Registration**: Create account → Check email verification
2. **Event Management**: Create → Edit → Publish → Delete event
3. **Real-time**: Open multiple tabs → See live updates
4. **Payments**: Test with Razorpay test keys
5. **Performance**: Check API response times (<200ms)

### **Production Verification**
```bash
# Check deployment
curl https://your-api-url.onrender.com/health

# Test frontend
# Visit your frontend URL

# Check logs
# View logs in Render dashboard

# Monitor errors
# Check Sentry dashboard (if configured)
```

## 🚨 **Troubleshooting**

### **Common Development Issues**

#### **Port Already in Use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev:server
```

#### **Database Connection Failed**
```bash
# Check PostgreSQL is running
brew services start postgresql

# Check database exists
createdb community_events

# Verify connection string
psql $DATABASE_URL
```

#### **Module Not Found**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check Node.js version (requires 18+)
node --version
```

### **Common Production Issues**

#### **Build Failures**
- Check Node.js version compatibility
- Verify all environment variables are set
- Check TypeScript compilation errors

#### **Database Issues**
- Verify DATABASE_URL format
- Check database permissions
- Ensure database exists

#### **Performance Issues**
- Enable Redis caching
- Check database query performance
- Monitor API response times

## 📊 **Monitoring & Analytics**

### **Built-in Monitoring**
- Performance middleware (tracks slow requests)
- Error tracking (with Sentry integration)
- Request logging (structured JSON logs)
- Health check endpoints

### **External Monitoring**
- **Sentry**: Error tracking and performance monitoring
- **UptimeRobot**: 24/7 uptime monitoring
- **Render Metrics**: Built-in platform metrics
- **Database Metrics**: Connection pooling and query performance

### **Custom Analytics**
```bash
# View API analytics
GET /api/analytics/requests

# View event analytics
GET /api/analytics/events

# View user analytics
GET /api/analytics/users
```

## 🎯 **Next Steps**

After basic setup:

1. **Customize Branding**: Update logos, colors, and text
2. **Configure Payments**: Add Razorpay production keys
3. **Set Up Domain**: Add custom domain in Render
4. **Enable Monitoring**: Add Sentry and UptimeRobot
5. **Optimize Performance**: Enable Redis caching
6. **Add Features**: Extend functionality as needed

## 📞 **Getting Help**

- 📖 **Documentation**: Check README.md and DEPLOYMENT.md
- 🐛 **Issues**: Create GitHub issue with details
- 💬 **Discussions**: Use GitHub Discussions for questions
- 📧 **Email**: support@communityevents.com

---

**🎉 You're all set! Your Community Event Board is ready to go.**