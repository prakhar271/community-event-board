import { zodResolver } from '@hookform/resolvers/zod';
import {
  userLoginSchema,
  userRegistrationSchema,
  eventCreateSchema,
  type UserLoginInput,
  type UserRegistrationInput,
  type EventCreateInput,
} from '../../../shared/validation/schemas';

// Export validation resolvers for react-hook-form
export const validationResolvers = {
  login: zodResolver(userLoginSchema),
  register: zodResolver(userRegistrationSchema),
  createEvent: zodResolver(eventCreateSchema),
};

// Export types for components
export type { UserLoginInput, UserRegistrationInput, EventCreateInput };

// Helper function to get validation schema
export const getValidationSchema = (
  type: 'login' | 'register' | 'createEvent'
) => {
  switch (type) {
    case 'login':
      return userLoginSchema;
    case 'register':
      return userRegistrationSchema;
    case 'createEvent':
      return eventCreateSchema;
    default:
      throw new Error(`Unknown validation type: ${type}`);
  }
};
