import { Router, Request, Response } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { PaymentService } from '../services/PaymentService';
import { EventRepository } from '../repositories/EventRepository';
import { authenticateToken, requireOrganizer, requireAdmin } from '../middleware/auth';
import { validateSubscription, validateTicketPurchase } from '../middleware/validation';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();

// Initialize services
const eventRepository = new EventRepository();
const paymentService = new PaymentService(eventRepository);
const paymentController = new PaymentController(paymentService);

// Validation middleware
const validatePaymentIntent = [
  body('amount').isInt({ min: 100 }).withMessage('Amount must be at least ₹1 (100 paise)'),
  body('currency').equals('INR').withMessage('Currency must be INR'),
  handleValidationErrors
];

const validateRefund = [
  body('transactionId').isUUID().withMessage('Valid transaction ID is required'),
  body('reason').notEmpty().withMessage('Refund reason is required'),
  body('amount').optional().isInt({ min: 100 }).withMessage('Refund amount must be at least ₹1'),
  handleValidationErrors
];

const validateTicketValidation = [
  body('qrCode').notEmpty().withMessage('QR code is required'),
  handleValidationErrors
];

const validatePlanType = [
  param('planType').isIn(['free', 'premium', 'pro']).withMessage('Valid plan type is required'),
  handleValidationErrors
];

// Webhook route (no auth required)
router.post('/webhook', (req: Request, res: Response) => paymentController.handleWebhook(req, res));

// Public routes
router.get('/plans/:planType/features', validatePlanType, (req: Request, res: Response) => 
  paymentController.getPlanFeatures(req, res)
);

// Protected routes - Subscriptions
router.post('/subscriptions', authenticateToken, requireOrganizer, validateSubscription, (req: Request, res: Response) => 
  paymentController.createSubscription(req, res)
);

router.get('/subscription', authenticateToken, requireOrganizer, (req: Request, res: Response) => 
  paymentController.getSubscription(req, res)
);

router.put('/subscription', authenticateToken, requireOrganizer, (req: Request, res: Response) => 
  paymentController.updateSubscription(req, res)
);

router.delete('/subscription', authenticateToken, requireOrganizer, (req: Request, res: Response) => 
  paymentController.cancelSubscription(req, res)
);

// Protected routes - Tickets
router.post('/tickets', authenticateToken, validateTicketPurchase, (req: Request, res: Response) => 
  paymentController.purchaseTickets(req, res)
);

router.get('/tickets', authenticateToken, (req: Request, res: Response) => 
  paymentController.getTickets(req, res)
);

router.get('/tickets/:id', authenticateToken, (req: Request, res: Response) => 
  paymentController.getTicket(req, res)
);

router.post('/tickets/:id/validate', authenticateToken, validateTicketValidation, (req: Request, res: Response) => 
  paymentController.validateTicket(req, res)
);

// Protected routes - Transactions
router.get('/transactions', authenticateToken, (req: Request, res: Response) => 
  paymentController.getTransactions(req, res)
);

router.get('/transactions/:id', authenticateToken, (req: Request, res: Response) => 
  paymentController.getTransaction(req, res)
);

// Protected routes - Payment Processing
router.post('/payment-intent', authenticateToken, validatePaymentIntent, (req: Request, res: Response) => 
  paymentController.createPaymentIntent(req, res)
);

router.post('/confirm-payment', authenticateToken, (req: Request, res: Response) => 
  paymentController.confirmPayment(req, res)
);

// Organizer routes - Revenue
router.get('/revenue/organizer', authenticateToken, requireOrganizer, (req: Request, res: Response) => 
  paymentController.getOrganizerRevenue(req, res)
);

// Admin routes - Platform Revenue & Refunds
router.get('/revenue/platform', authenticateToken, requireAdmin, (req: Request, res: Response) => 
  paymentController.getPlatformRevenue(req, res)
);

router.post('/refunds', authenticateToken, requireAdmin, validateRefund, (req: Request, res: Response) => 
  paymentController.processRefund(req, res)
);

export default router;