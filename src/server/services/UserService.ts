import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { IUserService } from '../../shared/interfaces/IUserService';
import { User, CreateUserRequest, UpdateUserRequest, LoginRequest, AuthResponse } from '../../shared/models/User';
import { PlanType, UserRole } from '../../shared/types';
import { UserModel } from '../models/UserModel';
import { UserRepository } from '../repositories/UserRepository';
import { EmailService } from './EmailService';

export class UserService implements IUserService {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService
  ) {}

  async register(userData: CreateUserRequest): Promise<AuthResponse> {
    // Validate user data
    const validationErrors = await UserModel.validate(userData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create user with default profile
    const defaultProfile = {
      interests: userData.profile?.interests || [],
      notificationPreferences: userData.profile?.notificationPreferences || {
        email: true,
        sms: false,
        push: true,
        eventUpdates: true,
        recommendations: true,
        marketing: false
      },
      isPhoneVerified: false,
      ...userData.profile
    };

    const user = new UserModel({
      id: uuidv4(),
      email: userData.email,
      name: userData.name,
      role: userData.role,
      profile: defaultProfile,
      organizerProfile: userData.organizerProfile ? {
        organizationType: userData.organizerProfile.organizationType || 'individual',
        verificationStatus: 'pending',
        currentPlan: PlanType.FREE,
        ...userData.organizerProfile
      } : undefined,
      createdAt: new Date(),
      lastActive: new Date()
    });

    // Hash password
    await user.hashPassword(userData.password);

    // Save user
    const savedUser = await this.userRepository.create(user);

    // Send verification email
    await this.sendEmailVerification(savedUser.id);

    // Generate tokens
    const { token, refreshToken } = this.generateTokens(savedUser);

    return {
      user: savedUser.toPublic(),
      token,
      refreshToken
    };
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Find user by email
    const user = await this.userRepository.findByEmail(credentials.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is suspended');
    }

    // Verify password
    const isValidPassword = await user.comparePassword(credentials.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last active
    user.updateLastActive();
    await this.userRepository.update(user.id, user);

    // Generate tokens
    const { token, refreshToken } = this.generateTokens(user);

    return {
      user: user.toPublic(),
      token,
      refreshToken
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any;
      const user = await this.userRepository.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        throw new Error('Invalid refresh token');
      }

      const { token: newToken, refreshToken: newRefreshToken } = this.generateTokens(user);

      return {
        user: user.toPublic(),
        token: newToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    // In a production app, you might want to blacklist the token
    // For now, we'll just update the last active time
    const user = await this.userRepository.findById(userId);
    if (user) {
      user.updateLastActive();
      await this.userRepository.update(userId, user);
    }
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    const validationErrors = await UserModel.validate(userData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    const updatedUser = await this.userRepository.update(id, userData);
    if (!updatedUser) {
      throw new Error('User not found');
    }

    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new Error('User not found');
    }
  }

  async updateProfile(userId: string, profileData: any): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedProfile = { ...user.profile, ...profileData };
    const updatedUser = await this.userRepository.update(userId, { profile: updatedProfile });
    if (!updatedUser) {
      throw new Error('Failed to update user profile');
    }
    return updatedUser;
  }

  async uploadAvatar(userId: string, file: any): Promise<string> {
    // In a production environment, this would upload to cloud storage (AWS S3, Cloudinary, etc.)
    // For now, we'll simulate a local file upload
    const filename = `${userId}-${Date.now()}.${file.originalname?.split('.').pop() || 'jpg'}`;
    const avatarUrl = `/uploads/avatars/${filename}`;
    
    await this.updateProfile(userId, { avatar: avatarUrl });
    
    return avatarUrl;
  }

  async upgradeToOrganizer(userId: string, organizerData: any): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.upgradeToOrganizer(organizerData);
    const updatedUser = await this.userRepository.update(userId, user);
    if (!updatedUser) {
      throw new Error('Failed to upgrade user to organizer');
    }
    return updatedUser;
  }

  async verifyOrganizer(userId: string, adminId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.organizerProfile) {
      throw new Error('User or organizer profile not found');
    }

    user.organizerProfile.verificationStatus = 'verified';
    const updatedUser = await this.userRepository.update(userId, user);
    if (!updatedUser) {
      throw new Error('Failed to verify organizer');
    }
    return updatedUser;
  }

  async updateSubscription(userId: string, planType: PlanType): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.organizerProfile) {
      throw new Error('User or organizer profile not found');
    }

    user.organizerProfile.currentPlan = planType;
    if (planType !== PlanType.FREE) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
      user.organizerProfile.planExpiresAt = expiresAt;
    }

    const updatedUser = await this.userRepository.update(userId, user);
    if (!updatedUser) {
      throw new Error('Failed to update subscription');
    }
    return updatedUser;
  }

  async updateNotificationPreferences(userId: string, preferences: any): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.profile.notificationPreferences = { ...user.profile.notificationPreferences, ...preferences };
    const updatedUser = await this.userRepository.update(userId, user);
    if (!updatedUser) {
      throw new Error('Failed to update notification preferences');
    }
    return updatedUser;
  }

  async updateInterests(userId: string, interests: string[]): Promise<User> {
    return await this.updateProfile(userId, { interests });
  }

  async sendEmailVerification(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const token = jwt.sign(
      { userId: user.id, type: 'email_verification' },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    try {
      await this.emailService.sendVerificationEmail(user.email, user.name, token);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't throw error in development mode
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Failed to send verification email');
      }
    }
  }

  async verifyEmail(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      if (decoded.type !== 'email_verification') {
        throw new Error('Invalid token type');
      }

      const user = await this.userRepository.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.isVerified = true;
      const updatedUser = await this.userRepository.update(user.id, user);
      if (!updatedUser) {
        throw new Error('Failed to verify user');
      }
      return updatedUser;
    } catch (error) {
      throw new Error('Invalid or expired verification token');
    }
  }

  async sendPhoneVerification(userId: string): Promise<void> {
    // This would integrate with SMS service like Twilio
    // For now, just log the action
    console.log(`Phone verification sent for user ${userId}`);
  }

  async verifyPhone(userId: string, code: string): Promise<User> {
    // This would verify the SMS code
    // For now, just mark as verified
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.profile.isPhoneVerified = true;
    const updatedUser = await this.userRepository.update(userId, user);
    if (!updatedUser) {
      throw new Error('Failed to verify phone number');
    }
    return updatedUser;
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not
      return;
    }

    const token = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    await this.emailService.sendPasswordResetEmail(user.email, user.name, token);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      if (decoded.type !== 'password_reset') {
        throw new Error('Invalid token type');
      }

      const user = await this.userRepository.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      await user.hashPassword(newPassword);
      await this.userRepository.update(user.id, user);
    } catch (error) {
      throw new Error('Invalid or expired reset token');
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    await user.hashPassword(newPassword);
    await this.userRepository.update(userId, user);
  }

  async getAllUsers(pagination: any): Promise<any> {
    // This would be implemented for admin functionality
    return { users: [], total: 0 };
  }

  async suspendUser(userId: string, adminId: string, reason: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.isActive = false;
    const updatedUser = await this.userRepository.update(userId, user);
    if (!updatedUser) {
      throw new Error('Failed to deactivate user');
    }
    return updatedUser;
  }

  async activateUser(userId: string, adminId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.isActive = true;
    const updatedUser = await this.userRepository.update(userId, user);
    if (!updatedUser) {
      throw new Error('Failed to activate user');
    }
    return updatedUser;
  }

  private generateTokens(user: UserModel): { token: string; refreshToken: string } {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    return { token, refreshToken };
  }
}