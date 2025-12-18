-- Community Event Board Database Initialization
-- This script creates the basic database structure

-- Create database if it doesn't exist (this is handled by POSTGRES_DB env var)
-- CREATE DATABASE IF NOT EXISTS community_events;

-- Use the database
\c community_events;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis" CASCADE;

-- Create enum types
CREATE TYPE user_role AS ENUM ('resident', 'organizer', 'admin');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
CREATE TYPE event_category AS ENUM ('cultural', 'educational', 'social', 'sports', 'technology', 'business', 'health', 'arts', 'music', 'food');
CREATE TYPE registration_status AS ENUM ('confirmed', 'waitlisted', 'cancelled', 'checked_in');
CREATE TYPE plan_type AS ENUM ('free', 'premium', 'pro');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'pending');
CREATE TYPE transaction_type AS ENUM ('subscription', 'ticket', 'refund');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'resident',
    profile JSONB DEFAULT '{}',
    organizer_profile JSONB,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category event_category NOT NULL,
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location JSONB NOT NULL,
    schedule JSONB NOT NULL,
    capacity INTEGER,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    is_paid BOOLEAN DEFAULT FALSE,
    ticket_price INTEGER, -- in paise
    status event_status DEFAULT 'draft',
    tags TEXT[],
    images TEXT[],
    requirements TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Registrations table
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status registration_status DEFAULT 'confirmed',
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    UNIQUE(event_id, user_id)
);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_type plan_type NOT NULL,
    status subscription_status DEFAULT 'pending',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    amount INTEGER NOT NULL, -- in paise
    currency VARCHAR(3) DEFAULT 'INR',
    payment_method VARCHAR(50),
    razorpay_subscription_id VARCHAR(255),
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    type transaction_type NOT NULL,
    amount INTEGER NOT NULL, -- in paise
    currency VARCHAR(3) DEFAULT 'INR',
    status transaction_status DEFAULT 'pending',
    payment_gateway_id VARCHAR(255),
    payment_method VARCHAR(50),
    failure_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Tickets table
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    price INTEGER NOT NULL, -- in paise
    status VARCHAR(20) DEFAULT 'active',
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    qr_code TEXT NOT NULL,
    transaction_id VARCHAR(255) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_created_at ON events(created_at);
CREATE INDEX idx_registrations_event ON registrations(event_id);
CREATE INDEX idx_registrations_user ON registrations(user_id);
CREATE INDEX idx_reviews_event ON reviews(event_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_tickets_event ON tickets(event_id);
CREATE INDEX idx_tickets_user ON tickets(user_id);

-- Insert some sample data for development
INSERT INTO users (id, email, password_hash, name, role, profile) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@communityevents.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'Admin User', 'admin', '{"bio": "Platform administrator"}'),
('550e8400-e29b-41d4-a716-446655440002', 'organizer@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'Event Organizer', 'organizer', '{"bio": "Community event organizer"}'),
('550e8400-e29b-41d4-a716-446655440003', 'user@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'Regular User', 'resident', '{"bio": "Community member"}');

-- Insert sample events
INSERT INTO events (id, title, description, category, organizer_id, location, schedule, capacity, is_paid, ticket_price, status, tags, images) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Community Tech Meetup', 'Join us for an exciting tech meetup where developers share their latest projects and insights.', 'technology', '550e8400-e29b-41d4-a716-446655440002', 
 '{"address": "123 Tech Street", "city": "Bangalore", "state": "Karnataka", "country": "India", "coordinates": [77.5946, 12.9716]}',
 '{"startDate": "2025-12-23T18:30:00Z", "endDate": "2025-12-23T21:30:00Z", "timezone": "Asia/Kolkata"}',
 50, false, null, 'published', '{"tech", "networking", "developers"}', '{}'),
('660e8400-e29b-41d4-a716-446655440002', 'Yoga in the Park', 'Start your weekend with a refreshing yoga session in the beautiful Cubbon Park.', 'health', '550e8400-e29b-41d4-a716-446655440002',
 '{"address": "Cubbon Park", "city": "Bangalore", "state": "Karnataka", "country": "India", "coordinates": [77.5946, 12.9716]}',
 '{"startDate": "2025-12-21T07:00:00Z", "endDate": "2025-12-21T08:30:00Z", "timezone": "Asia/Kolkata"}',
 30, true, 50000, 'published', '{"yoga", "health", "outdoor"}', '{}'),
('660e8400-e29b-41d4-a716-446655440003', 'Local Food Festival', 'Discover the best local cuisines and street food from around the city.', 'food', '550e8400-e29b-41d4-a716-446655440002',
 '{"address": "Brigade Road", "city": "Bangalore", "state": "Karnataka", "country": "India", "coordinates": [77.6099, 12.9716]}',
 '{"startDate": "2025-12-30T10:00:00Z", "endDate": "2026-01-01T22:00:00Z", "timezone": "Asia/Kolkata"}',
 200, true, 100000, 'published', '{"food", "festival", "culture"}', '{}');

COMMIT;