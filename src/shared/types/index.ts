// Core Types and Enums

export enum UserRole {
  RESIDENT = 'resident',
  ORGANIZER = 'organizer',
  ADMIN = 'admin'
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export enum EventCategory {
  CULTURAL = 'cultural',
  EDUCATIONAL = 'educational',
  SOCIAL = 'social',
  SPORTS = 'sports',
  TECHNOLOGY = 'technology',
  BUSINESS = 'business',
  HEALTH = 'health',
  ARTS = 'arts',
  MUSIC = 'music',
  FOOD = 'food'
}

export enum RegistrationStatus {
  CONFIRMED = 'confirmed',
  WAITLISTED = 'waitlisted',
  CANCELLED = 'cancelled',
  CHECKED_IN = 'checked_in'
}

export enum ModerationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged'
}

export enum ModerationAction {
  APPROVE = 'approve',
  EDIT = 'edit',
  REMOVE = 'remove',
  BAN_USER = 'ban_user'
}

export enum PlanType {
  FREE = 'free',
  PREMIUM = 'premium',
  PRO = 'pro'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PENDING = 'pending'
}

export enum TransactionType {
  SUBSCRIPTION = 'subscription',
  TICKET = 'ticket',
  REFUND = 'refund'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum TicketStatus {
  ACTIVE = 'active',
  USED = 'used',
  REFUNDED = 'refunded'
}

export enum NotificationType {
  EVENT_UPDATE = 'event_update',
  REGISTRATION_CONFIRMED = 'registration_confirmed',
  EVENT_REMINDER = 'event_reminder',
  WAITLIST_AVAILABLE = 'waitlist_available',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed'
}

// Location interface
export interface Location {
  address: string;
  coordinates: [number, number]; // [longitude, latitude]
  venue?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
}

// Schedule interface
export interface Schedule {
  startDate: Date;
  endDate: Date;
  timezone: string;
}

// Notification Settings
export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  eventUpdates: boolean;
  recommendations: boolean;
  marketing: boolean;
}

// Plan Features Configuration
export interface PlanFeatures {
  maxEvents: number; // -1 for unlimited
  maxAttendeesPerEvent: number; // -1 for unlimited
  analyticsAccess: boolean;
  prioritySupport: boolean;
  customBranding: boolean;
  advancedNotifications: boolean;
  price?: number; // in paise, undefined for free
}

export const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  [PlanType.FREE]: {
    maxEvents: 3,
    maxAttendeesPerEvent: 50,
    analyticsAccess: false,
    prioritySupport: false,
    customBranding: false,
    advancedNotifications: false
  },
  [PlanType.PREMIUM]: {
    maxEvents: 25,
    maxAttendeesPerEvent: 500,
    analyticsAccess: true,
    prioritySupport: false,
    customBranding: true,
    advancedNotifications: true,
    price: 29900 // ₹299 in paise
  },
  [PlanType.PRO]: {
    maxEvents: -1, // unlimited
    maxAttendeesPerEvent: -1, // unlimited
    analyticsAccess: true,
    prioritySupport: true,
    customBranding: true,
    advancedNotifications: true,
    price: 59900 // ₹599 in paise
  }
};

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profile: UserProfile;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  lastActive: Date;
  
  // Organizer-specific fields
  organizerProfile?: OrganizerProfile;
}

export interface UserProfile {
  avatar?: string;
  bio?: string;
  location?: [number, number]; // [longitude, latitude]
  city?: string;
  interests: EventCategory[];
  notificationPreferences: NotificationSettings;
  dateOfBirth?: Date;
  phoneNumber?: string;
  isPhoneVerified: boolean;
}

export interface OrganizerProfile {
  organizationName?: string;
  organizationType: 'individual' | 'nonprofit' | 'business' | 'government';
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationDocuments?: string[];
  currentPlan: PlanType;
  planExpiresAt?: Date;
  customBranding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  categories?: EventCategory[];
  location?: {
    coordinates: [number, number];
    radius: number; // in kilometers
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  sortBy?: 'date' | 'distance' | 'popularity' | 'price';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}