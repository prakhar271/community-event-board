/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Create moderation_queue table
  pgm.createTable('moderation_queue', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()')
    },
    resource_type: {
      type: 'varchar(50)',
      notNull: true
    },
    resource_id: {
      type: 'uuid',
      notNull: true
    },
    reported_by: {
      type: 'uuid',
      references: 'users(id)',
      onDelete: 'SET NULL'
    },
    reason: {
      type: 'varchar(255)',
      notNull: true
    },
    status: {
      type: 'varchar(50)',
      default: 'pending'
    },
    moderator_id: {
      type: 'uuid',
      references: 'users(id)',
      onDelete: 'SET NULL'
    },
    moderator_notes: {
      type: 'text'
    },
    resolved_at: {
      type: 'timestamp'
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP')
    }
  });

  // Create indexes
  pgm.createIndex('moderation_queue', 'resource_type');
  pgm.createIndex('moderation_queue', 'resource_id');
  pgm.createIndex('moderation_queue', 'reported_by');
  pgm.createIndex('moderation_queue', 'status');
  pgm.createIndex('moderation_queue', 'moderator_id');
  pgm.createIndex('moderation_queue', 'created_at');
};

exports.down = pgm => {
  pgm.dropTable('moderation_queue');
};