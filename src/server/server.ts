import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import http from 'http';
import { initializeDatabase, closeDatabase } from './config/database';

// Import configuration
import { env } from './config/env';
import { logger, requestIdMiddleware, loggingMiddleware } from './config/logger';
import { initializeSentry, addSentryErrorHandler } from './config/sentry';

// Import routes
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import registrationRoutes from './routes/registrations';
import reviewRoutes from './routes/reviews';
import paymentRoutes from './routes/payments';
import userRoutes from './routes/users';
import webhookRoutes from './routes/webhooks';

// Import services
import { performanceMiddleware, errorTracker } from './middleware/analytics';
import { cacheService } from './services/CacheService';
import { backgroundJobService } from './services/BackgroundJobService';
import { RealTimeService } from './services/RealTimeService';
import { TokenService } from './services/TokenService';

// Load environment variables
config();

const app = express();
const server = http.createServer(app);
const PORT = env.PORT;

// Initialize Sentry (must be first)
initializeSentry(app);

// Initialize real-time service
const realTimeService = new RealTimeService(server);
app.set('realTimeService', realTimeService);

// Initialize token service
const tokenService = new TokenService();
app.set('tokenService', tokenService);

// Request ID middleware (must be early)
app.use(requestIdMiddleware);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: env.NODE_ENV === 'production' 
    ? ['https://community-events-frontend-m9ue.onrender.com'] 
    : ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(loggingMiddleware);

// Performance monitoring middleware
app.use(performanceMiddleware);

// Health check endpoint
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    message: 'Community Event Board API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);

// Webhook routes (no auth required)
app.use('/webhooks', webhookRoutes);

// 404 handler
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Sentry error handler (must be before other error handlers)
addSentryErrorHandler(app);

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error);
  
  // Track error for monitoring
  errorTracker(error, req);
  
  res.status(error.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// Start server
async function startServer() {
  try {
    // Initialize database connections
    await initializeDatabase();
    
    // Initialize background jobs
    console.log('🔄 Starting background jobs...');
    backgroundJobService.initializeJobs({
      eventService: null, // Will be initialized when services are ready
      emailService: null
    });
    
    // Start HTTP server
    server.listen(PORT, () => {
      logger.info('Server started successfully', {
        port: PORT,
        environment: env.NODE_ENV,
        healthCheck: `http://localhost:${PORT}/health`
      });
      
      console.log(`🚀 Community Event Board API server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${env.NODE_ENV}`);
      console.log(`⚡ Real-time: Socket.IO enabled`);
      console.log(`🔒 Security: Enhanced with token rotation`);
      console.log(`📝 Logging: Structured JSON logs`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('HTTP server closed');
        
        try {
          await closeDatabase();
          console.log('Database connections closed');
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();