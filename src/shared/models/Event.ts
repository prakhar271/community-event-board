import { EventStatus, EventCategory, Location, Schedule } from '../types';

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  organizerId: string;
  location: Location;
  schedule: Schedule;
  capacity?: number;
  registrationDeadline?: Date;
  requirements?: string[];
  images: string[];
  status: EventStatus;
  isPaid: boolean;
  ticketPrice?: number; // in paise
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  
  // Computed fields (not stored in DB)
  currentAttendees?: number;
  averageRating?: number;
  reviewCount?: number;
  isRegistrationOpen?: boolean;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  category: EventCategory;
  location: Location;
  schedule: Schedule;
  capacity?: number;
  registrationDeadline?: Date;
  requirements?: string[];
  isPaid: boolean;
  ticketPrice?: number;
  tags?: string[];
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  status?: EventStatus;
}