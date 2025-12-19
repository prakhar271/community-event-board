/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Create tickets table
  pgm.createTable('tickets', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()')
    },
    registration_id: {
      type: 'uuid',
      notNull: true,
      references: 'registrations(id)',
      onDelete: 'CASCADE'
    },
    qr_code: {
      type: 'text'
    },
    status: {
      type: 'varchar(50)',
      default: 'active'
    },
    used_at: {
      type: 'timestamp'
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP')
    }
  });

  // Create indexes
  pgm.createIndex('tickets', 'registration_id');
  pgm.createIndex('tickets', 'status');
  pgm.createIndex('tickets', 'qr_code');
};

exports.down = pgm => {
  pgm.dropTable('tickets');
};