/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Enable UUID extension
  pgm.sql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  
  // Create users table with IF NOT EXISTS
  pgm.sql(`
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

  // Create indexes if they don't exist
  pgm.sql('CREATE INDEX IF NOT EXISTS users_email_index ON users (email);');
  pgm.sql('CREATE INDEX IF NOT EXISTS users_role_index ON users (role);');
  pgm.sql('CREATE INDEX IF NOT EXISTS users_is_active_index ON users (is_active);');
  pgm.sql('CREATE INDEX IF NOT EXISTS users_created_at_index ON users (created_at);');
};

exports.down = pgm => {
  pgm.dropTable('users');
};