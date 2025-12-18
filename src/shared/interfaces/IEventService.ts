import { Event, CreateEventRequest, UpdateEventRequest } from '../models/Event';
import { SearchFilters, PaginationOptions, PaginatedResponse } from '../types';

export interface IEventService {
  // CRUD operations
  createEvent(organizerId: string, eventData: CreateEventRequest): Promise<Event>;
  getEventById(id: string): Promise<Event | null>;
  updateEvent(id: string, organizerId: string, eventData: UpdateEventRequest): Promise<Event>;
  deleteEvent(id: string, organizerId: string): Promise<void>;
  
  // Search and filtering
  searchEvents(filters: SearchFilters, pagination: PaginationOptions): Promise<PaginatedResponse<Event>>;
  getEventsByOrganizer(organizerId: string, pagination: PaginationOptions): Promise<PaginatedResponse<Event>>;
  getEventsByCategory(category: string, pagination: PaginationOptions): Promise<PaginatedResponse<Event>>;
  
  // Event management
  publishEvent(id: string, organizerId: string): Promise<Event>;
  cancelEvent(id: string, organizerId: string, reason: string): Promise<Event>;
  
  // Capacity and registration
  checkCapacity(eventId: string): Promise<{ available: number; total: number; waitlist: number }>;
  getEventAttendees(eventId: string, organizerId: string): Promise<any[]>;
  
  // Analytics
  getEventAnalytics(eventId: string, organizerId: string): Promise<any>;
  
  // Validation
  validateEventData(eventData: CreateEventRequest | UpdateEventRequest): Promise<string[]>;
  canUserManageEvent(eventId: string, userId: string): Promise<boolean>;
}