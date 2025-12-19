import request from 'supertest';
import express from 'express';
import { rateLimitConfigs, createRateLimit } from '../middleware/rateLimiting';
import { globalErrorHandler } from '../middleware/errorHandler';
import { performanceMiddleware } from '../middleware/analytics';

describe('Middleware Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('Rate Limiting Middleware', () => {
    it('should have rate limit configurations', () => {
      expect(rateLimitConfigs.auth).toBeDefined();
      expect(rateLimitConfigs.upload).toBeDefined();
      expect(rateLimitConfigs.general).toBeDefined();
      expect(rateLimitConfigs.search).toBeDefined();
      expect(rateLimitConfigs.payment).toBeDefined();
    });

    it('should have all expected rate limit types', () => {
      const expectedTypes = [
        'auth',
        'passwordReset',
        'eventCreation',
        'registration',
        'search',
        'upload',
        'payment',
        'docs',
        'general',
      ];

      expectedTypes.forEach((type) => {
        expect(
          rateLimitConfigs[type as keyof typeof rateLimitConfigs]
        ).toBeDefined();
      });
    });

    it('should create rate limit middleware', () => {
      const authRateLimit = createRateLimit('auth');
      expect(authRateLimit).toBeDefined();
      expect(typeof authRateLimit).toBe('function');
    });
  });

  describe('Error Handler Middleware', () => {
    it('should handle validation errors', async () => {
      app.get('/test-validation-error', (_req, _res, next) => {
        const error = new Error('Validation failed');
        (error as any).name = 'ValidationError';
        (error as any).details = [{ message: 'Field is required' }];
        next(error);
      });
      app.use(globalErrorHandler);

      const response = await request(app)
        .get('/test-validation-error')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Validation failed');
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle generic errors', async () => {
      app.get('/test-generic-error', (_req, _res, next) => {
        next(new Error('Something went wrong'));
      });
      app.use(globalErrorHandler);

      const response = await request(app)
        .get('/test-generic-error')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Something went wrong');
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('Performance Middleware', () => {
    it('should track request performance', async () => {
      // Set GA_MEASUREMENT_ID to enable tracking
      const originalGA = process.env.GA_MEASUREMENT_ID;
      process.env.GA_MEASUREMENT_ID = 'test-id';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      app.use(performanceMiddleware);
      app.get('/test-performance', (_req, res) => {
        res.json({ success: true });
      });

      await request(app).get('/test-performance').expect(200);

      // Performance middleware should log the request via trackEvent
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('📊 Event: api_request'),
        expect.any(Object)
      );

      consoleSpy.mockRestore();
      process.env.GA_MEASUREMENT_ID = originalGA;
    });

    it('should handle performance tracking errors gracefully', async () => {
      app.use(performanceMiddleware);
      app.get('/test-performance-error', (_req, res) => {
        res.json({ success: true });
      });

      await request(app).get('/test-performance-error').expect(200);
    });
  });

  describe('Middleware Integration', () => {
    it('should work with multiple middleware in sequence', async () => {
      app.use(performanceMiddleware);
      app.get('/test', (_req, res) => {
        res.json({ message: 'All middleware passed' });
      });
      app.use(globalErrorHandler);

      const response = await request(app).get('/test').expect(200);

      expect(response.body.message).toBe('All middleware passed');
    });
  });
});
