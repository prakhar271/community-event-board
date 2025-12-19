/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Create transactions table
  pgm.createTable('transactions', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()')
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE'
    },
    event_id: {
      type: 'uuid',
      references: 'events(id)',
      onDelete: 'SET NULL'
    },
    subscription_id: {
      type: 'uuid',
      references: 'subscriptions(id)',
      onDelete: 'SET NULL'
    },
    type: {
      type: 'varchar(50)',
      notNull: true
    },
    amount: {
      type: 'decimal(10,2)',
      notNull: true
    },
    currency: {
      type: 'varchar(3)',
      default: 'INR'
    },
    status: {
      type: 'varchar(50)',
      default: 'pending'
    },
    payment_gateway_id: {
      type: 'varchar(255)'
    },
    metadata: {
      type: 'jsonb',
      default: '{}'
    },
    completed_at: {
      type: 'timestamp'
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP')
    }
  });

  // Create indexes
  pgm.createIndex('transactions', 'user_id');
  pgm.createIndex('transactions', 'event_id');
  pgm.createIndex('transactions', 'subscription_id');
  pgm.createIndex('transactions', 'type');
  pgm.createIndex('transactions', 'status');
  pgm.createIndex('transactions', 'created_at');
};

exports.down = pgm => {
  pgm.dropTable('transactions');
};