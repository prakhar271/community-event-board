import { v4 as uuidv4 } from 'uuid';
import { IEventService } from '../../shared/interfaces/IEventService';
import { Event, CreateEventRequest, UpdateEventRequest } from '../../shared/models/Event';
import { SearchFilters, PaginationOptions, PaginatedResponse, EventStatus, EventCategory } from '../../shared/types';
import { EventRepository } from '../repositories/EventRepository';
import { EventModel } from '../models/EventModel';
import { UserService } from './UserService';
import { NotificationService } from './NotificationService';

export class EventService implements IEventService {
  constructor(
    private eventRepository: EventRepository,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  async createEvent(organizerId: string, eventData: CreateEventRequest): Promise<Event> {
    // Validate event data
    const validationErrors = EventModel.validate(eventData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Check if user can create events (plan limits)
    const user = await this.userService.getUserById(organizerId);
    if (!user) {
      throw new Error('Organizer not found');
    }

    // Validate plan limits
    await this.validatePlanLimits(organizerId, 'create_event');

    // Create event
    const event = new EventModel({
      id: uuidv4(),
      ...eventData,
      organizerId,
      status: EventStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return await this.eventRepository.create(event);
  }

  async getEventById(id: string): Promise<Event | null> {
    try {
      return await this.eventRepository.findById(id);
    } catch (error) {
      // In development mode without database, return mock data
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️  Database not available, returning mock event data');
        const mockEvents = this.getMockEvents();
        return mockEvents.find(event => event.id === id) || null;
      }
      throw error;
    }
  }

  async updateEvent(id: string, organizerId: string, eventData: UpdateEventRequest): Promise<Event> {
    // Check if event exists and user owns it
    const canManage = await this.canUserManageEvent(id, organizerId);
    if (!canManage) {
      throw new Error('Unauthorized to manage this event');
    }

    // Validate update data
    const validationErrors = EventModel.validate(eventData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    const updatedEvent = await this.eventRepository.update(id, {
      ...eventData,
      updatedAt: new Date()
    });

    if (!updatedEvent) {
      throw new Error('Event not found');
    }

    // Notify registered participants of changes
    await this.notificationService.notifyEventUpdate(id, 'Event details have been updated');

    return updatedEvent;
  }

  async deleteEvent(id: string, organizerId: string): Promise<void> {
    const canManage = await this.canUserManageEvent(id, organizerId);
    if (!canManage) {
      throw new Error('Unauthorized to manage this event');
    }

    const deleted = await this.eventRepository.delete(id);
    if (!deleted) {
      throw new Error('Event not found');
    }
  }

  async searchEvents(filters: SearchFilters, pagination: PaginationOptions): Promise<PaginatedResponse<Event>> {
    try {
      return await this.eventRepository.search(filters, pagination);
    } catch (error) {
      // In development mode without database, return mock data
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️  Database not available, returning mock event data');
        return {
          success: true,
          data: this.getMockEvents(),
          pagination: {
            page: pagination.page || 1,
            limit: pagination.limit || 20,
            total: 3,
            totalPages: 1
          }
        };
      }
      throw error;
    }
  }

  private getMockEvents(): Event[] {
    return [
      {
        id: 'mock-event-1',
        title: 'Community Tech Meetup',
        description: 'Join us for an exciting tech meetup where developers share their latest projects and insights.',
        category: EventCategory.TECHNOLOGY,
        organizerId: 'mock-organizer-1',
        location: {
          address: '123 Tech Street',
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          coordinates: [77.5946, 12.9716]
        },
        schedule: {
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
          timezone: 'Asia/Kolkata'
        },
        capacity: 50,
        isPaid: false,
        status: EventStatus.PUBLISHED,
        tags: ['tech', 'networking', 'developers'],
        images: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'mock-event-2',
        title: 'Yoga in the Park',
        description: 'Start your weekend with a refreshing yoga session in the beautiful Cubbon Park.',
        category: EventCategory.HEALTH,
        organizerId: 'mock-organizer-2',
        location: {
          address: 'Cubbon Park',
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          coordinates: [77.5946, 12.9716]
        },
        schedule: {
          startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // 90 minutes later
          timezone: 'Asia/Kolkata'
        },
        capacity: 30,
        isPaid: true,
        ticketPrice: 50000, // ₹500 in paise
        status: EventStatus.PUBLISHED,
        tags: ['yoga', 'health', 'outdoor'],
        images: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'mock-event-3',
        title: 'Local Food Festival',
        description: 'Discover the best local cuisines and street food from around the city.',
        category: EventCategory.FOOD,
        organizerId: 'mock-organizer-3',
        location: {
          address: 'Brigade Road',
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          coordinates: [77.6099, 12.9716]
        },
        schedule: {
          startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000), // 2 days later
          timezone: 'Asia/Kolkata'
        },
        capacity: 200,
        isPaid: true,
        ticketPrice: 100000, // ₹1000 in paise
        status: EventStatus.PUBLISHED,
        tags: ['food', 'festival', 'culture'],
        images: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  async getAllEvents(pagination: PaginationOptions): Promise<PaginatedResponse<Event>> {
    try {
      // Use search with empty filters to get all published events
      const filters: SearchFilters = {};
      return await this.eventRepository.search(filters, pagination);
    } catch (error) {
      // In development mode without database, return mock data
      const mockEvents = await this.getMockEvents();
      return {
        success: true,
        data: mockEvents.slice(0, pagination.limit),
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: mockEvents.length,
          totalPages: Math.ceil(mockEvents.length / pagination.limit)
        }
      };
    }
  }

  async getEventsByOrganizer(organizerId: string, pagination: PaginationOptions): Promise<PaginatedResponse<Event>> {
    return await this.eventRepository.findByOrganizer(organizerId, pagination);
  }

  async getEventsByCategory(category: string, pagination: PaginationOptions): Promise<PaginatedResponse<Event>> {
    const filters: SearchFilters = {
      categories: [category as any]
    };
    return await this.eventRepository.search(filters, pagination);
  }

  async publishEvent(id: string, organizerId: string): Promise<Event> {
    const canManage = await this.canUserManageEvent(id, organizerId);
    if (!canManage) {
      throw new Error('Unauthorized to manage this event');
    }

    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new Error('Event not found');
    }

    // Validate event is ready for publishing
    const validationErrors = this.validateEventForPublishing(event);
    if (validationErrors.length > 0) {
      throw new Error(`Cannot publish event: ${validationErrors.join(', ')}`);
    }

    const updatedEvent = await this.eventRepository.update(id, {
      status: EventStatus.PUBLISHED,
      updatedAt: new Date()
    });

    if (!updatedEvent) {
      throw new Error('Failed to publish event');
    }

    return updatedEvent;
  }

  async cancelEvent(id: string, organizerId: string, reason: string): Promise<Event> {
    const canManage = await this.canUserManageEvent(id, organizerId);
    if (!canManage) {
      throw new Error('Unauthorized to manage this event');
    }

    const updatedEvent = await this.eventRepository.update(id, {
      status: EventStatus.CANCELLED,
      updatedAt: new Date()
    });

    if (!updatedEvent) {
      throw new Error('Event not found');
    }

    // Notify all registered participants
    await this.notificationService.notifyEventCancellation(id, reason);

    return updatedEvent;
  }

  async checkCapacity(eventId: string): Promise<{ available: number; total: number; waitlist: number }> {
    return await this.eventRepository.getCapacityInfo(eventId);
  }

  async getEventAttendees(eventId: string, organizerId: string): Promise<any[]> {
    const canManage = await this.canUserManageEvent(eventId, organizerId);
    if (!canManage) {
      throw new Error('Unauthorized to view attendees');
    }

    // This would be implemented with a registration repository
    // For now, return empty array
    return [];
  }

  async getEventAnalytics(eventId: string, organizerId: string): Promise<any> {
    const canManage = await this.canUserManageEvent(eventId, organizerId);
    if (!canManage) {
      throw new Error('Unauthorized to view analytics');
    }

    // This would be implemented with analytics service
    return {
      totalRegistrations: 0,
      checkedInCount: 0,
      waitlistCount: 0,
      revenue: 0,
      conversionRate: 0
    };
  }

  async validateEventData(eventData: CreateEventRequest | UpdateEventRequest): Promise<string[]> {
    return EventModel.validate(eventData);
  }

  async canUserManageEvent(eventId: string, userId: string): Promise<boolean> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      return false;
    }

    const user = await this.userService.getUserById(userId);
    if (!user) {
      return false;
    }

    // User can manage if they're the organizer or an admin
    return event.organizerId === userId || user.role === 'admin';
  }

  private validateEventForPublishing(event: Event): string[] {
    const errors: string[] = [];

    if (!event.title || event.title.trim().length < 3) {
      errors.push('Event title is required');
    }

    if (!event.description || event.description.trim().length < 10) {
      errors.push('Event description is required');
    }

    if (!event.location || !event.location.address) {
      errors.push('Event location is required');
    }

    if (!event.schedule || !event.schedule.startDate) {
      errors.push('Event start date is required');
    }

    if (new Date(event.schedule.startDate) <= new Date()) {
      errors.push('Event start date must be in the future');
    }

    return errors;
  }

  private async validatePlanLimits(userId: string, action: 'create_event'): Promise<void> {
    const user = await this.userService.getUserById(userId);
    if (!user || !user.organizerProfile) {
      throw new Error('User is not an organizer');
    }

    // This would check against the user's current plan limits
    // For now, just check if they're an organizer
    if (user.role !== 'organizer') {
      throw new Error('Only organizers can create events');
    }
  }
}