import { ModerationStatus, ModerationAction } from '../types';

export interface ModerationFlag {
  id: string;
  contentType: 'event' | 'user' | 'comment' | 'review';
  contentId: string;
  reporterId: string;
  reason: string;
  description?: string;
  status: ModerationStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  action?: ModerationAction;
  actionReason?: string;
  createdAt: Date;
  
  // Populated fields
  reporter?: any; // User interface
  reviewer?: any; // User interface
  content?: any; // The flagged content
}

export interface CreateModerationFlagRequest {
  contentType: 'event' | 'user' | 'comment' | 'review';
  contentId: string;
  reason: string;
  description?: string;
}

export interface ReviewModerationFlagRequest {
  action: ModerationAction;
  actionReason?: string;
}