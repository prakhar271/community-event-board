import * as Sentry from '@sentry/node';
import { Express } from 'express';

export function initializeSentry(app: Express) {
  // Only initialize Sentry if DSN is provided
  if (process.env.SENTRY_DSN) {
    try {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        // Performance Monitoring
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        environment: process.env.NODE_ENV || 'development',
      });

      console.log('✅ Sentry error tracking initialized');
    } catch (error) {
      console.warn('⚠️ Failed to initialize Sentry:', error);
    }
  } else {
    console.log('⚠️ Sentry DSN not provided - error tracking disabled');
  }
}

export function addSentryErrorHandler(app: Express) {
  if (process.env.SENTRY_DSN) {
    try {
      // Simple error handler that captures exceptions
      app.use((error: any, req: any, res: any, next: any) => {
        Sentry.captureException(error);
        next(error);
      });
    } catch (error) {
      console.warn('⚠️ Failed to add Sentry error handler:', error);
    }
  }
}

export { Sentry };