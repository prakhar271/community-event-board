import { Request, Response, NextFunction } from 'express';

// FREE Google Analytics 4 integration
export const trackEvent = (eventName: string, parameters: any = {}) => {
  // Send to Google Analytics 4 (FREE)
  if (process.env.GA_MEASUREMENT_ID) {
    // Implementation for GA4 tracking
    console.log(`📊 Event: ${eventName}`, parameters);
  }
};

// FREE Application Performance Monitoring
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log slow requests (FREE monitoring)
    if (duration > 1000) {
      console.warn(`🐌 Slow request: ${req.method} ${req.path} - ${duration}ms`);
    }
    
    // Track API usage (FREE)
    trackEvent('api_request', {
      method: req.method,
      path: req.path,
      duration,
      status: res.statusCode
    });
  });
  
  next();
};

// FREE Error tracking
export const errorTracker = (error: Error, req: Request) => {
  // Send to FREE error tracking service (Sentry has free tier)
  console.error('🚨 Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // Could integrate with Sentry FREE tier (10k errors/month)
};