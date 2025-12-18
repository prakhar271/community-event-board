import { v4 as uuidv4 } from 'uuid';
import { Registration, CreateRegistrationRequest } from '../../shared/models/Registration';
import { RegistrationStatus } from '../../shared/types';
import { RegistrationRepository } from '../repositories/RegistrationRepository';
import { EventRepository } from '../repositories/EventRepository';
import { UserRepository } from '../repositories/UserRepository';
import { NotificationService } from './NotificationService';
import { RegistrationModel } from '../models/RegistrationModel';

export class RegistrationService {
  constructor(
    private registrationRepository: RegistrationRepository,
    private eventRepository: EventRepository,
    private userRepository: UserRepository,
    private notificationService: NotificationService
  ) {}

  async registerForEvent(userId: string, registrationData: CreateRegistrationRequest): Promise<Registration> {
    // Validate registration data
    const validationErrors = RegistrationModel.validate(registrationData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Check if event exists
    const event = await this.eventRepository.findById(registrationData.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Check if user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if already registered
    const existingRegistration = await this.registrationRepository.findByEventAndUser(
      registrationData.eventId,
      userId
    );
    if (existingRegistration) {
      throw new Error('Already registered for this event');
    }

    // Check event capacity
    const capacityInfo = await this.registrationRepository.getEventCapacity(registrationData.eventId);
    let status = RegistrationStatus.CONFIRMED;
    let waitlistPosition: number | undefined;

    if (event.capacity && capacityInfo.confirmed >= event.capacity) {
      status = RegistrationStatus.WAITLISTED;
      waitlistPosition = await this.registrationRepository.getNextWaitlistPosition(registrationData.eventId);
    }

    // Check registration deadline
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      throw new Error('Registration deadline has passed');
    }

    // Create registration
    const registration = new RegistrationModel({
      id: uuidv4(),
      eventId: registrationData.eventId,
      userId,
      status,
      registeredAt: new Date(),
      waitlistPosition,
      notes: registrationData.notes
    });

    const savedRegistration = await this.registrationRepository.create(registration);

    // Send confirmation notification
    if (status === RegistrationStatus.CONFIRMED) {
      await this.notificationService.notifyRegistrationConfirmation(userId, registrationData.eventId);
    }

    return savedRegistration;
  }

  async cancelRegistration(userId: string, registrationId: string): Promise<void> {
    const registration = await this.registrationRepository.findById(registrationId);
    if (!registration) {
      throw new Error('Registration not found');
    }

    if (registration.userId !== userId) {
      throw new Error('Unauthorized to cancel this registration');
    }

    if (registration.status === RegistrationStatus.CANCELLED) {
      throw new Error('Registration already cancelled');
    }

    // Cancel the registration
    registration.cancel();
    await this.registrationRepository.update(registrationId, registration);

    // If this was a confirmed registration, move someone from waitlist
    if (registration.status === RegistrationStatus.CONFIRMED) {
      const movedRegistrations = await this.registrationRepository.moveFromWaitlist(registration.eventId, 1);
      
      // Notify users moved from waitlist
      for (const movedReg of movedRegistrations) {
        await this.notificationService.notifyWaitlistAvailable(movedReg.userId, registration.eventId);
      }
    }
  }

  async checkInUser(organizerId: string, registrationId: string): Promise<Registration> {
    const registration = await this.registrationRepository.findById(registrationId);
    if (!registration) {
      throw new Error('Registration not found');
    }

    // Verify organizer owns the event
    const event = await this.eventRepository.findById(registration.eventId);
    if (!event || event.organizerId !== organizerId) {
      throw new Error('Unauthorized to check in for this event');
    }

    if (registration.status !== RegistrationStatus.CONFIRMED) {
      throw new Error('Only confirmed registrations can be checked in');
    }

    registration.checkIn();
    return await this.registrationRepository.update(registrationId, registration) || registration;
  }

  async getUserRegistrations(userId: string): Promise<Registration[]> {
    return await this.registrationRepository.findByUser(userId);
  }

  async getEventRegistrations(eventId: string, organizerId: string): Promise<Registration[]> {
    // Verify organizer owns the event
    const event = await this.eventRepository.findById(eventId);
    if (!event || event.organizerId !== organizerId) {
      throw new Error('Unauthorized to view registrations for this event');
    }

    return await this.registrationRepository.findByEvent(eventId);
  }

  async getRegistrationById(id: string): Promise<Registration | null> {
    return await this.registrationRepository.findById(id);
  }

  async updateRegistration(userId: string, registrationId: string, updateData: any): Promise<Registration> {
    const registration = await this.registrationRepository.findById(registrationId);
    if (!registration) {
      throw new Error('Registration not found');
    }

    if (registration.userId !== userId) {
      throw new Error('Unauthorized to update this registration');
    }

    const updatedRegistration = await this.registrationRepository.update(registrationId, updateData);
    if (!updatedRegistration) {
      throw new Error('Failed to update registration');
    }

    return updatedRegistration;
  }

  async getEventCapacity(eventId: string): Promise<{ available: number; total: number; waitlist: number }> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const capacityInfo = await this.registrationRepository.getEventCapacity(eventId);
    
    return {
      total: event.capacity || -1,
      available: event.capacity ? Math.max(0, event.capacity - capacityInfo.confirmed) : -1,
      waitlist: capacityInfo.waitlisted
    };
  }

  async processEventCancellation(eventId: string): Promise<void> {
    // Get all registrations for the event
    const registrations = await this.registrationRepository.findByEvent(eventId);
    
    // Cancel all registrations
    for (const registration of registrations) {
      if (registration.status !== RegistrationStatus.CANCELLED) {
        registration.cancel();
        await this.registrationRepository.update(registration.id, registration);
      }
    }
  }
}