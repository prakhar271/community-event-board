import { Router, Request, Response } from 'express';
import { ReviewController } from '../controllers/ReviewController';
import { ReviewService } from '../services/ReviewService';
import { ReviewRepository } from '../repositories/ReviewRepository';
import { RegistrationRepository } from '../repositories/RegistrationRepository';
import { EventRepository } from '../repositories/EventRepository';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateReview } from '../middleware/validation';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();

// Initialize services
const reviewRepository = new ReviewRepository();
const registrationRepository = new RegistrationRepository();
const eventRepository = new EventRepository();
const reviewService = new ReviewService(reviewRepository, registrationRepository, eventRepository);
const reviewController = new ReviewController(reviewService);

// Validation middleware
const validateReviewId = [
  param('id').isUUID().withMessage('Valid review ID is required'),
  handleValidationErrors
];

const validateEventId = [
  param('eventId').isUUID().withMessage('Valid event ID is required'),
  handleValidationErrors
];

const validateUpdateReview = [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment must be less than 1000 characters'),
  handleValidationErrors
];

const validateFlagReview = [
  body('reason').notEmpty().withMessage('Reason is required'),
  handleValidationErrors
];

const validateModerateReview = [
  body('action').isIn(['approve', 'reject', 'hide']).withMessage('Valid action is required'),
  handleValidationErrors
];

// Public routes
router.get('/event/:eventId', validateEventId, (req: Request, res: Response) => 
  reviewController.getEventReviews(req, res)
);

router.get('/event/:eventId/stats', validateEventId, (req: Request, res: Response) => 
  reviewController.getEventStats(req, res)
);

router.get('/:id', validateReviewId, (req: Request, res: Response) => 
  reviewController.getReview(req, res)
);

// Protected routes
router.post('/', authenticateToken, validateReview, (req: Request, res: Response) => 
  reviewController.createReview(req, res)
);

router.get('/my/reviews', authenticateToken, (req: Request, res: Response) => 
  reviewController.getUserReviews(req, res)
);

router.put('/:id', authenticateToken, validateReviewId, validateUpdateReview, (req: Request, res: Response) => 
  reviewController.updateReview(req, res)
);

router.delete('/:id', authenticateToken, validateReviewId, (req: Request, res: Response) => 
  reviewController.deleteReview(req, res)
);

router.post('/:id/flag', authenticateToken, validateReviewId, validateFlagReview, (req: Request, res: Response) => 
  reviewController.flagReview(req, res)
);

router.get('/event/:eventId/can-review', authenticateToken, validateEventId, (req: Request, res: Response) => 
  reviewController.canUserReview(req, res)
);

// Admin routes
router.get('/admin/flagged', authenticateToken, requireAdmin, (req: Request, res: Response) => 
  reviewController.getFlaggedReviews(req, res)
);

router.post('/:id/moderate', authenticateToken, requireAdmin, validateReviewId, validateModerateReview, (req: Request, res: Response) => 
  reviewController.moderateReview(req, res)
);

export default router;