/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Create categories table with IF NOT EXISTS
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS categories (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      parent_id UUID REFERENCES categories(id),
      icon VARCHAR(255),
      color VARCHAR(7),
      is_active BOOLEAN DEFAULT true,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create indexes if they don't exist
  pgm.sql('CREATE INDEX IF NOT EXISTS categories_name_index ON categories (name);');
  pgm.sql('CREATE INDEX IF NOT EXISTS categories_parent_id_index ON categories (parent_id);');
  pgm.sql('CREATE INDEX IF NOT EXISTS categories_is_active_index ON categories (is_active);');
  pgm.sql('CREATE INDEX IF NOT EXISTS categories_sort_order_index ON categories (sort_order);');
};

exports.down = pgm => {
  pgm.dropTable('categories');
};