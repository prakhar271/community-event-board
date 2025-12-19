/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Create audit_logs table
  pgm.createTable('audit_logs', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()')
    },
    user_id: {
      type: 'uuid',
      references: 'users(id)',
      onDelete: 'SET NULL'
    },
    action: {
      type: 'varchar(100)',
      notNull: true
    },
    resource_type: {
      type: 'varchar(50)',
      notNull: true
    },
    resource_id: {
      type: 'uuid'
    },
    old_values: {
      type: 'jsonb'
    },
    new_values: {
      type: 'jsonb'
    },
    ip_address: {
      type: 'inet'
    },
    user_agent: {
      type: 'text'
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP')
    }
  });

  // Create indexes
  pgm.createIndex('audit_logs', 'user_id');
  pgm.createIndex('audit_logs', 'action');
  pgm.createIndex('audit_logs', 'resource_type');
  pgm.createIndex('audit_logs', 'resource_id');
  pgm.createIndex('audit_logs', 'created_at');
};

exports.down = pgm => {
  pgm.dropTable('audit_logs');
};