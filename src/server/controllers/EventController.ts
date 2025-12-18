import { Request, Response } from 'express';
import { EventService } from '../services/EventService';
import { CreateEventRequest, UpdateEventRequest } from '../../shared/models/Event';
import { SearchFilters, PaginationOptions } from '../../shared/types';

export class EventController {
  constructor(private eventService: EventService) {}

  async createEvent(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const eventData: CreateEventRequest = req.body;
      
      const event = await this.eventService.createEvent(userId, eventData);
      
      res.status(201).json({
        success: true,
        data: event,
        message: 'Event created successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Event creation failed'
      });
    }
  }

  async getAllEvents(req: Request, res: Response): Promise<void> {
    try {
      const pagination: PaginationOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await this.eventService.getAllEvents(pagination);
      
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch events'
      });
    }
  }

  async getEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const event = await this.eventService.getEventById(id);
      
      if (!event) {
        res.status(404).json({
          success: false,
          error: 'Event not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: event
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch event'
      });
    }
  }

  async updateEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;
      const eventData: UpdateEventRequest = req.body;
      
      const event = await this.eventService.updateEvent(id, userId, eventData);
      
      res.json({
        success: true,
        data: event,
        message: 'Event updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Event update failed'
      });
    }
  }

  async deleteEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;
      
      await this.eventService.deleteEvent(id, userId);
      
      res.json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Event deletion failed'
      });
    }
  }

  async searchEvents(req: Request, res: Response): Promise<void> {
    try {
      const filters: SearchFilters = {
        query: req.query.q as string,
        categories: req.query.categories ? (req.query.categories as string).split(',') as any : undefined,
        location: req.query.lat && req.query.lng ? {
          coordinates: [parseFloat(req.query.lng as string), parseFloat(req.query.lat as string)],
          radius: parseFloat(req.query.radius as string) || 10
        } : undefined,
        dateRange: req.query.startDate && req.query.endDate ? {
          start: new Date(req.query.startDate as string),
          end: new Date(req.query.endDate as string)
        } : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any
      };

      const pagination: PaginationOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await this.eventService.searchEvents(filters, pagination);
      
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Search failed'
      });
    }
  }

  async getMyEvents(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const pagination: PaginationOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await this.eventService.getEventsByOrganizer(userId, pagination);
      
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch events'
      });
    }
  }

  async publishEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;
      
      const event = await this.eventService.publishEvent(id, userId);
      
      res.json({
        success: true,
        data: event,
        message: 'Event published successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Event publishing failed'
      });
    }
  }

  async cancelEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;
      const { reason } = req.body;
      
      const event = await this.eventService.cancelEvent(id, userId, reason);
      
      res.json({
        success: true,
        data: event,
        message: 'Event cancelled successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Event cancellation failed'
      });
    }
  }

  async getEventCapacity(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const capacity = await this.eventService.checkCapacity(id);
      
      res.json({
        success: true,
        data: capacity
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch capacity'
      });
    }
  }

  async getEventAttendees(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;
      
      const attendees = await this.eventService.getEventAttendees(id, userId);
      
      res.json({
        success: true,
        data: attendees
      });
    } catch (error) {
      res.status(403).json({
        success: false,
        error: error instanceof Error ? error.message : 'Access denied'
      });
    }
  }

  async getEventAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;
      
      const analytics = await this.eventService.getEventAnalytics(id, userId);
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      res.status(403).json({
        success: false,
        error: error instanceof Error ? error.message : 'Access denied'
      });
    }
  }
}