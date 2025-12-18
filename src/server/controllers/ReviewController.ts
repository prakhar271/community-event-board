import { Request, Response } from 'express';
import { ReviewService } from '../services/ReviewService';
import { CreateReviewRequest, UpdateReviewRequest } from '../../shared/models/Review';

export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  async createReview(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const reviewData: CreateReviewRequest = req.body;
      
      const review = await this.reviewService.createReview(userId, reviewData);
      
      res.status(201).json({
        success: true,
        data: review,
        message: 'Review created successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Review creation failed'
      });
    }
  }

  async updateReview(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      const updateData: UpdateReviewRequest = req.body;
      
      const review = await this.reviewService.updateReview(userId, id, updateData);
      
      res.json({
        success: true,
        data: review,
        message: 'Review updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Review update failed'
      });
    }
  }

  async deleteReview(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      
      await this.reviewService.deleteReview(userId, id);
      
      res.json({
        success: true,
        message: 'Review deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Review deletion failed'
      });
    }
  }

  async getEventReviews(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const reviews = await this.reviewService.getEventReviews(eventId, page, limit);
      
      res.json({
        success: true,
        data: reviews
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch reviews'
      });
    }
  }

  async getUserReviews(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      
      const reviews = await this.reviewService.getUserReviews(userId);
      
      res.json({
        success: true,
        data: reviews
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch reviews'
      });
    }
  }

  async getReview(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const review = await this.reviewService.getReviewById(id);
      
      if (!review) {
        res.status(404).json({
          success: false,
          error: 'Review not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: review
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch review'
      });
    }
  }

  async getEventStats(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      
      const stats = await this.reviewService.getEventStats(eventId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch stats'
      });
    }
  }

  async flagReview(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const review = await this.reviewService.flagReview(id, reason);
      
      res.json({
        success: true,
        data: review,
        message: 'Review flagged for moderation'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to flag review'
      });
    }
  }

  async moderateReview(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user.userId;
      const { id } = req.params;
      const { action } = req.body;
      
      const review = await this.reviewService.moderateReview(adminId, id, action);
      
      res.json({
        success: true,
        data: review,
        message: `Review ${action}d successfully`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Moderation failed'
      });
    }
  }

  async getFlaggedReviews(req: Request, res: Response): Promise<void> {
    try {
      const reviews = await this.reviewService.getFlaggedReviews();
      
      res.json({
        success: true,
        data: reviews
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch flagged reviews'
      });
    }
  }

  async canUserReview(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { eventId } = req.params;
      
      const canReview = await this.reviewService.canUserReview(userId, eventId);
      
      res.json({
        success: true,
        data: { canReview }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check review eligibility'
      });
    }
  }
}