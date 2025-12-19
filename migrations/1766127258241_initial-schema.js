/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  // Enable UUID extension
  pgm.createExtension('uuid-ossp', { ifNotExists: true });

  // Users table
  pgm.createTable('users', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    email: { type: 'varchar(255)', unique: true, notNull: true },
    name: { type: 'varchar(255)', notNull: true },
    role: { type: 'varchar(50)', notNull: true, default: 'resident' },
    profile: { type: 'jsonb', notNull: true, default: '{}' },
    organizer_profile: { type: 'jsonb' },
    is_verified: { type: 'boolean', default: false },
    is_active: { type: 'boolean', default: true },
    password_hash: { type: 'varchar(255)', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    last_active: { type: 'timestamp', default: pgm.func('current_timestamp') }
  });

  // Categories table
  pgm.createTable('categories', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    name: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    parent_id: { type: 'uuid', references: 'categories(id)' },
    icon: { type: 'varchar(255)' },
    color: { type: 'varchar(7)' },
    is_active: { type: 'boolean', default: true },
    sort_order: { type: 'integer', default: 0 },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
  });

  // Events table
  pgm.createTable('events', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    title: { type: 'varchar(255)', notNull: true },
    description: { type: 'text', notNull: true },
    category: { type: 'varchar(100)', notNull: true },
    organizer_id: { type: 'uuid', notNull: true, references: 'users(id)' },
    location: { type: 'jsonb', notNull: true },
    schedule: { type: 'jsonb', notNull: true },
    capacity: { type: 'integer' },
    registration_deadline: { type: 'timestamp' },
    requirements: { type: 'jsonb', default: '[]' },
    images: { type: 'jsonb', default: '[]' },
    status: { type: 'varchar(50)', default: 'draft' },
    is_paid: { type: 'boolean', default: false },
    ticket_price: { type: 'integer' },
    tags: { type: 'jsonb', default: '[]' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
  });

  // Registrations table
  pgm.createTable('registrations', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    event_id: { type: 'uuid', notNull: true, references: 'events(id)', onDelete: 'CASCADE' },
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    status: { type: 'varchar(50)', default: 'confirmed' },
    registered_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    checked_in: { type: 'timestamp' },
    waitlist_position: { type: 'integer' },
    ticket_id: { type: 'uuid' },
    notes: { type: 'text' }
  });

  // Add unique constraint for event-user registration
  pgm.addConstraint('registrations', 'unique_event_user', 'UNIQUE(event_id, user_id)');

  // Subscriptions table
  pgm.createTable('subscriptions', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    plan_type: { type: 'varchar(50)', notNull: true },
    status: { type: 'varchar(50)', default: 'active' },
    start_date: { type: 'timestamp', notNull: true },
    end_date: { type: 'timestamp', notNull: true },
    amount: { type: 'integer', notNull: true },
    currency: { type: 'varchar(3)', default: 'INR' },
    payment_method: { type: 'varchar(100)' },
    razorpay_subscription_id: { type: 'varchar(255)' },
    auto_renew: { type: 'boolean', default: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
  });

  // Transactions table
  pgm.createTable('transactions', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    user_id: { type: 'uuid', notNull: true, references: 'users(id)' },
    event_id: { type: 'uuid', references: 'events(id)' },
    subscription_id: { type: 'uuid', references: 'subscriptions(id)' },
    type: { type: 'varchar(50)', notNull: true },
    amount: { type: 'integer', notNull: true },
    currency: { type: 'varchar(3)', default: 'INR' },
    status: { type: 'varchar(50)', default: 'pending' },
    payment_gateway_id: { type: 'varchar(255)', notNull: true },
    payment_method: { type: 'varchar(100)' },
    failure_reason: { type: 'text' },
    metadata: { type: 'jsonb' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    completed_at: { type: 'timestamp' }
  });

  // Tickets table
  pgm.createTable('tickets', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    event_id: { type: 'uuid', notNull: true, references: 'events(id)', onDelete: 'CASCADE' },
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    registration_id: { type: 'uuid', notNull: true, references: 'registrations(id)', onDelete: 'CASCADE' },
    price: { type: 'integer', notNull: true },
    status: { type: 'varchar(50)', default: 'active' },
    purchased_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    qr_code: { type: 'text', notNull: true },
    transaction_id: { type: 'uuid', notNull: true, references: 'transactions(id)' }
  });

  // Reviews table
  pgm.createTable('reviews', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    event_id: { type: 'uuid', notNull: true, references: 'events(id)', onDelete: 'CASCADE' },
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    rating: { type: 'integer', notNull: true, check: 'rating >= 1 AND rating <= 5' },
    comment: { type: 'text' },
    is_verified_attendee: { type: 'boolean', default: false },
    status: { type: 'varchar(50)', default: 'published' },
    flagged_reason: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
  });

  // Add unique constraint for event-user review
  pgm.addConstraint('reviews', 'unique_event_user_review', 'UNIQUE(event_id, user_id)');

  // Moderation flags table
  pgm.createTable('moderation_flags', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    content_type: { type: 'varchar(50)', notNull: true },
    content_id: { type: 'uuid', notNull: true },
    reporter_id: { type: 'uuid', notNull: true, references: 'users(id)' },
    reason: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    status: { type: 'varchar(50)', default: 'pending' },
    reviewed_by: { type: 'uuid', references: 'users(id)' },
    reviewed_at: { type: 'timestamp' },
    action: { type: 'varchar(50)' },
    action_reason: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
  });

  // Refresh tokens table
  pgm.createTable('refresh_tokens', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    token: { type: 'varchar(255)', notNull: true, unique: true },
    expires_at: { type: 'timestamp', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    revoked_at: { type: 'timestamp' },
    is_revoked: { type: 'boolean', default: false }
  });

  // Create indexes for better performance
  pgm.createIndex('events', 'organizer_id');
  pgm.createIndex('events', 'category');
  pgm.createIndex('events', 'status');
  pgm.createIndex('events', 'location', { method: 'gin' });
  pgm.createIndex('registrations', 'event_id');
  pgm.createIndex('registrations', 'user_id');
  pgm.createIndex('transactions', 'user_id');
  pgm.createIndex('reviews', 'event_id');
  pgm.createIndex('refresh_tokens', 'user_id');
  pgm.createIndex('refresh_tokens', 'token');
  pgm.createIndex('refresh_tokens', 'expires_at');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  // Drop tables in reverse order (due to foreign key constraints)
  pgm.dropTable('refresh_tokens');
  pgm.dropTable('moderation_flags');
  pgm.dropTable('reviews');
  pgm.dropTable('tickets');
  pgm.dropTable('transactions');
  pgm.dropTable('subscriptions');
  pgm.dropTable('registrations');
  pgm.dropTable('events');
  pgm.dropTable('categories');
  pgm.dropTable('users');
  
  // Drop extension
  pgm.dropExtension('uuid-ossp');
};
