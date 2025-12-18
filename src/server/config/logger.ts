import winston from 'winston';
import { env } from './env';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, requestId, userId, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      requestId,
      userId,
      ...meta
    });
  })
);

// Create logger instance
export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'community-events-api' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: env.NODE_ENV === 'production' 
        ? logFormat 
        : winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
    }),
    
    // File transports for production
    ...(env.NODE_ENV === 'production' ? [
      new winston.transports.File({ 
        filename: 'logs/error.log', 
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5
      }),
      new winston.transports.File({ 
        filename: 'logs/combined.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5
      })
    ] : [])
  ],
});

// Request ID middleware
export const requestIdMiddleware = (req: any, res: any, next: any) => {
  req.requestId = Math.random().toString(36).substring(2, 15);
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

// Logging middleware
export const loggingMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      requestId: req.requestId,
      userId: req.user?.id,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    };
    
    if (res.statusCode >= 400) {
      logger.error('HTTP Request Error', logData);
    } else if (duration > 1000) {
      logger.warn('Slow HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });
  
  next();
};

// Helper functions
export const logError = (message: string, error: Error, meta: any = {}) => {
  logger.error(message, {
    error: error.message,
    stack: error.stack,
    ...meta
  });
};

export const logInfo = (message: string, meta: any = {}) => {
  logger.info(message, meta);
};

export const logWarn = (message: string, meta: any = {}) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta: any = {}) => {
  logger.debug(message, meta);
};