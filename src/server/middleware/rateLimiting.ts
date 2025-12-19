import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Rate limiting configurations for different endpoint types
export const rateLimitConfigs = {
  // Authentication endpoints - stricter limits
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
      success: false,
      error: 'Too many authentication attempts. Please try again in 15 minutes.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
      // Use IP + user agent for more specific rate limiting
      return `${req.ip}-${req.get('User-Agent')}`;
    }
  }),

  // Password reset - very strict
  passwordReset: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per hour
    message: {
      success: false,
      error: 'Too many password reset attempts. Please try again in 1 hour.',
      code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED'
    }
  }),

  // Event creation - moderate limits
  eventCreation: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 events per hour
    message: {
      success: false,
      error: 'Too many events created. Please try again later.',
      code: 'EVENT_CREATION_RATE_LIMIT_EXCEEDED'
    },
    keyGenerator: (req: Request) => {
      // Rate limit per user for authenticated endpoints
      return req.user?.id || req.ip;
    }
  }),

  // Registration endpoints - moderate limits
  registration: rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 20, // 20 registrations per 10 minutes
    message: {
      success: false,
      error: 'Too many registration attempts. Please try again in 10 minutes.',
      code: 'REGISTRATION_RATE_LIMIT_EXCEEDED'
    }
  }),

  // Search endpoints - lenient limits
  search: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 searches per minute
    message: {
      success: false,
      error: 'Too many search requests. Please slow down.',
      code: 'SEARCH_RATE_LIMIT_EXCEEDED'
    }
  }),

  // File upload - strict limits
  upload: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 uploads per 15 minutes
    message: {
      success: false,
      error: 'Too many file uploads. Please try again in 15 minutes.',
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED'
    }
  }),

  // Payment endpoints - very strict
  payment: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 payment attempts per hour
    message: {
      success: false,
      error: 'Too many payment attempts. Please try again in 1 hour.',
      code: 'PAYMENT_RATE_LIMIT_EXCEEDED'
    }
  }),

  // API documentation - lenient
  docs: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 50, // 50 requests per minute
    message: {
      success: false,
      error: 'Too many documentation requests.',
      code: 'DOCS_RATE_LIMIT_EXCEEDED'
    }
  }),

  // General API - default limits
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: {
      success: false,
      error: 'Too many requests. Please try again later.',
      code: 'GENERAL_RATE_LIMIT_EXCEEDED'
    }
  })
};

// Dynamic rate limiting based on user plan
export function createUserBasedRateLimit(
  baseLimits: { windowMs: number; max: number },
  planMultipliers: { free: number; premium: number; pro: number } = { free: 1, premium: 2, pro: 5 }
) {
  return rateLimit({
    windowMs: baseLimits.windowMs,
    max: (req: Request) => {
      const user = req.user as any;
      if (!user) return baseLimits.max;

      const plan = user.organizerProfile?.currentPlan || 'free';
      const multiplier = planMultipliers[plan as keyof typeof planMultipliers] || 1;
      
      return Math.floor(baseLimits.max * multiplier);
    },
    keyGenerator: (req: Request) => {
      const user = req.user as any;
      return user?.id || req.ip;
    },
    message: (req: Request) => {
      const user = req.user as any;
      const plan = user?.organizerProfile?.currentPlan || 'free';
      
      return {
        success: false,
        error: `Rate limit exceeded for ${plan} plan. Consider upgrading for higher limits.`,
        code: 'USER_RATE_LIMIT_EXCEEDED',
        plan
      };
    }
  });
}

// Skip rate limiting for certain conditions
export function skipRateLimit(req: Request): boolean {
  // Skip for health checks
  if (req.path === '/health') return true;
  
  // Skip for webhooks (they have their own validation)
  if (req.path.startsWith('/webhooks')) return true;
  
  // Skip for admin users in development
  if (process.env.NODE_ENV === 'development') {
    const user = req.user as any;
    if (user?.role === 'admin') return true;
  }
  
  return false;
}

// Enhanced rate limiting with Redis (for production)
export function createRedisRateLimit(config: any) {
  // This would use Redis for distributed rate limiting
  // For now, return the basic rate limiter
  return rateLimit({
    ...config,
    skip: skipRateLimit
  });
}

// Rate limit middleware factory
export function createRateLimit(type: keyof typeof rateLimitConfigs) {
  const config = rateLimitConfigs[type];
  
  return rateLimit({
    ...config,
    skip: skipRateLimit,
    onLimitReached: (req: Request, res: Response) => {
      console.warn(`Rate limit exceeded for ${type}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method
      });
    }
  });
}