import { ModerationStatus } from '../types';

export interface Review {
  id: string;
  eventId: string;
  userId: string;
  rating: number; // 1-5 stars
  comment?: string;
  isVerifiedAttendee: boolean;
  status: ModerationStatus;
  flaggedReason?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Populated fields
  event?: any; // Event interface
  user?: any; // User interface (name, avatar only)
}

export interface CreateReviewRequest {
  eventId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}