// FREE In-Memory Cache (No Redis needed for small scale)
class CacheService {
  private cache: Map<string, { data: any; expiry: number }> = new Map();
  private maxSize: number = 1000; // Limit memory usage

  set(key: string, value: any, ttlSeconds: number = 300): void {
    // Auto-cleanup if cache is too large
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    const expiry = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data: value, expiry });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
    
    // If still too large, remove oldest entries
    if (this.cache.size >= this.maxSize) {
      const keysToDelete = Array.from(this.cache.keys()).slice(0, 100);
      keysToDelete.forEach(key => this.cache.delete(key));
    }
  }

  // Cache popular events
  async cachePopularEvents(eventService: any): Promise<void> {
    const events = await eventService.getPopularEvents();
    this.set('popular_events', events, 600); // 10 minutes
  }

  // Cache user sessions
  cacheUserSession(userId: string, sessionData: any): void {
    this.set(`session:${userId}`, sessionData, 3600); // 1 hour
  }
}

export const cacheService = new CacheService();

// Middleware for caching API responses
export const cacheMiddleware = (ttlSeconds: number = 300) => {
  return (req: any, res: any, next: any) => {
    const key = `api:${req.method}:${req.originalUrl}`;
    const cached = cacheService.get(key);
    
    if (cached) {
      console.log(`✅ Cache hit: ${key}`);
      return res.json(cached);
    }
    
    // Override res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (data: any) => {
      cacheService.set(key, data, ttlSeconds);
      return originalJson(data);
    };
    
    next();
  };
};