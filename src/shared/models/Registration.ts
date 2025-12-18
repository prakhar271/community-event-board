import { RegistrationStatus } from '../types';

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  status: RegistrationStatus;
  registeredAt: Date;
  checkedIn?: Date;
  waitlistPosition?: number;
  ticketId?: string; // for paid events
  notes?: string;
  
  // Populated fields
  event?: any; // Event interface
  user?: any; // User interface
}

export interface CreateRegistrationRequest {
  eventId: string;
  notes?: string;
}

export interface UpdateRegistrationRequest {
  status?: RegistrationStatus;
  notes?: string;
}

export interface BulkRegistrationRequest {
  eventId: string;
  userEmails: string[];
  sendInvitations: boolean;
}