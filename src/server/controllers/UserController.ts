import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import fs from 'fs-extra';
import path from 'path';

export class UserController {
  constructor(private userService: UserService) {}

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      
      const user = await this.userService.getUserById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      // Return user profile (password is already private)

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user profile'
      });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const profileData = req.body;

      const updatedUser = await this.userService.updateProfile(userId, profileData);

      res.json({
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }
  }

  async uploadAvatar(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
        return;
      }

      // Get current user to remove old avatar
      const currentUser = await this.userService.getUserById(userId);
      if (currentUser?.profile.avatar) {
        try {
          await fs.remove(path.join(process.cwd(), currentUser.profile.avatar));
        } catch (error) {
          console.error('Failed to remove old avatar:', error);
        }
      }

      // Update user with new avatar path
      const avatarPath = `uploads/avatars/${req.file.filename}`;
      const updatedUser = await this.userService.updateProfile(userId, {
        avatar: avatarPath
      });

      res.json({
        success: true,
        data: {
          avatar: avatarPath
        },
        message: 'Avatar uploaded successfully'
      });
    } catch (error) {
      console.error('Upload avatar error:', error);
      
      // Clean up uploaded file on error
      if (req.file) {
        try {
          await fs.remove(req.file.path);
        } catch (cleanupError) {
          console.error('Failed to cleanup uploaded file:', cleanupError);
        }
      }

      res.status(500).json({
        success: false,
        error: 'Failed to upload avatar'
      });
    }
  }

  async deleteAvatar(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;

      // Get current user
      const currentUser = await this.userService.getUserById(userId);
      if (!currentUser?.profile.avatar) {
        res.status(404).json({
          success: false,
          error: 'No avatar to delete'
        });
        return;
      }

      // Remove avatar file
      try {
        await fs.remove(path.join(process.cwd(), currentUser.profile.avatar));
      } catch (error) {
        console.error('Failed to remove avatar file:', error);
      }

      // Update user profile
      await this.userService.updateProfile(userId, {
        avatar: null
      });

      res.json({
        success: true,
        message: 'Avatar deleted successfully'
      });
    } catch (error) {
      console.error('Delete avatar error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete avatar'
      });
    }
  }

  async upgradeToOrganizer(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const organizerData = req.body;

      const updatedUser = await this.userService.upgradeToOrganizer(userId, organizerData);

      res.json({
        success: true,
        data: updatedUser,
        message: 'Successfully upgraded to organizer'
      });
    } catch (error) {
      console.error('Upgrade to organizer error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upgrade to organizer'
      });
    }
  }
}