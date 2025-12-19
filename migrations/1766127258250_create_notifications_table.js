/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Create notifications table
  pgm.createTable('notifications', {
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
    type: {
      type: 'varchar(50)',
      notNull: true
    },
    title: {
      type: 'varchar(255)',
      notNull: true
    },
    message: {
      type: 'text',
      notNull: true
    },
    data: {
      type: 'jsonb',
      default: '{}'
    },
    read_at: {
      type: 'timestamp'
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP')
    }
  });

  // Create indexes
  pgm.createIndex('notifications', 'user_id');
  pgm.createIndex('notifications', 'type');
  pgm.createIndex('notifications', 'read_at');
  pgm.createIndex('notifications', 'created_at');
};

exports.down = pgm => {
  pgm.dropTable('notifications');
};