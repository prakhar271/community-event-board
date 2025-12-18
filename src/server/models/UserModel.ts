import bcrypt from 'bcryptjs';
import { User, CreateUserRequest, UpdateUserRequest } from '../../shared/models/User';
import { UserRole, PlanType } from '../../shared/types';

export class UserModel implements User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profile: any;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  lastActive: Date;
  organizerProfile?: any;
  private password?: string;

  constructor(data: Partial<User & { password?: string }>) {
    this.id = data.id || '';
    this.email = data.email || '';
    this.name = data.name || '';
    this.role = data.role || UserRole.RESIDENT;
    this.profile = data.profile || {
      interests: [],
      notificationPreferences: {
        email: true,
        sms: false,
        push: true,
        eventUpdates: true,
        recommendations: true,
        marketing: false
      },
      isPhoneVerified: false
    };
    this.isVerified = data.isVerified || false;
    this.isActive = data.isActive !== false;
    this.createdAt = data.createdAt || new Date();
    this.lastActive = data.lastActive || new Date();
    this.organizerProfile = data.organizerProfile;
    this.password = data.password;
  }

  static async validate(data: CreateUserRequest | UpdateUserRequest): Promise<string[]> {
    const errors: string[] = [];

    if ('email' in data) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!data.email || !emailRegex.test(data.email)) {
        errors.push('Valid email address is required');
      }
    }

    if ('password' in data && data.password) {
      if (data.password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
        errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      }
    }

    if ('name' in data) {
      if (!data.name || data.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
      }
      if (data.name && data.name.length > 100) {
        errors.push('Name must be less than 100 characters');
      }
    }

    if ('role' in data) {
      if (!data.role || !Object.values(UserRole).includes(data.role)) {
        errors.push('Valid role is required');
      }
    }

    return errors;
  }

  async hashPassword(password: string): Promise<void> {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    this.password = await bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(password, this.password);
  }

  static fromDatabase(row: any): UserModel {
    return new UserModel({
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      profile: typeof row.profile === 'string' ? JSON.parse(row.profile) : row.profile,
      isVerified: row.is_verified,
      isActive: row.is_active,
      createdAt: row.created_at,
      lastActive: row.last_active,
      organizerProfile: row.organizer_profile ? 
        (typeof row.organizer_profile === 'string' ? JSON.parse(row.organizer_profile) : row.organizer_profile) : 
        undefined,
      password: row.password_hash
    });
  }

  toDatabase(): any {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      profile: JSON.stringify(this.profile),
      is_verified: this.isVerified,
      is_active: this.isActive,
      created_at: this.createdAt,
      last_active: this.lastActive,
      organizer_profile: this.organizerProfile ? JSON.stringify(this.organizerProfile) : null,
      password_hash: this.password
    };
  }

  toPublic(): Omit<User, 'password'> {
    const { password, ...publicUser } = this;
    return publicUser as User;
  }

  updateLastActive(): void {
    this.lastActive = new Date();
  }

  upgradeToOrganizer(organizerData: any): void {
    this.role = UserRole.ORGANIZER;
    this.organizerProfile = {
      organizationType: organizerData.organizationType || 'individual',
      website: organizerData.website,
      socialMedia: organizerData.socialMedia || {},
      verificationStatus: 'pending',
      verificationDocuments: [],
      currentPlan: PlanType.FREE,
      customBranding: {},
      ...organizerData
    };
  }
}