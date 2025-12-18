import { Request, Response } from 'express';
import { RegistrationService } from '../services/RegistrationService';
import { CreateRegistrationRequest } from '../../shared/models/Registration';

export class RegistrationController {
  constructor(private registrationService: RegistrationService) {}

  async registerForEvent(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const registrationData: CreateRegistrationRequest = req.body;
      
      const registration = await this.registrationService.registerForEvent(userId, registrationData);
      
      res.status(201).json({
        success: true,
        data: registration,
        message: registration.status === 'confirmed' 
          ? 'Successfully registered for event' 
          : 'Added to waitlist'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      });
    }
  }

  async cancelRegistration(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      
      await this.registrationService.cancelRegistration(userId, id);
      
      res.json({
        success: true,
        message: 'Registration cancelled successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Cancellation failed'
      });
    }
  }

  async checkInUser(req: Request, res: Response): Promise<void> {
    try {
      const organizerId = (req as any).user.userId;
      const { id } = req.params;
      
      const registration = await this.registrationService.checkInUser(organizerId, id);
      
      res.json({
        success: true,
        data: registration,
        message: 'User checked in successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Check-in failed'
      });
    }
  }

  async getUserRegistrations(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      
      const registrations = await this.registrationService.getUserRegistrations(userId);
      
      res.json({
        success: true,
        data: registrations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch registrations'
      });
    }
  }

  async getEventRegistrations(req: Request, res: Response): Promise<void> {
    try {
      const organizerId = (req as any).user.userId;
      const { eventId } = req.params;
      
      const registrations = await this.registrationService.getEventRegistrations(eventId, organizerId);
      
      res.json({
        success: true,
        data: registrations
      });
    } catch (error) {
      res.status(403).json({
        success: false,
        error: error instanceof Error ? error.message : 'Access denied'
      });
    }
  }

  async getRegistration(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const registration = await this.registrationService.getRegistrationById(id);
      
      if (!registration) {
        res.status(404).json({
          success: false,
          error: 'Registration not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: registration
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch registration'
      });
    }
  }

  async updateRegistration(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      const updateData = req.body;
      
      const registration = await this.registrationService.updateRegistration(userId, id, updateData);
      
      res.json({
        success: true,
        data: registration,
        message: 'Registration updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Update failed'
      });
    }
  }
}