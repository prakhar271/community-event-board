import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Global test setup
beforeAll(async () => {
  // Setup test database connection
  // Setup test Redis connection
  // Clear test data
});

afterAll(async () => {
  // Close database connections
  // Clean up test data
});

// Global test utilities
(global as any).testUtils = {
  createTestUser: () => ({
    email: `test-${Date.now()}@example.com`,
    name: 'Test User',
    password: 'testpassword123'
  }),
  
  createTestEvent: () => ({
    title: 'Test Event',
    description: 'A test event',
    category: 'cultural',
    location: {
      address: 'Test Address',
      coordinates: [77.5946, 12.9716], // Bangalore coordinates
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India'
    },
    schedule: {
      startDate: new Date(Date.now() + 86400000), // Tomorrow
      endDate: new Date(Date.now() + 90000000), // Tomorrow + 1 hour
      timezone: 'Asia/Kolkata'
    },
    isPaid: false
  })
};

// Extend Jest matchers if needed
expect.extend({
  // Custom matchers can be added here
});