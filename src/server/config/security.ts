import helmet from 'helmet';
import { Application } from 'express';
import { env } from './env';

/**
 * Enhanced security configuration for the application
 */
export function configureSecurityMiddleware(app: Application): void {
  // Enhanced Helmet configuration
  app.use(
    helmet({
      // Content Security Policy
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
          ],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'", 'https://api.razorpay.com'],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: env.NODE_ENV === 'production' ? [] : null,
        },
      },

      // HTTP Strict Transport Security
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },

      // X-Frame-Options
      frameguard: {
        action: 'deny',
      },

      // X-Content-Type-Options
      noSniff: true,

      // X-XSS-Protection
      xssFilter: true,

      // Referrer Policy
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },

      // Hide X-Powered-By header
      hidePoweredBy: true,

      // DNS Prefetch Control
      dnsPrefetchControl: {
        allow: false,
      },

      // Note: expectCt is deprecated in newer versions of helmet
    })
  );
}

/**
 * Security headers for API responses
 */
export function addSecurityHeaders(app: Application): void {
  app.use((req, res, next) => {
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // XSS Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Feature Policy / Permissions Policy
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=()'
    );

    // Cache Control for sensitive endpoints
    if (req.path.includes('/api/auth') || req.path.includes('/api/payments')) {
      res.setHeader(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, private'
      );
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    next();
  });
}

/**
 * Input sanitization middleware
 */
export function sanitizeInput(app: Application): void {
  app.use((req, _res, next) => {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      sanitizeObject(req.query);
    }

    next();
  });
}

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj: any): void {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'string') {
        // Remove potentially dangerous characters
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
          .replace(/javascript:/gi, '') // Remove javascript: protocol
          .replace(/on\w+\s*=/gi, '') // Remove event handlers
          .trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  }
}

/**
 * Rate limiting configuration for different endpoint types
 */
export const securityConfig = {
  // File upload restrictions
  fileUpload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
    ],
    maxFiles: 5,
  },

  // Request size limits
  requestLimits: {
    json: '10mb',
    urlencoded: '10mb',
    raw: '10mb',
  },

  // Session security
  session: {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },

  // CORS configuration
  cors: {
    origin:
      env.NODE_ENV === 'production'
        ? ['https://community-events-frontend-m9ue.onrender.com']
        : ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Request-ID',
    ],
  },
};
