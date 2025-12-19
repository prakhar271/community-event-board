import { cacheService } from '../services/CacheService';

// Mock Redis
jest.mock('../config/database', () => ({
  redis: null, // Force memory cache for testing
}));

describe('CacheService', () => {
  beforeEach(async () => {
    await cacheService.clear();
  });

  describe('Basic Operations', () => {
    it('should set and get values', async () => {
      await cacheService.set('test:key', 'test value', 60);
      const value = await cacheService.get('test:key');
      expect(value).toBe('test value');
    });

    it('should return null for non-existent keys', async () => {
      const value = await cacheService.get('non:existent');
      expect(value).toBeNull();
    });

    it('should delete keys', async () => {
      await cacheService.set('test:delete', 'value', 60);
      await cacheService.delete('test:delete');
      const value = await cacheService.get('test:delete');
      expect(value).toBeNull();
    });

    it('should clear all cache', async () => {
      await cacheService.set('test:1', 'value1', 60);
      await cacheService.set('test:2', 'value2', 60);
      await cacheService.clear();

      const value1 = await cacheService.get('test:1');
      const value2 = await cacheService.get('test:2');

      expect(value1).toBeNull();
      expect(value2).toBeNull();
    });
  });

  describe('TTL and Expiration', () => {
    it('should expire keys after TTL', async () => {
      await cacheService.set('test:expire', 'value', 0.1); // 0.1 seconds

      // Should exist immediately
      let value = await cacheService.get('test:expire');
      expect(value).toBe('value');

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should be expired
      value = await cacheService.get('test:expire');
      expect(value).toBeNull();
    });

    it('should check if key exists', async () => {
      await cacheService.set('test:exists', 'value', 60);

      const exists = await cacheService.exists('test:exists');
      expect(exists).toBe(true);

      const notExists = await cacheService.exists('test:not:exists');
      expect(notExists).toBe(false);
    });
  });

  describe('Increment Operations', () => {
    it('should increment numeric values', async () => {
      const count1 = await cacheService.increment('test:counter', 1);
      expect(count1).toBe(1);

      const count2 = await cacheService.increment('test:counter', 5);
      expect(count2).toBe(6);
    });

    it('should increment from existing value', async () => {
      await cacheService.set('test:existing', 10, 60);
      const count = await cacheService.increment('test:existing', 3);
      expect(count).toBe(13);
    });
  });

  describe('High-level Cache Methods', () => {
    it('should cache user session', async () => {
      const sessionData = { userId: '123', role: 'user' };
      await cacheService.cacheUserSession('user123', sessionData);

      const cached = await cacheService.getUserSession('user123');
      expect(cached).toEqual(sessionData);
    });

    it('should cache event details', async () => {
      const eventData = { id: 'event123', title: 'Test Event' };
      await cacheService.cacheEventDetails('event123', eventData);

      const cached = await cacheService.getCachedEventDetails('event123');
      expect(cached).toEqual(eventData);
    });

    it('should cache search results', async () => {
      const results = [{ id: '1', title: 'Event 1' }];
      await cacheService.cacheSearchResults('tech events', results);

      const cached = await cacheService.getCachedSearchResults('tech events');
      expect(cached).toEqual(results);
    });

    it('should cache analytics', async () => {
      const analyticsData = { views: 100, clicks: 50 };
      await cacheService.cacheAnalytics(
        'daily:2024-12-19',
        analyticsData,
        3600
      );

      const cached = await cacheService.getCachedAnalytics('daily:2024-12-19');
      expect(cached).toEqual(analyticsData);
    });
  });

  describe('Rate Limiting', () => {
    it('should increment rate limit counter', async () => {
      const count1 = await cacheService.incrementRateLimit('user123', 60000);
      expect(count1).toBe(1);

      const count2 = await cacheService.incrementRateLimit('user123', 60000);
      expect(count2).toBe(2);
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const health = await cacheService.healthCheck();

      expect(health).toHaveProperty('redis');
      expect(health).toHaveProperty('memory');
      expect(health).toHaveProperty('stats');
      expect(health.memory).toBe(true);
      expect(health.stats).toHaveProperty('memorySize');
      expect(health.stats).toHaveProperty('timestamp');
    });
  });

  describe('Complex Data Types', () => {
    it('should handle objects', async () => {
      const obj = { name: 'Test', count: 42, active: true };
      await cacheService.set('test:object', obj, 60);

      const cached = await cacheService.get('test:object');
      expect(cached).toEqual(obj);
    });

    it('should handle arrays', async () => {
      const arr = [1, 2, 3, 'test', { nested: true }];
      await cacheService.set('test:array', arr, 60);

      const cached = await cacheService.get('test:array');
      expect(cached).toEqual(arr);
    });

    it('should handle null and undefined', async () => {
      await cacheService.set('test:null', null, 60);
      await cacheService.set('test:undefined', undefined, 60);

      const nullValue = await cacheService.get('test:null');
      const undefinedValue = await cacheService.get('test:undefined');

      expect(nullValue).toBeNull();
      expect(undefinedValue).toBeUndefined();
    });
  });
});
