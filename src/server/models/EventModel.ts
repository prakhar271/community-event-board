import { Event, CreateEventRequest, UpdateEventRequest } from '../../shared/models/Event';
import { EventStatus, EventCategory } from '../../shared/types';

export class EventModel implements Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  organizerId: string;
  location: any;
  schedule: any;
  capacity?: number;
  registrationDeadline?: Date;
  requirements?: string[];
  images: string[];
  status: EventStatus;
  isPaid: boolean;
  ticketPrice?: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<Event>) {
    this.id = data.id || '';
    this.title = data.title || '';
    this.description = data.description || '';
    this.category = data.category || EventCategory.CULTURAL;
    this.organizerId = data.organizerId || '';
    this.location = data.location || {};
    this.schedule = data.schedule || {};
    this.capacity = data.capacity;
    this.registrationDeadline = data.registrationDeadline;
    this.requirements = data.requirements || [];
    this.images = data.images || [];
    this.status = data.status || EventStatus.DRAFT;
    this.isPaid = data.isPaid || false;
    this.ticketPrice = data.ticketPrice;
    this.tags = data.tags || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static validate(data: CreateEventRequest | UpdateEventRequest): string[] {
    const errors: string[] = [];

    if ('title' in data) {
      if (!data.title || data.title.trim().length < 3) {
        errors.push('Title must be at least 3 characters long');
      }
      if (data.title && data.title.length > 200) {
        errors.push('Title must be less than 200 characters');
      }
    }

    if ('description' in data) {
      if (!data.description || data.description.trim().length < 10) {
        errors.push('Description must be at least 10 characters long');
      }
      if (data.description && data.description.length > 5000) {
        errors.push('Description must be less than 5000 characters');
      }
    }

    if ('category' in data) {
      if (!data.category || !Object.values(EventCategory).includes(data.category)) {
        errors.push('Valid category is required');
      }
    }

    if ('location' in data && data.location) {
      if (!data.location.address || data.location.address.trim().length < 5) {
        errors.push('Location address must be at least 5 characters long');
      }
      if (!data.location.coordinates || data.location.coordinates.length !== 2) {
        errors.push('Valid coordinates [longitude, latitude] are required');
      }
      if (!data.location.city || data.location.city.trim().length < 2) {
        errors.push('City is required');
      }
    }

    if ('schedule' in data && data.schedule) {
      const now = new Date();
      if (!data.schedule.startDate || new Date(data.schedule.startDate) <= now) {
        errors.push('Start date must be in the future');
      }
      if (!data.schedule.endDate || new Date(data.schedule.endDate) <= new Date(data.schedule.startDate)) {
        errors.push('End date must be after start date');
      }
      if (!data.schedule.timezone) {
        errors.push('Timezone is required');
      }
    }

    if ('capacity' in data && data.capacity !== undefined) {
      if (data.capacity < 1 || data.capacity > 100000) {
        errors.push('Capacity must be between 1 and 100,000');
      }
    }

    if ('isPaid' in data && data.isPaid) {
      if (!data.ticketPrice || data.ticketPrice < 100) { // Minimum ₹1
        errors.push('Ticket price must be at least ₹1 (100 paise)');
      }
      if (data.ticketPrice && data.ticketPrice > 10000000) { // Maximum ₹100,000
        errors.push('Ticket price must be less than ₹100,000');
      }
    }

    if ('registrationDeadline' in data && data.registrationDeadline) {
      if (data.schedule && new Date(data.registrationDeadline) >= new Date(data.schedule.startDate)) {
        errors.push('Registration deadline must be before event start date');
      }
    }

    return errors;
  }

  static fromDatabase(row: any): EventModel {
    return new EventModel({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      organizerId: row.organizer_id,
      location: row.location,
      schedule: row.schedule,
      capacity: row.capacity,
      registrationDeadline: row.registration_deadline,
      requirements: row.requirements,
      images: row.images,
      status: row.status,
      isPaid: row.is_paid,
      ticketPrice: row.ticket_price,
      tags: row.tags,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  toDatabase(): any {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      category: this.category,
      organizer_id: this.organizerId,
      location: JSON.stringify(this.location),
      schedule: JSON.stringify(this.schedule),
      capacity: this.capacity,
      registration_deadline: this.registrationDeadline,
      requirements: JSON.stringify(this.requirements),
      images: JSON.stringify(this.images),
      status: this.status,
      is_paid: this.isPaid,
      ticket_price: this.ticketPrice,
      tags: JSON.stringify(this.tags),
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }
}