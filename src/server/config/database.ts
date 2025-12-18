import { Pool, PoolConfig } from 'pg';
import { createClient } from 'redis';

// PostgreSQL configuration
const dbConfig: PoolConfig = {
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

// Redis configuration
export const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redis.on('error', (err) => {
  console.error('Redis Client Error', err);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

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
    console.log('Connected to PostgreSQL');
    
    await redis.connect();
    console.log('Connected to Redis');
    
    // Run migrations
    await runMigrations();
  } catch (error) {
    console.error('Database initialization failed:', error);
    
    // In development, warn but don't crash
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Database connection failed in development mode. Some features may not work.');
      return;
    }
    
    throw error;
  }
}

// Database migrations
async function runMigrations(): Promise<void> {
  const client = await db.connect();
  
  try {
    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    
    // Create tables if they don't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'resident',
        profile JSONB NOT NULL DEFAULT '{}',
        organizer_profile JSONB,
        is_verified BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        parent_id UUID REFERENCES categories(id),
        icon VARCHAR(255),
        color VARCHAR(7),
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        organizer_id UUID NOT NULL REFERENCES users(id),
        location JSONB NOT NULL,
        schedule JSONB NOT NULL,
        capacity INTEGER,
        registration_deadline TIMESTAMP,
        requirements JSONB DEFAULT '[]',
        images JSONB DEFAULT '[]',
        status VARCHAR(50) DEFAULT 'draft',
        is_paid BOOLEAN DEFAULT FALSE,
        ticket_price INTEGER,
        tags JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'confirmed',
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        checked_in TIMESTAMP,
        waitlist_position INTEGER,
        ticket_id UUID,
        notes TEXT,
        UNIQUE(event_id, user_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan_type VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        amount INTEGER NOT NULL,
        currency VARCHAR(3) DEFAULT 'INR',
        payment_method VARCHAR(100),
        razorpay_subscription_id VARCHAR(255),
        auto_renew BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id),
        event_id UUID REFERENCES events(id),
        subscription_id UUID REFERENCES subscriptions(id),
        type VARCHAR(50) NOT NULL,
        amount INTEGER NOT NULL,
        currency VARCHAR(3) DEFAULT 'INR',
        status VARCHAR(50) DEFAULT 'pending',
        payment_gateway_id VARCHAR(255) NOT NULL,
        payment_method VARCHAR(100),
        failure_reason TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
        price INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        qr_code TEXT NOT NULL,
        transaction_id UUID NOT NULL REFERENCES transactions(id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        is_verified_attendee BOOLEAN DEFAULT FALSE,
        status VARCHAR(50) DEFAULT 'published',
        flagged_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, user_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS moderation_flags (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        content_type VARCHAR(50) NOT NULL,
        content_id UUID NOT NULL,
        reporter_id UUID NOT NULL REFERENCES users(id),
        reason VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        reviewed_by UUID REFERENCES users(id),
        reviewed_at TIMESTAMP,
        action VARCHAR(50),
        action_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
      CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
      CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
      CREATE INDEX IF NOT EXISTS idx_events_location ON events USING GIN(location);
      CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id);
      CREATE INDEX IF NOT EXISTS idx_registrations_user ON registrations(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_event ON reviews(event_id);
    `);

    console.log('Database migrations completed successfully');
  } finally {
    client.release();
  }
}

// Graceful shutdown
export async function closeDatabase(): Promise<void> {
  await db.end();
  await redis.quit();
  console.log('Database connections closed');
}