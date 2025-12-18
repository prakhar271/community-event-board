import { EmailService } from './EmailService';
import { UserRepository } from '../repositories/UserRepository';
import { EventRepository } from '../repositories/EventRepository';

export class NotificationService {
  constructor(
    private emailService: EmailService,
    private userRepository: UserRepository,
    private eventRepository: EventRepository
  ) {}

  async notifyEventUpdate(eventId: string, updateMessage: string): Promise<void> {
    // Get event details
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // In a complete implementation, this would use the RegistrationRepository
    // For now, we'll log the notification (in production, this would send actual notifications)
    console.log(`Sending event update notification for event ${eventId}: ${updateMessage}`);
  }

  async notifyEventCancellation(eventId: string, reason: string): Promise<void> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // In a complete implementation, this would get actual registered users
    // For now, we'll log the notification
    console.log(`Sending event cancellation notification for event ${eventId}: ${reason}`);
  }

  async notifyRegistrationConfirmation(userId: string, eventId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    const event = await this.eventRepository.findById(eventId);
    
    if (!user || !event) {
      throw new Error('User or event not found');
    }

    if (user.profile.notificationPreferences.email) {
      await this.emailService.sendRegistrationConfirmation(
        user.email,
        user.name,
        event.title,
        new Date(event.schedule.startDate)
      );
    }

    if (user.profile.notificationPreferences.push) {
      await this.sendPushNotification(user.id, {
        title: 'Registration Confirmed',
        body: `You're registered for ${event.title}`,
        data: { eventId, type: 'registration_confirmed' }
      });
    }
  }

  async notifyWaitlistAvailable(userId: string, eventId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    const event = await this.eventRepository.findById(eventId);
    
    if (!user || !event) {
      return;
    }

    if (user.profile.notificationPreferences.email) {
      // Send waitlist available email (would implement template)
    }

    if (user.profile.notificationPreferences.push) {
      await this.sendPushNotification(user.id, {
        title: 'Spot Available!',
        body: `A spot opened up for ${event.title}. Register now!`,
        data: { eventId, type: 'waitlist_available' }
      });
    }
  }

  async sendEventReminder(eventId: string): Promise<void> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      return;
    }

    // In a complete implementation, this would get actual registered users
    // For now, we'll log the notification
    console.log(`Sending event reminder for event ${eventId}`);
  }

  async sendRecommendationNotification(userId: string, eventIds: string[]): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.profile.notificationPreferences.recommendations) {
      return;
    }

    // Get event details
    const events = await Promise.all(
      eventIds.map(id => this.eventRepository.findById(id))
    );

    const validEvents = events.filter(event => event !== null);
    
    if (validEvents.length === 0) {
      return;
    }

    if (user.profile.notificationPreferences.push) {
      await this.sendPushNotification(user.id, {
        title: 'New Events for You',
        body: `We found ${validEvents.length} events you might like`,
        data: { eventIds, type: 'recommendations' }
      });
    }
  }

  private async sendPushNotification(userId: string, notification: {
    title: string;
    body: string;
    data?: any;
  }): Promise<void> {
    // This would integrate with Firebase Cloud Messaging or similar
    // For now, just log the notification
    console.log(`Push notification for user ${userId}:`, notification);
  }


}