/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Create events table with IF NOT EXISTS
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS events (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      category_id UUID REFERENCES categories(id) NOT NULL,
      organizer_id UUID REFERENCES users(id) NOT NULL,
      location JSONB NOT NULL,
      schedule JSONB NOT NULL,
      capacity INTEGER NOT NULL,
      current_registrations INTEGER DEFAULT 0,
      is_paid BOOLEAN DEFAULT false,
      ticket_price INTEGER,
      status VARCHAR(50) DEFAULT 'draft',
      moderation_status VARCHAR(50) DEFAULT 'pending',
      tags TEXT[] DEFAULT '{}',
      images TEXT[] DEFAULT '{}',
      metadata JSONB DEFAULT '{}',
      search_vector TSVECTOR,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create indexes if they don't exist
  pgm.sql('CREATE INDEX IF NOT EXISTS events_title_index ON events (title);');
  pgm.sql('CREATE INDEX IF NOT EXISTS events_category_id_index ON events (category_id);');
  pgm.sql('CREATE INDEX IF NOT EXISTS events_organizer_id_index ON events (organizer_id);');
  pgm.sql('CREATE INDEX IF NOT EXISTS events_status_index ON events (status);');
  pgm.sql('CREATE INDEX IF NOT EXISTS events_moderation_status_index ON events (moderation_status);');
  pgm.sql('CREATE INDEX IF NOT EXISTS events_is_paid_index ON events (is_paid);');
  pgm.sql('CREATE INDEX IF NOT EXISTS events_created_at_index ON events (created_at);');
  pgm.sql('CREATE INDEX IF NOT EXISTS events_tags_index ON events USING gin (tags);');
  pgm.sql('CREATE INDEX IF NOT EXISTS events_search_vector_index ON events USING gin (search_vector);');
  
  // Create function and trigger for search vector
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_events_search_vector()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.search_vector := to_tsvector('english', 
        COALESCE(NEW.title, '') || ' ' || 
        COALESCE(NEW.description, '') || ' ' || 
        COALESCE(array_to_string(NEW.tags, ' '), '')
      );
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    DROP TRIGGER IF EXISTS events_search_vector_update ON events;
    CREATE TRIGGER events_search_vector_update
      BEFORE INSERT OR UPDATE ON events
      FOR EACH ROW EXECUTE FUNCTION update_events_search_vector();
  `);
};

exports.down = pgm => {
  pgm.sql('DROP TRIGGER IF EXISTS events_search_vector_update ON events;');
  pgm.sql('DROP FUNCTION IF EXISTS update_events_search_vector();');
  pgm.dropTable('events');
};