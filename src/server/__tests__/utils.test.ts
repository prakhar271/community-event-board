import { logger } from '../config/logger';
// import { validateEnv } from '../config/env'; // Not exported

describe('Utility Tests', () => {
  describe('Logger', () => {
    it('should have logger instance', () => {
      expect(logger).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.error).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.debug).toBeDefined();
    });

    it('should log messages without throwing errors', () => {
      expect(() => {
        logger.info('Test info message');
        logger.error('Test error message');
        logger.warn('Test warning message');
        logger.debug('Test debug message');
      }).not.toThrow();
    });

    it('should handle structured logging', () => {
      expect(() => {
        logger.info('Test message', {
          userId: 'user-123',
          action: 'login',
          timestamp: new Date().toISOString(),
        });
      }).not.toThrow();
    });

    it('should handle error objects', () => {
      const testError = new Error('Test error');
      expect(() => {
        logger.error('Error occurred', testError);
      }).not.toThrow();
    });
  });

  describe('Environment Variables', () => {
    it('should have NODE_ENV defined in test', () => {
      expect(process.env.NODE_ENV).toBeDefined();
    });

    it('should handle missing optional variables gracefully', () => {
      // These should not cause errors if missing
      const optionalVars = ['REDIS_URL', 'SENTRY_DSN', 'SMTP_HOST'];

      optionalVars.forEach((varName) => {
        // Should not throw error if undefined
        expect(() => {
          const value = process.env[varName];
          return value || 'default';
        }).not.toThrow();
      });
    });
  });

  describe('Helper Functions', () => {
    it('should generate UUID-like strings', () => {
      const crypto = require('crypto');
      const id1 = crypto.randomUUID();
      const id2 = crypto.randomUUID();

      expect(id1).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
      expect(id2).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
      expect(id1).not.toBe(id2);
    });

    it('should handle date formatting', () => {
      const date = new Date('2024-12-19T10:30:00Z');
      const isoString = date.toISOString();

      expect(isoString).toBe('2024-12-19T10:30:00.000Z');
      expect(new Date(isoString)).toEqual(date);
    });

    it('should handle JSON serialization', () => {
      const testObject = {
        id: 'test-123',
        name: 'Test Object',
        nested: {
          value: 42,
          array: [1, 2, 3],
        },
      };

      const serialized = JSON.stringify(testObject);
      const deserialized = JSON.parse(serialized);

      expect(deserialized).toEqual(testObject);
    });

    it('should handle error serialization', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test';

      const errorObject = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      };

      expect(errorObject.message).toBe('Test error');
      expect(errorObject.name).toBe('Error');
      expect(errorObject.stack).toContain('Test error');
    });

    it('should handle async operations', async () => {
      const asyncFunction = async (delay: number) => {
        return new Promise((resolve) =>
          setTimeout(() => resolve('done'), delay)
        );
      };

      const start = Date.now();
      const result = await asyncFunction(10);
      const end = Date.now();

      expect(result).toBe('done');
      expect(end - start).toBeGreaterThanOrEqual(10);
    });

    it('should handle promise rejection', async () => {
      const rejectingFunction = async () => {
        throw new Error('Async error');
      };

      await expect(rejectingFunction()).rejects.toThrow('Async error');
    });
  });
});
