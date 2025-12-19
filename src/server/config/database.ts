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

// Database initialization using direct SQL
async function runMigrations(): Promise<void> {
  try {
    console.log('🔄 Initializing database schema...');

    // Run initialization SQL directly
    await initializeSchema();

    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('❌ Schema initialization failed:', error);

    // In development, warn but don't crash
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '⚠️  Schema initialization failed in development mode. Some features may not work.'
      );
      return;
    }

    throw error;
  }
}

// Initialize database schema with direct SQL
async function initializeSchema(): Promise<void> {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // Create tables in correct order (dependencies first)

    // 1. Users table (no dependencies)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'resident',
        profile JSONB NOT NULL DEFAULT '{}',
        organizer_profile JSONB,
        is_verified BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Categories table (self-referencing, but no external dependencies)
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        parent_id UUID REFERENCES categories(id),
        icon VARCHAR(255),
        color VARCHAR(7),
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Events table (depends on users and categories)
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category_id UUID REFERENCES categories(id) NOT NULL,
        organizer_id UUID REFERENCES users(id) NOT NULL,
        location JSONB NOT NULL,
        schedule JSONB NOT NULL,
        capacity INTEGER NOT NULL,
        current_registrations INTEGER DEFAULT 0,
        is_paid BOOLEAN DEFAULT false,
        ticket_price INTEGER,
        status VARCHAR(50) DEFAULT 'draft',
        moderation_status VARCHAR(50) DEFAULT 'pending',
        tags TEXT[] DEFAULT '{}',
        images TEXT[] DEFAULT '{}',
        metadata JSONB DEFAULT '{}',
        search_vector TSVECTOR,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Registrations table (depends on users and events)
    await client.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'pending',
        quantity INTEGER DEFAULT 1,
        total_amount DECIMAL(10,2) DEFAULT 0,
        payment_id VARCHAR(255),
        attendee_details JSONB DEFAULT '[]',
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, event_id)
      );
    `);

    // Create indexes only after tables exist
    const indexes = [
      'CREATE INDEX IF NOT EXISTS users_email_index ON users (email);',
      'CREATE INDEX IF NOT EXISTS users_role_index ON users (role);',
      'CREATE INDEX IF NOT EXISTS categories_name_index ON categories (name);',
      'CREATE INDEX IF NOT EXISTS events_category_id_index ON events (category_id);',
      'CREATE INDEX IF NOT EXISTS events_organizer_id_index ON events (organizer_id);',
      'CREATE INDEX IF NOT EXISTS events_status_index ON events (status);',
      'CREATE INDEX IF NOT EXISTS registrations_user_id_index ON registrations (user_id);',
      'CREATE INDEX IF NOT EXISTS registrations_event_id_index ON registrations (event_id);',
    ];

    for (const indexSQL of indexes) {
      try {
        await client.query(indexSQL);
      } catch (indexError) {
        console.warn(
          `⚠️ Index creation warning: ${(indexError as Error).message}`
        );
        // Continue with other indexes even if one fails
      }
    }

    // Insert default categories (only if categories table is empty)
    const categoriesResult = await client.query(
      'SELECT COUNT(*) FROM categories'
    );
    const categoryCount = parseInt(categoriesResult.rows[0].count);

    if (categoryCount === 0) {
      const defaultCategories = [
        [
          'Technology',
          'Tech conferences, workshops, and meetups',
          'laptop',
          '#3B82F6',
        ],
        ['Music', 'Concerts, festivals, and music events', 'music', '#EF4444'],
        [
          'Sports',
          'Sports events, tournaments, and fitness',
          'trophy',
          '#10B981',
        ],
        [
          'Education',
          'Workshops, seminars, and learning events',
          'book',
          '#8B5CF6',
        ],
        [
          'Business',
          'Networking, conferences, and business events',
          'briefcase',
          '#F59E0B',
        ],
        [
          'Arts',
          'Art exhibitions, theater, and cultural events',
          'palette',
          '#EC4899',
        ],
        [
          'Food',
          'Food festivals, cooking classes, and dining',
          'utensils',
          '#F97316',
        ],
        ['Health', 'Health and wellness events', 'heart', '#06B6D4'],
        [
          'Community',
          'Local community gatherings and social events',
          'users',
          '#84CC16',
        ],
        [
          'Entertainment',
          'Movies, comedy shows, and entertainment',
          'film',
          '#6366F1',
        ],
      ];

      for (const [name, description, icon, color] of defaultCategories) {
        try {
          await client.query(
            'INSERT INTO categories (name, description, icon, color) VALUES ($1, $2, $3, $4) ON CONFLICT (name) DO NOTHING',
            [name, description, icon, color]
          );
        } catch (categoryError) {
          console.warn(
            `⚠️ Category insertion warning: ${(categoryError as Error).message}`
          );
        }
      }
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
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
