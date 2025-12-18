import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
    return;
  }
  next();
};

// User validation rules
export const validateUserRegistration = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('role').isIn(['resident', 'organizer']).withMessage('Role must be resident or organizer'),
  handleValidationErrors
];

export const validateUserLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// Event validation rules
export const validateEventCreation = [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('description').trim().isLength({ min: 10, max: 5000 }).withMessage('Description must be between 10 and 5000 characters'),
  body('category').isIn(['cultural', 'educational', 'social', 'sports', 'technology', 'business', 'health', 'arts', 'music', 'food']).withMessage('Valid category is required'),
  body('location.address').trim().isLength({ min: 5 }).withMessage('Location address is required'),
  body('location.city').trim().isLength({ min: 2 }).withMessage('City is required'),
  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Valid coordinates are required'),
  body('schedule.startDate').isISO8601().withMessage('Valid start date is required'),
  body('schedule.endDate').isISO8601().withMessage('Valid end date is required'),
  body('schedule.timezone').notEmpty().withMessage('Timezone is required'),
  body('capacity').optional().isInt({ min: 1, max: 100000 }).withMessage('Capacity must be between 1 and 100,000'),
  body('isPaid').isBoolean().withMessage('isPaid must be a boolean'),
  body('ticketPrice').if(body('isPaid').equals('true')).isInt({ min: 100 }).withMessage('Ticket price must be at least ₹1 (100 paise)'),
  handleValidationErrors
];

// Payment validation rules
export const validateTicketPurchase = [
  body('eventId').isUUID().withMessage('Valid event ID is required'),
  body('quantity').isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10'),
  handleValidationErrors
];

export const validateSubscription = [
  body('planType').isIn(['free', 'premium', 'pro']).withMessage('Valid plan type is required'),
  body('autoRenew').optional().isBoolean().withMessage('autoRenew must be a boolean'),
  handleValidationErrors
];

// Review validation rules
export const validateReview = [
  body('eventId').isUUID().withMessage('Valid event ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment must be less than 1000 characters'),
  handleValidationErrors
];
// Parameter validation rules
import { param } from 'express-validator';

export const validateEventId = [
  param('eventId').isUUID().withMessage('Valid event ID is required'),
  handleValidationErrors
];

export const validateReviewId = [
  param('id').isUUID().withMessage('Valid review ID is required'),
  handleValidationErrors
];

export const validateRegistrationId = [
  param('id').isUUID().withMessage('Valid registration ID is required'),
  handleValidationErrors
];

export const validatePlanType = [
  param('planType').isIn(['free', 'premium', 'pro']).withMessage('Valid plan type is required'),
  handleValidationErrors
];

// Registration validation rules
export const validateRegistration = [
  body('eventId').isUUID().withMessage('Valid event ID is required'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters'),
  handleValidationErrors
];

// Additional review validation rules
export const validateUpdateReview = [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment must be less than 1000 characters'),
  handleValidationErrors
];

export const validateFlagReview = [
  body('reason').trim().isLength({ min: 5, max: 200 }).withMessage('Reason must be between 5 and 200 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  handleValidationErrors
];

export const validateModerateReview = [
  body('action').isIn(['approve', 'reject', 'edit']).withMessage('Valid moderation action is required'),
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason must be less than 500 characters'),
  handleValidationErrors
];

// Payment validation rules
export const validateTicketValidation = [
  body('qrCode').notEmpty().withMessage('QR code is required'),
  handleValidationErrors
];

export const validatePaymentIntent = [
  body('amount').isInt({ min: 100 }).withMessage('Amount must be at least ₹1 (100 paise)'),
  body('currency').equals('INR').withMessage('Currency must be INR'),
  body('eventId').optional().isUUID().withMessage('Valid event ID is required'),
  handleValidationErrors
];

export const validateRefund = [
  body('transactionId').isUUID().withMessage('Valid transaction ID is required'),
  body('amount').isInt({ min: 100 }).withMessage('Refund amount must be at least ₹1 (100 paise)'),
  body('reason').trim().isLength({ min: 5, max: 200 }).withMessage('Reason must be between 5 and 200 characters'),
  handleValidationErrors
];