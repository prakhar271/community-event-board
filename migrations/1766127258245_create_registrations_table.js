/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Create registrations table
  pgm.createTable('registrations', {
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
      notNull: true,
      references: 'events(id)',
      onDelete: 'CASCADE'
    },
    status: {
      type: 'varchar(50)',
      default: 'pending'
    },
    quantity: {
      type: 'integer',
      default: 1
    },
    total_amount: {
      type: 'decimal(10,2)',
      default: 0
    },
    payment_id: {
      type: 'varchar(255)'
    },
    attendee_details: {
      type: 'jsonb',
      default: '[]'
    },
    registered_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP')
    }
  });

  // Add unique constraint
  pgm.addConstraint('registrations', 'unique_user_event', 'UNIQUE(user_id, event_id)');

  // Create indexes
  pgm.createIndex('registrations', 'user_id');
  pgm.createIndex('registrations', 'event_id');
  pgm.createIndex('registrations', 'status');
  pgm.createIndex('registrations', 'registered_at');
};

exports.down = pgm => {
  pgm.dropTable('registrations');
};