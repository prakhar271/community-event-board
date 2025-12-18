import { v4 as uuidv4 } from 'uuid';
import { Review, CreateReviewRequest, UpdateReviewRequest, ReviewStats } from '../../shared/models/Review';
import { ModerationStatus } from '../../shared/types';
import { ReviewRepository } from '../repositories/ReviewRepository';
import { RegistrationRepository } from '../repositories/RegistrationRepository';
import { EventRepository } from '../repositories/EventRepository';

export class ReviewService {
  constructor(
    private reviewRepository: ReviewRepository,
    private registrationRepository: RegistrationRepository,
    private eventRepository: EventRepository
  ) {}

  async createReview(userId: string, reviewData: CreateReviewRequest): Promise<Review> {
    // Validate review data
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Check if event exists
    const event = await this.eventRepository.findById(reviewData.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Check if user already reviewed this event
    const existingReview = await this.reviewRepository.findByEventAndUser(reviewData.eventId, userId);
    if (existingReview) {
      throw new Error('You have already reviewed this event');
    }

    // Check if user attended the event
    const registration = await this.registrationRepository.findByEventAndUser(reviewData.eventId, userId);
    const isVerifiedAttendee = registration?.status === 'checked_in';

    // Create review
    const review: Review = {
      id: uuidv4(),
      eventId: reviewData.eventId,
      userId,
      rating: reviewData.rating,
      comment: reviewData.comment,
      isVerifiedAttendee,
      status: ModerationStatus.APPROVED, // Auto-approve for now
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return await this.reviewRepository.create(review);
  }

  async updateReview(userId: string, reviewId: string, updateData: UpdateReviewRequest): Promise<Review> {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    if (review.userId !== userId) {
      throw new Error('Unauthorized to update this review');
    }

    // Validate rating if provided
    if (updateData.rating && (updateData.rating < 1 || updateData.rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }

    const updatedReview = await this.reviewRepository.update(reviewId, {
      ...updateData,
      updatedAt: new Date()
    });

    if (!updatedReview) {
      throw new Error('Failed to update review');
    }

    return updatedReview;
  }

  async deleteReview(userId: string, reviewId: string): Promise<void> {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    if (review.userId !== userId) {
      throw new Error('Unauthorized to delete this review');
    }

    const deleted = await this.reviewRepository.delete(reviewId);
    if (!deleted) {
      throw new Error('Failed to delete review');
    }
  }

  async getEventReviews(eventId: string, page: number = 1, limit: number = 20): Promise<Review[]> {
    const offset = (page - 1) * limit;
    return await this.reviewRepository.findByEvent(eventId, limit, offset);
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    return await this.reviewRepository.findByUser(userId);
  }

  async getReviewById(reviewId: string): Promise<Review | null> {
    return await this.reviewRepository.findById(reviewId);
  }

  async getEventStats(eventId: string): Promise<ReviewStats> {
    return await this.reviewRepository.getEventStats(eventId);
  }

  async flagReview(reviewId: string, reason: string): Promise<Review> {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    const updatedReview = await this.reviewRepository.update(reviewId, {
      status: ModerationStatus.FLAGGED,
      flaggedReason: reason,
      updatedAt: new Date()
    });

    if (!updatedReview) {
      throw new Error('Failed to flag review');
    }

    return updatedReview;
  }

  async moderateReview(adminId: string, reviewId: string, action: 'approve' | 'reject' | 'hide'): Promise<Review> {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    let newStatus: ModerationStatus;
    switch (action) {
      case 'approve':
        newStatus = ModerationStatus.APPROVED;
        break;
      case 'reject':
      case 'hide':
        newStatus = ModerationStatus.REJECTED;
        break;
      default:
        throw new Error('Invalid moderation action');
    }

    const updatedReview = await this.reviewRepository.update(reviewId, {
      status: newStatus,
      updatedAt: new Date()
    });

    if (!updatedReview) {
      throw new Error('Failed to moderate review');
    }

    return updatedReview;
  }

  async getFlaggedReviews(): Promise<Review[]> {
    return await this.reviewRepository.getFlaggedReviews();
  }

  async canUserReview(userId: string, eventId: string): Promise<boolean> {
    // Check if event exists and is completed
    const event = await this.eventRepository.findById(eventId);
    if (!event || new Date(event.schedule.endDate) > new Date()) {
      return false;
    }

    // Check if user attended the event
    const registration = await this.registrationRepository.findByEventAndUser(eventId, userId);
    if (!registration || registration.status !== 'checked_in') {
      return false;
    }

    // Check if user already reviewed
    const existingReview = await this.reviewRepository.findByEventAndUser(eventId, userId);
    return !existingReview;
  }
}