/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Create events table
  pgm.createTable('events', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()')
    },
    title: {
      type: 'varchar(255)',
      notNull: true
    },
    description: {
      type: 'text',
      notNull: true
    },
    category_id: {
      type: 'uuid',
      references: 'categories(id)',
      notNull: true
    },
    organizer_id: {
      type: 'uuid',
      references: 'users(id)',
      notNull: true
    },
    location: {
      type: 'jsonb',
      notNull: true
    },
    schedule: {
      type: 'jsonb',
      notNull: true
    },
    capacity: {
      type: 'integer',
      notNull: true
    },
    current_registrations: {
      type: 'integer',
      default: 0
    },
    is_paid: {
      type: 'boolean',
      default: false
    },
    ticket_price: {
      type: 'integer'
    },
    status: {
      type: 'varchar(50)',
      default: 'draft'
    },
    moderation_status: {
      type: 'varchar(50)',
      default: 'pending'
    },
    tags: {
      type: 'text[]',
      default: '{}'
    },
    images: {
      type: 'text[]',
      default: '{}'
    },
    metadata: {
      type: 'jsonb',
      default: '{}'
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
  pgm.createIndex('events', 'title');
  pgm.createIndex('events', 'category_id');
  pgm.createIndex('events', 'organizer_id');
  pgm.createIndex('events', 'status');
  pgm.createIndex('events', 'moderation_status');
  pgm.createIndex('events', 'is_paid');
  pgm.createIndex('events', 'created_at');
  pgm.createIndex('events', 'tags', { method: 'gin' });
  
  // Full-text search index
  pgm.addColumn('events', {
    search_vector: {
      type: 'tsvector'
    }
  });
  
  pgm.createIndex('events', 'search_vector', { method: 'gin' });
  
  // Trigger to update search vector
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