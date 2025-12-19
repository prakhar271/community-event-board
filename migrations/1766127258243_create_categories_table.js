/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Create categories table
  pgm.createTable('categories', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()')
    },
    name: {
      type: 'varchar(255)',
      notNull: true
    },
    description: {
      type: 'text'
    },
    parent_id: {
      type: 'uuid',
      references: 'categories(id)'
    },
    icon: {
      type: 'varchar(255)'
    },
    color: {
      type: 'varchar(7)'
    },
    is_active: {
      type: 'boolean',
      default: true
    },
    sort_order: {
      type: 'integer',
      default: 0
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
  pgm.createIndex('categories', 'name');
  pgm.createIndex('categories', 'parent_id');
  pgm.createIndex('categories', 'is_active');
  pgm.createIndex('categories', 'sort_order');
};

exports.down = pgm => {
  pgm.dropTable('categories');
};