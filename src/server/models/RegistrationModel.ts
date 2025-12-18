import { Registration, CreateRegistrationRequest } from '../../shared/models/Registration';
import { RegistrationStatus } from '../../shared/types';

export class RegistrationModel implements Registration {
  id: string;
  eventId: string;
  userId: string;
  status: RegistrationStatus;
  registeredAt: Date;
  checkedIn?: Date;
  waitlistPosition?: number;
  ticketId?: string;
  notes?: string;

  constructor(data: Partial<Registration>) {
    this.id = data.id || '';
    this.eventId = data.eventId || '';
    this.userId = data.userId || '';
    this.status = data.status || RegistrationStatus.CONFIRMED;
    this.registeredAt = data.registeredAt || new Date();
    this.checkedIn = data.checkedIn;
    this.waitlistPosition = data.waitlistPosition;
    this.ticketId = data.ticketId;
    this.notes = data.notes;
  }

  static validate(data: CreateRegistrationRequest): string[] {
    const errors: string[] = [];

    if (!data.eventId || data.eventId.trim().length === 0) {
      errors.push('Event ID is required');
    }

    if (data.notes && data.notes.length > 500) {
      errors.push('Notes must be less than 500 characters');
    }

    return errors;
  }

  static fromDatabase(row: any): RegistrationModel {
    return new RegistrationModel({
      id: row.id,
      eventId: row.event_id,
      userId: row.user_id,
      status: row.status,
      registeredAt: row.registered_at,
      checkedIn: row.checked_in,
      waitlistPosition: row.waitlist_position,
      ticketId: row.ticket_id,
      notes: row.notes
    });
  }

  toDatabase(): any {
    return {
      id: this.id,
      event_id: this.eventId,
      user_id: this.userId,
      status: this.status,
      registered_at: this.registeredAt,
      checked_in: this.checkedIn,
      waitlist_position: this.waitlistPosition,
      ticket_id: this.ticketId,
      notes: this.notes
    };
  }

  checkIn(): void {
    if (this.status === RegistrationStatus.CONFIRMED) {
      this.status = RegistrationStatus.CHECKED_IN;
      this.checkedIn = new Date();
    }
  }

  cancel(): void {
    this.status = RegistrationStatus.CANCELLED;
  }

  moveFromWaitlist(): void {
    if (this.status === RegistrationStatus.WAITLISTED) {
      this.status = RegistrationStatus.CONFIRMED;
      this.waitlistPosition = undefined;
    }
  }
}