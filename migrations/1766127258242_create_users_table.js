/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Enable UUID extension
  pgm.createExtension('uuid-ossp', { ifNotExists: true });
  
  // Create users table
  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()')
    },
    email: {
      type: 'varchar(255)',
      notNull: true,
      unique: true
    },
    name: {
      type: 'varchar(255)',
      notNull: true
    },
    role: {
      type: 'varchar(50)',
      notNull: true,
      default: 'resident'
    },
    profile: {
      type: 'jsonb',
      notNull: true,
      default: '{}'
    },
    organizer_profile: {
      type: 'jsonb'
    },
    is_verified: {
      type: 'boolean',
      default: false
    },
    is_active: {
      type: 'boolean',
      default: true
    },
    password_hash: {
      type: 'varchar(255)',
      notNull: true
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP')
    },
    last_active: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP')
    }
  });

  // Create indexes
  pgm.createIndex('users', 'email');
  pgm.createIndex('users', 'role');
  pgm.createIndex('users', 'is_active');
  pgm.createIndex('users', 'created_at');
};

exports.down = pgm => {
  pgm.dropTable('users');
};