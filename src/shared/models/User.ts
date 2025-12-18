import { UserRole, EventCategory, NotificationSettings, PlanType } from '../types';

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

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  profile?: Partial<UserProfile>;
  organizerProfile?: Partial<OrganizerProfile>;
}

export interface UpdateUserRequest {
  name?: string;
  profile?: Partial<UserProfile>;
  organizerProfile?: Partial<OrganizerProfile>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
  refreshToken: string;
}