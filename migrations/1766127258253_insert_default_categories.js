/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Insert default categories
  pgm.sql(`
    INSERT INTO categories (name, description, icon, color) VALUES
    ('Technology', 'Tech conferences, workshops, and meetups', 'laptop', '#3B82F6'),
    ('Music', 'Concerts, festivals, and music events', 'music', '#EF4444'),
    ('Sports', 'Sports events, tournaments, and fitness', 'trophy', '#10B981'),
    ('Education', 'Workshops, seminars, and learning events', 'book', '#8B5CF6'),
    ('Business', 'Networking, conferences, and business events', 'briefcase', '#F59E0B'),
    ('Arts', 'Art exhibitions, theater, and cultural events', 'palette', '#EC4899'),
    ('Food', 'Food festivals, cooking classes, and dining', 'utensils', '#F97316'),
    ('Health', 'Health and wellness events', 'heart', '#06B6D4'),
    ('Community', 'Local community gatherings and social events', 'users', '#84CC16'),
    ('Entertainment', 'Movies, comedy shows, and entertainment', 'film', '#6366F1')
    ON CONFLICT (name) DO NOTHING;
  `);
};

exports.down = pgm => {
  // Remove default categories
  pgm.sql(`
    DELETE FROM categories WHERE name IN (
      'Technology', 'Music', 'Sports', 'Education', 'Business',
      'Arts', 'Food', 'Health', 'Community', 'Entertainment'
    );
  `);
};