/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Create reviews table
  pgm.createTable('reviews', {
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
    rating: {
      type: 'integer',
      notNull: true,
      check: 'rating >= 1 AND rating <= 5'
    },
    comment: {
      type: 'text'
    },
    is_verified: {
      type: 'boolean',
      default: false
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

  // Add unique constraint
  pgm.addConstraint('reviews', 'unique_user_event_review', 'UNIQUE(user_id, event_id)');

  // Create indexes
  pgm.createIndex('reviews', 'user_id');
  pgm.createIndex('reviews', 'event_id');
  pgm.createIndex('reviews', 'rating');
  pgm.createIndex('reviews', 'created_at');
};

exports.down = pgm => {
  pgm.dropTable('reviews');
};