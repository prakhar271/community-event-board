/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Create subscriptions table
  pgm.createTable('subscriptions', {
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
    plan_type: {
      type: 'varchar(50)',
      notNull: true
    },
    status: {
      type: 'varchar(50)',
      default: 'pending'
    },
    start_date: {
      type: 'date',
      notNull: true
    },
    end_date: {
      type: 'date',
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
    payment_method: {
      type: 'varchar(50)'
    },
    razorpay_subscription_id: {
      type: 'varchar(255)'
    },
    auto_renew: {
      type: 'boolean',
      default: true
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP')
    }
  });

  // Create indexes
  pgm.createIndex('subscriptions', 'user_id');
  pgm.createIndex('subscriptions', 'plan_type');
  pgm.createIndex('subscriptions', 'status');
  pgm.createIndex('subscriptions', 'start_date');
  pgm.createIndex('subscriptions', 'end_date');
};

exports.down = pgm => {
  pgm.dropTable('subscriptions');
};