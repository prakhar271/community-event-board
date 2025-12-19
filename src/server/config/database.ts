import { Pool, PoolConfig } from 'pg';
import { createClient } from 'redis';

// PostgreSQL configuration
const dbConfig: PoolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    }
  : {
      host: 'localhost',
      port: 5432,
      database: 'community_events',
      user: 'postgres',
      password: 'password',
      ssl: false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

export const db = new Pool(dbConfig);

// Redis configuration - completely optional
const redisUrl = process.env.REDIS_URL;
let redis: any = null;

// Create Redis client but don't connect yet
if (redisUrl && redisUrl !== 'undefined' && redisUrl.startsWith('redis://')) {
  redis = createClient({ url: redisUrl });

  redis.on('error', (err: Error) => {
    console.error('Redis Client Error:', err.message);
  });

  redis.on('connect', () => {
    console.log('✅ Connected to Redis');
  });

  redis.on('ready', () => {
    console.log('✅ Redis client ready');
  });
} else if (process.env.NODE_ENV === 'development') {
  // Try localhost in development
  redis = createClient({ url: 'redis://localhost:6379' });

  redis.on('error', (err: Error) => {
    console.warn('⚠️ Redis error:', err.message);
  });

  redis.on('connect', () => {
    console.log('✅ Connected to Redis (development)');
  });
} else {
  console.log('ℹ️ Redis not configured - running without cache');
  redis = null;
}

export { redis };

// Database initialization
export async function initializeDatabase(): Promise<void> {
  try {
    // In development mode, try to connect to database if available
    if (process.env.NODE_ENV === 'development') {
      console.log('🚧 Development mode: Attempting database connections...');
    }

    // Test PostgreSQL connection
    const client = await db.connect();
    client.release();
    console.log('✅ Connected to PostgreSQL');

    // Try to connect to Redis only if client exists
    if (redis) {
      try {
        if (!redis.isOpen) {
          await redis.connect();
          console.log('✅ Redis connected successfully');
        } else {
          console.log('✅ Redis already connected');
        }
      } catch (redisError) {
        console.warn(
          '⚠️ Redis connection failed:',
          (redisError as Error).message
        );
        console.warn('⚠️ Continuing without Redis cache');
        // Don't set redis to null, let CacheService handle fallback
      }
    } else {
      console.log('ℹ️ Redis not configured - continuing without cache');
    }

    // Run migrations
    await runMigrations();
  } catch (error) {
    console.error('Database initialization failed:', error);

    // In development, warn but don't crash
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '⚠️  Database connection failed in development mode. Some features may not work.'
      );
      return;
    }

    throw error;
  }
}

// Database migrations using node-pg-migrate
async function runMigrations(): Promise<void> {
  try {
    console.log('🔄 Running database migrations...');

    // Import and run migrations programmatically
    const { execSync } = require('child_process');

    // Run migrations
    execSync('npm run migrate:up', {
      stdio: 'inherit',
      env: { ...process.env },
    });

    console.log('✅ Database migrations completed');
  } catch (error) {
    console.error('❌ Migration failed:', error);

    // In development, warn but don't crash
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '⚠️  Migration failed in development mode. Some features may not work.'
      );
      return;
    }

    throw error;
  }
}

// Graceful shutdown
export async function closeDatabase(): Promise<void> {
  await db.end();

  if (redis) {
    try {
      if (redis.isOpen) {
        await redis.quit();
      }
    } catch (error) {
      console.warn('Redis disconnect error (safe to ignore):', error);
    }
  }

  console.log('Database connections closed');
}
