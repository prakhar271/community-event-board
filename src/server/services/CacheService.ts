import { redis } from '../config/database';

// Hybrid Cache Service - Uses Redis when available, falls back to in-memory
class CacheService {
  private memoryCache: Map<string, { data: any; expiry: number }> = new Map();
  private maxSize: number = 1000; // Limit memory usage
  private isRedisAvailable: boolean = false;

  constructor() {
    // Don't check Redis availability in constructor
    // It will be checked when first used
  }

  async initialize(): Promise<void> {
    await this.checkRedisAvailability();
  }

  private async checkRedisAvailability(): Promise<void> {
    if (redis) {
      try {
        // Try to connect if not already connected
        if (!redis.isOpen) {
          await redis.connect();
        }
        
        // Check if Redis is responsive
        await redis.ping();
        this.isRedisAvailable = true;
        console.log('✅ CacheService: Redis is available and connected');
      } catch (error) {
        console.warn('⚠️ CacheService: Redis connection/ping failed, using memory cache');
        console.warn('   Error:', (error as Error).message);
        this.isRedisAvailable = false;
      }
    } else {
      console.log('ℹ️ CacheService: Using in-memory cache (Redis not configured)');
      this.isRedisAvailable = false;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    const serializedValue = JSON.stringify(value);

    if (this.isRedisAvailable && redis) {
      try {
        await redis.setEx(key, ttlSeconds, serializedValue);
        console.log(`📦 Redis SET: ${key} (TTL: ${ttlSeconds}s)`);
        return;
      } catch (error) {
        console.warn('Redis SET failed, falling back to memory:', error);
        this.isRedisAvailable = false;
      }
    }

    // Fallback to memory cache
    this.setMemory(key, value, ttlSeconds);
  }

  async get(key: string): Promise<any | null> {
    if (this.isRedisAvailable && redis) {
      try {
        const value = await redis.get(key);
        if (value) {
          console.log(`📦 Redis GET: ${key} (hit)`);
          return JSON.parse(value);
        }
        console.log(`📦 Redis GET: ${key} (miss)`);
        return null;
      } catch (error) {
        console.warn('Redis GET failed, falling back to memory:', error);
        this.isRedisAvailable = false;
      }
    }

    // Fallback to memory cache
    return this.getMemory(key);
  }

  async delete(key: string): Promise<void> {
    if (this.isRedisAvailable && redis) {
      try {
        await redis.del(key);
        console.log(`📦 Redis DEL: ${key}`);
        return;
      } catch (error) {
        console.warn('Redis DEL failed, falling back to memory:', error);
        this.isRedisAvailable = false;
      }
    }

    // Fallback to memory cache
    this.memoryCache.delete(key);
  }

  async clear(): Promise<void> {
    if (this.isRedisAvailable && redis) {
      try {
        await redis.flushDb();
        console.log('📦 Redis: Cache cleared');
        return;
      } catch (error) {
        console.warn('Redis CLEAR failed, falling back to memory:', error);
        this.isRedisAvailable = false;
      }
    }

    // Fallback to memory cache
    this.memoryCache.clear();
  }

  // Memory cache methods (fallback)
  private setMemory(key: string, value: any, ttlSeconds: number): void {
    // Auto-cleanup if cache is too large
    if (this.memoryCache.size >= this.maxSize) {
      this.cleanup();
    }

    const expiry = Date.now() + (ttlSeconds * 1000);
    this.memoryCache.set(key, { data: value, expiry });
    console.log(`💾 Memory SET: ${key} (TTL: ${ttlSeconds}s)`);
  }

  private getMemory(key: string): any | null {
    const item = this.memoryCache.get(key);
    
    if (!item) {
      console.log(`💾 Memory GET: ${key} (miss)`);
      return null;
    }
    
    // Check if expired
    if (Date.now() > item.expiry) {
      this.memoryCache.delete(key);
      console.log(`💾 Memory GET: ${key} (expired)`);
      return null;
    }
    
    console.log(`💾 Memory GET: ${key} (hit)`);
    return item.data;
  }

  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, item] of this.memoryCache.entries()) {
      if (now > item.expiry) {
        this.memoryCache.delete(key);
        cleanedCount++;
      }
    }
    
    // If still too large, remove oldest entries
    if (this.memoryCache.size >= this.maxSize) {
      const keysToDelete = Array.from(this.memoryCache.keys()).slice(0, 100);
      keysToDelete.forEach(key => this.memoryCache.delete(key));
      cleanedCount += keysToDelete.length;
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 Memory cache cleanup: removed ${cleanedCount} items`);
    }
  }

  // Redis-specific methods
  async exists(key: string): Promise<boolean> {
    if (this.isRedisAvailable && redis) {
      try {
        const exists = await redis.exists(key);
        return exists === 1;
      } catch (error) {
        console.warn('Redis EXISTS failed:', error);
      }
    }

    // Fallback to memory cache
    const item = this.memoryCache.get(key);
    return item !== undefined && Date.now() <= item.expiry;
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    if (this.isRedisAvailable && redis) {
      try {
        await redis.expire(key, ttlSeconds);
        return;
      } catch (error) {
        console.warn('Redis EXPIRE failed:', error);
      }
    }

    // For memory cache, we'd need to update the expiry
    const item = this.memoryCache.get(key);
    if (item) {
      item.expiry = Date.now() + (ttlSeconds * 1000);
    }
  }

  async increment(key: string, amount: number = 1): Promise<number> {
    if (this.isRedisAvailable && redis) {
      try {
        return await redis.incrBy(key, amount);
      } catch (error) {
        console.warn('Redis INCR failed:', error);
      }
    }

    // Fallback to memory cache
    const current = this.getMemory(key) || 0;
    const newValue = current + amount;
    this.setMemory(key, newValue, 3600); // 1 hour default
    return newValue;
  }

  // High-level caching methods
  async cachePopularEvents(eventService: any): Promise<void> {
    try {
      const events = await eventService.getPopularEvents();
      await this.set('popular_events', events, 600); // 10 minutes
      console.log('📊 Cached popular events');
    } catch (error) {
      console.error('Failed to cache popular events:', error);
    }
  }

  async cacheUserSession(userId: string, sessionData: any): Promise<void> {
    await this.set(`session:${userId}`, sessionData, 3600); // 1 hour
  }

  async getUserSession(userId: string): Promise<any | null> {
    return await this.get(`session:${userId}`);
  }

  async cacheEventDetails(eventId: string, eventData: any): Promise<void> {
    await this.set(`event:${eventId}`, eventData, 1800); // 30 minutes
  }

  async getCachedEventDetails(eventId: string): Promise<any | null> {
    return await this.get(`event:${eventId}`);
  }

  async cacheSearchResults(query: string, results: any): Promise<void> {
    const cacheKey = `search:${Buffer.from(query).toString('base64')}`;
    await this.set(cacheKey, results, 300); // 5 minutes
  }

  async getCachedSearchResults(query: string): Promise<any | null> {
    const cacheKey = `search:${Buffer.from(query).toString('base64')}`;
    return await this.get(cacheKey);
  }

  // Rate limiting support
  async incrementRateLimit(identifier: string, windowMs: number): Promise<number> {
    const key = `rate_limit:${identifier}`;
    const count = await this.increment(key, 1);
    
    // Set expiry only on first increment
    if (count === 1) {
      await this.expire(key, Math.ceil(windowMs / 1000));
    }
    
    return count;
  }

  // Analytics caching
  async cacheAnalytics(key: string, data: any, ttlSeconds: number = 3600): Promise<void> {
    await this.set(`analytics:${key}`, data, ttlSeconds);
  }

  async getCachedAnalytics(key: string): Promise<any | null> {
    return await this.get(`analytics:${key}`);
  }

  // Health check
  async healthCheck(): Promise<{ redis: boolean; memory: boolean; stats: any }> {
    const stats = {
      memorySize: this.memoryCache.size,
      redisAvailable: this.isRedisAvailable,
      timestamp: new Date().toISOString()
    };

    let redisHealth = false;
    if (this.isRedisAvailable && redis) {
      try {
        await redis.ping();
        redisHealth = true;
      } catch (error) {
        console.warn('Redis health check failed:', error);
        this.isRedisAvailable = false;
      }
    }

    return {
      redis: redisHealth,
      memory: true,
      stats
    };
  }
}

export const cacheService = new CacheService();

// Middleware for caching API responses
export const cacheMiddleware = (ttlSeconds: number = 300) => {
  return async (req: any, res: any, next: any) => {
    const key = `api:${req.method}:${req.originalUrl}`;
    
    try {
      const cached = await cacheService.get(key);
      
      if (cached) {
        console.log(`✅ Cache hit: ${key}`);
        return res.json(cached);
      }
      
      // Override res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = (data: any) => {
        // Cache the response asynchronously (don't wait)
        cacheService.set(key, data, ttlSeconds).catch(error => {
          console.warn('Failed to cache response:', error);
        });
        return originalJson(data);
      };
      
      next();
    } catch (error) {
      console.warn('Cache middleware error:', error);
      next();
    }
  };
};

// Specific cache middleware for different endpoints
export const cacheEventDetails = cacheMiddleware(1800); // 30 minutes
export const cacheEventList = cacheMiddleware(300); // 5 minutes
export const cacheUserProfile = cacheMiddleware(600); // 10 minutes
export const cacheAnalytics = cacheMiddleware(3600); // 1 hour