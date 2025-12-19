import { z } from 'zod';
import { UserRole, PlanType, EventStatus } from '../types';

// User Validation Schemas
export const userRegistrationSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
    .regex(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
    .regex(/(?=.*\d)/, 'Password must contain at least one number'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  role: z.nativeEnum(UserRole).optional().default(UserRole.RESIDENT),
});

export const userLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const userProfileUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  profile: z
    .object({
      interests: z.array(z.string()).optional(),
      notificationPreferences: z
        .object({
          email: z.boolean().optional(),
          sms: z.boolean().optional(),
          push: z.boolean().optional(),
          eventUpdates: z.boolean().optional(),
          recommendations: z.boolean().optional(),
          marketing: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
});

// Event Validation Schemas
export const eventCreateSchema = z
  .object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(200, 'Title must be less than 200 characters'),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(5000, 'Description must be less than 5000 characters'),
    category: z.string().min(1, 'Category is required'),
    location: z.object({
      venue: z.string().optional(),
      address: z.string().min(3, 'Address is required'),
      city: z.string().min(2, 'City is required'),
      state: z.string().min(2, 'State is required'),
      country: z.string().optional().default('India'),
    }),
    schedule: z.object({
      startDate: z.string().min(1, 'Start date is required'),
      endDate: z.string().min(1, 'End date is required'),
      timezone: z.string().optional().default('Asia/Kolkata'),
    }),
    registrationDeadline: z.string().optional(),
    capacity: z
      .number()
      .int('Capacity must be a whole number')
      .min(1, 'Capacity must be at least 1')
      .max(100000, 'Capacity cannot exceed 100,000')
      .optional(),
    isPaid: z.boolean().optional().default(false),
    ticketPrice: z
      .number()
      .min(0, 'Ticket price cannot be negative')
      .max(1000000, 'Ticket price cannot exceed ₹10,000')
      .optional(),
    tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional(),
    imageUrl: z.string().url('Invalid image URL').optional(),
    requirements: z.array(z.string()).optional(),
  })
  .refine(
    (data) =>
      new Date(data.schedule.endDate) > new Date(data.schedule.startDate),
    {
      message: 'End date must be after start date',
      path: ['schedule', 'endDate'],
    }
  )
  .refine(
    (data) =>
      !data.isPaid || (data.isPaid && data.ticketPrice && data.ticketPrice > 0),
    {
      message: 'Paid events must have a ticket price greater than 0',
      path: ['ticketPrice'],
    }
  );

export const eventUpdateSchema = eventCreateSchema.partial();

export const eventSearchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  isPaid: z.boolean().optional(),
  status: z.nativeEnum(EventStatus).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['date', 'title', 'price', 'capacity']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Registration Validation Schemas
export const registrationCreateSchema = z
  .object({
    eventId: z.string().uuid('Invalid event ID'),
    quantity: z
      .number()
      .int('Quantity must be a whole number')
      .min(1, 'Quantity must be at least 1')
      .max(10, 'Maximum 10 tickets per registration'),
    attendeeDetails: z
      .array(
        z.object({
          name: z.string().min(2, 'Name must be at least 2 characters'),
          email: z.string().email('Invalid email format'),
          phone: z
            .string()
            .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
            .optional(),
        })
      )
      .min(1, 'At least one attendee required'),
  })
  .refine((data) => data.attendeeDetails.length === data.quantity, {
    message: 'Number of attendee details must match quantity',
    path: ['attendeeDetails'],
  });

// Payment Validation Schemas
export const subscriptionCreateSchema = z.object({
  planType: z.nativeEnum(PlanType),
  autoRenew: z.boolean().default(true),
});

export const paymentIntentSchema = z.object({
  amount: z.number().int().min(1, 'Amount must be greater than 0'),
  currency: z
    .string()
    .length(3, 'Currency must be 3 characters')
    .default('INR'),
  metadata: z.record(z.string(), z.string()).optional(),
});

// Review Validation Schemas
export const reviewCreateSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  comment: z
    .string()
    .min(10, 'Comment must be at least 10 characters')
    .max(1000, 'Comment must be less than 1000 characters')
    .optional(),
});

// Common Validation Schemas
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

// Password Reset Schemas
export const passwordResetRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
    .regex(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
    .regex(/(?=.*\d)/, 'Password must contain at least one number'),
});

// Export types for frontend use
export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;
export type EventCreateInput = z.infer<typeof eventCreateSchema>;
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>;
export type EventSearchInput = z.infer<typeof eventSearchSchema>;
export type RegistrationCreateInput = z.infer<typeof registrationCreateSchema>;
export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>;
