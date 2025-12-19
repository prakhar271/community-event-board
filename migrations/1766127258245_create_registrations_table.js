/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Create registrations table with IF NOT EXISTS
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS registrations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      status VARCHAR(50) DEFAULT 'pending',
      quantity INTEGER DEFAULT 1,
      total_amount DECIMAL(10,2) DEFAULT 0,
      payment_id VARCHAR(255),
      attendee_details JSONB DEFAULT '[]',
      registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, event_id)
    );
  `);

  // Create indexes if they don't exist
  pgm.sql('CREATE INDEX IF NOT EXISTS registrations_user_id_index ON registrations (user_id);');
  pgm.sql('CREATE INDEX IF NOT EXISTS registrations_event_id_index ON registrations (event_id);');
  pgm.sql('CREATE INDEX IF NOT EXISTS registrations_status_index ON registrations (status);');
  pgm.sql('CREATE INDEX IF NOT EXISTS registrations_registered_at_index ON registrations (registered_at);');

};

exports.down = pgm => {
  pgm.dropTable('registrations');
};