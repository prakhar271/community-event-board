import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export class AppError extends Error implements ApiError {
  public statusCode: number;
  public code: string;
  public details?: any;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Predefined error types
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

// Error response formatter
export function formatErrorResponse(error: ApiError, includeStack: boolean = false) {
  const response: any = {
    success: false,
    error: {
      message: error.message,
      code: error.code || 'INTERNAL_ERROR',
      statusCode: error.statusCode || 500
    }
  };

  if (error.details) {
    response.error.details = error.details;
  }

  if (includeStack && error.stack) {
    response.error.stack = error.stack;
  }

  return response;
}

// Zod error handler
export function handleZodError(error: ZodError): ValidationError {
  const details = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));

  return new ValidationError('Validation failed', details);
}

// Global error handler middleware
export function globalErrorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error
  logger.error('Global error handler', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  let apiError: ApiError;

  // Handle different error types
  if (error instanceof ZodError) {
    apiError = handleZodError(error);
  } else if (error instanceof AppError) {
    apiError = error;
  } else if (error.name === 'ValidationError') {
    apiError = new ValidationError(error.message);
  } else if (error.name === 'CastError') {
    apiError = new ValidationError('Invalid ID format');
  } else if (error.code === 'ECONNREFUSED') {
    apiError = new AppError('Service temporarily unavailable', 503, 'SERVICE_UNAVAILABLE');
  } else if (error.code === 'ENOTFOUND') {
    apiError = new AppError('External service not found', 502, 'EXTERNAL_SERVICE_ERROR');
  } else {
    // Unknown error
    apiError = new AppError(
      process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      500,
      'INTERNAL_ERROR'
    );
  }

  // Send error response
  const includeStack = process.env.NODE_ENV !== 'production';
  const errorResponse = formatErrorResponse(apiError, includeStack);

  res.status(apiError.statusCode || 500).json(errorResponse);
}

// Async error wrapper
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// 404 handler
export function notFoundHandler(req: Request, res: Response): void {
  const error = new NotFoundError('Route');
  const errorResponse = formatErrorResponse(error);
  res.status(404).json(errorResponse);
}