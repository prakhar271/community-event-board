import { User, CreateUserRequest, UpdateUserRequest, LoginRequest, AuthResponse } from '../models/User';
import { PlanType } from '../types';

export interface IUserService {
  // Authentication
  register(userData: CreateUserRequest): Promise<AuthResponse>;
  login(credentials: LoginRequest): Promise<AuthResponse>;
  refreshToken(refreshToken: string): Promise<AuthResponse>;
  logout(userId: string): Promise<void>;
  
  // User management
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  updateUser(id: string, userData: UpdateUserRequest): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  // Profile management
  updateProfile(userId: string, profileData: any): Promise<User>;
  uploadAvatar(userId: string, file: any): Promise<string>;
  
  // Organizer features
  upgradeToOrganizer(userId: string, organizerData: any): Promise<User>;
  verifyOrganizer(userId: string, adminId: string): Promise<User>;
  updateSubscription(userId: string, planType: PlanType): Promise<User>;
  
  // Preferences and settings
  updateNotificationPreferences(userId: string, preferences: any): Promise<User>;
  updateInterests(userId: string, interests: string[]): Promise<User>;
  
  // Verification
  sendEmailVerification(userId: string): Promise<void>;
  verifyEmail(token: string): Promise<User>;
  sendPhoneVerification(userId: string): Promise<void>;
  verifyPhone(userId: string, code: string): Promise<User>;
  
  // Password management
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
  
  // Admin functions
  getAllUsers(pagination: any): Promise<any>;
  suspendUser(userId: string, adminId: string, reason: string): Promise<User>;
  activateUser(userId: string, adminId: string): Promise<User>;
}