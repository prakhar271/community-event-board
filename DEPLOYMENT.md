# Community Event Board - Deployment Guide

## 🚀 Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- PostgreSQL 15+ (if running without Docker)
- Redis 6+ (if running without Docker)

### 1. Environment Setup

```bash
# Clone the repository
git clone <repository-url>
cd community-event-board

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 2. Docker Deployment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The application will be available at:
- Frontend: http://localhost:3001
- API: http://localhost:3000
- Health Check: http://localhost:3000/health

### 3. Local Development

```bash
# Install dependencies
npm install

# Start PostgreSQL and Redis (if not using Docker)
# Update .env with local database URLs

# Start development servers
npm run dev
```

## 🔧 Configuration

### Required Environment Variables

```bash
# Server Configuration
NODE_ENV=production
PORT=3000
API_BASE_URL=https://yourdomain.com

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/community_events
REDIS_URL=redis://localhost:6379

# JWT Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@communityevents.com

# File Storage
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp

# External Services
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token

# Platform Settings
PLATFORM_FEE_PERCENTAGE=5
FREE_PLAN_MAX_EVENTS=3
PREMIUM_PLAN_PRICE=29900  # ₹299 in paise
PRO_PLAN_PRICE=59900      # ₹599 in paise
```

## 🏗️ Production Deployment

### 1. Cloud Infrastructure (AWS/GCP/Azure)

#### Database Setup
```bash
# PostgreSQL with SSL
DATABASE_URL=postgresql://username:password@your-db-host:5432/community_events?sslmode=require

# Redis with authentication
REDIS_URL=redis://username:password@your-redis-host:6379
```

#### Container Deployment
```bash
# Build production images
docker build -f Dockerfile.api -t community-events-api .
docker build -f Dockerfile.client -t community-events-client .

# Push to container registry
docker tag community-events-api your-registry/community-events-api:latest
docker push your-registry/community-events-api:latest
```

### 2. Kubernetes Deployment

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: community-events-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: community-events-api
  template:
    metadata:
      labels:
        app: community-events-api
    spec:
      containers:
      - name: api
        image: your-registry/community-events-api:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### 3. Load Balancer & SSL

```nginx
# nginx.conf for production
upstream api_backend {
    server api1:3000;
    server api2:3000;
    server api3:3000;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location /api {
        proxy_pass http://api_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }
}
```

## 📊 Monitoring & Logging

### Health Checks
- API Health: `GET /health`
- Database: Connection pooling with health checks
- Redis: Connection monitoring
- External Services: Circuit breakers

### Logging
```javascript
// Winston logging configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Metrics
- API response times
- Database query performance
- Payment success rates
- User registration/login rates
- Event creation/registration metrics

## 🔒 Security Checklist

### Application Security
- [x] JWT token authentication
- [x] Password hashing with bcrypt
- [x] Input validation and sanitization
- [x] Rate limiting
- [x] CORS configuration
- [x] Helmet.js security headers
- [x] SQL injection prevention
- [x] XSS protection

### Infrastructure Security
- [ ] SSL/TLS certificates
- [ ] Database encryption at rest
- [ ] Redis authentication
- [ ] VPC/Network security groups
- [ ] Regular security updates
- [ ] Backup encryption
- [ ] Access logging

### Payment Security
- [x] PCI DSS compliance (via Razorpay)
- [x] Webhook signature verification
- [x] Secure API key management
- [x] Transaction logging
- [x] Refund processing

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and push Docker images
        run: |
          docker build -f Dockerfile.api -t ${{ secrets.REGISTRY }}/api:${{ github.sha }} .
          docker push ${{ secrets.REGISTRY }}/api:${{ github.sha }}
      - name: Deploy to production
        run: |
          # Deploy to your cloud provider
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Load balancer with multiple API instances
- Database read replicas
- Redis clustering
- CDN for static assets

### Performance Optimization
- Database indexing strategy
- Query optimization
- Caching layers (Redis, CDN)
- Image optimization and compression
- API response compression

### Monitoring & Alerting
- Application performance monitoring (APM)
- Database performance monitoring
- Error tracking (Sentry, Rollbar)
- Uptime monitoring
- Custom business metrics

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check database connectivity
   docker-compose exec postgres psql -U postgres -d community_events -c "SELECT 1;"
   ```

2. **Redis Connection Issues**
   ```bash
   # Test Redis connection
   docker-compose exec redis redis-cli ping
   ```

3. **Payment Webhook Failures**
   ```bash
   # Check webhook logs
   docker-compose logs api | grep webhook
   ```

4. **High Memory Usage**
   ```bash
   # Monitor container resources
   docker stats
   ```

### Log Analysis
```bash
# API logs
docker-compose logs -f api

# Database logs
docker-compose logs -f postgres

# Application errors
grep "ERROR" logs/combined.log | tail -50
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section above
2. Review application logs
3. Verify environment configuration
4. Check external service status (Razorpay, email provider)
5. Contact support team with detailed error logs

---

**Security Note**: Never commit sensitive environment variables to version control. Use secure secret management systems in production.