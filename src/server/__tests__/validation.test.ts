import {
  userRegistrationSchema,
  userLoginSchema,
  eventCreateSchema,
  registrationCreateSchema,
  reviewCreateSchema,
} from '../../shared/validation/schemas';
import { UserRole, EventStatus } from '../../shared/types';

describe('Validation Schemas', () => {
  describe('userRegistrationSchema', () => {
    it('should validate correct user registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePass123',
        name: 'John Doe',
        role: UserRole.RESIDENT,
      };

      const result = userRegistrationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'SecurePass123',
        name: 'John Doe',
      };

      const result = userRegistrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'Invalid email format'
        );
      }
    });

    it('should reject weak password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123',
        name: 'John Doe',
      };

      const result = userRegistrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short name', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'SecurePass123',
        name: 'A',
      };

      const result = userRegistrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('eventCreateSchema', () => {
    it('should validate correct event data', () => {
      const validData = {
        title: 'Tech Conference 2024',
        description: 'Annual technology conference with latest trends',
        category: 'technology',
        location: {
          venue: 'Convention Center',
          address: 'MG Road',
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
        },
        schedule: {
          startDate: '2024-08-15T09:00:00Z',
          endDate: '2024-08-15T18:00:00Z',
          timezone: 'Asia/Kolkata',
        },
        capacity: 500,
        isPaid: true,
        ticketPrice: 2500,
      };

      const result = eventCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject event with end date before start date', () => {
      const invalidData = {
        title: 'Invalid Event',
        description: 'Event with invalid dates',
        category: 'technology',
        location: {
          address: 'Test Address',
          city: 'Test City',
          state: 'Test State',
        },
        schedule: {
          startDate: '2024-08-15T18:00:00Z',
          endDate: '2024-08-15T09:00:00Z', // Before start date
        },
        capacity: 100,
      };

      const result = eventCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject paid event without ticket price', () => {
      const invalidData = {
        title: 'Paid Event',
        description: 'Event without price',
        category: 'technology',
        location: {
          address: 'Test Address',
          city: 'Test City',
          state: 'Test State',
        },
        schedule: {
          startDate: '2024-08-15T09:00:00Z',
          endDate: '2024-08-15T18:00:00Z',
        },
        capacity: 100,
        isPaid: true,
        // Missing ticketPrice
      };

      const result = eventCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject event with invalid capacity', () => {
      const invalidData = {
        title: 'Invalid Capacity Event',
        description: 'Event with invalid capacity',
        category: 'technology',
        location: {
          address: 'Test Address',
          city: 'Test City',
          state: 'Test State',
        },
        schedule: {
          startDate: '2024-08-15T09:00:00Z',
          endDate: '2024-08-15T18:00:00Z',
        },
        capacity: 0, // Invalid capacity
      };

      const result = eventCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('registrationCreateSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        eventId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 2,
        attendeeDetails: [
          {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+919876543210',
          },
          {
            name: 'Jane Doe',
            email: 'jane@example.com',
            phone: '+919876543211',
          },
        ],
      };

      const result = registrationCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject mismatched quantity and attendee details', () => {
      const invalidData = {
        eventId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 3, // Quantity doesn't match attendee details
        attendeeDetails: [
          {
            name: 'John Doe',
            email: 'john@example.com',
          },
        ],
      };

      const result = registrationCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid event ID', () => {
      const invalidData = {
        eventId: 'invalid-uuid',
        quantity: 1,
        attendeeDetails: [
          {
            name: 'John Doe',
            email: 'john@example.com',
          },
        ],
      };

      const result = registrationCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('reviewCreateSchema', () => {
    it('should validate correct review data', () => {
      const validData = {
        eventId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 5,
        comment: 'Excellent event! Highly recommended for everyone.',
      };

      const result = reviewCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid rating', () => {
      const invalidData = {
        eventId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 6, // Rating out of range
        comment: 'Great event!',
      };

      const result = reviewCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short comment', () => {
      const invalidData = {
        eventId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 5,
        comment: 'Good', // Too short
      };

      const result = reviewCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
