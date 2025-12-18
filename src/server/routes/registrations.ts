import { Router, Request, Response } from 'express';
import { RegistrationController } from '../controllers/RegistrationController';
import { RegistrationService } from '../services/RegistrationService';
import { RegistrationRepository } from '../repositories/RegistrationRepository';
import { EventRepository } from '../repositories/EventRepository';
import { UserRepository } from '../repositories/UserRepository';
import { NotificationService } from '../services/NotificationService';
import { EmailService } from '../services/EmailService';
import { authenticateToken, requireOrganizer } from '../middleware/auth';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();

// Initialize services
const registrationRepository = new RegistrationRepository();
const eventRepository = new EventRepository();
const userRepository = new UserRepository();
const emailService = new EmailService();
const notificationService = new NotificationService(emailService, userRepository, eventRepository);
const registrationService = new RegistrationService(
  registrationRepository,
  eventRepository,
  userRepository,
  notificationService
);
const registrationController = new RegistrationController(registrationService);

// Validation middleware
const validateRegistration = [
  body('eventId').isUUID().withMessage('Valid event ID is required'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters'),
  handleValidationErrors
];

const validateRegistrationId = [
  param('id').isUUID().withMessage('Valid registration ID is required'),
  handleValidationErrors
];

const validateEventId = [
  param('eventId').isUUID().withMessage('Valid event ID is required'),
  handleValidationErrors
];

// Public routes (none for registrations)

// Protected routes
router.post('/', authenticateToken, validateRegistration, (req: Request, res: Response) => 
  registrationController.registerForEvent(req, res)
);

router.get('/my', authenticateToken, (req: Request, res: Response) => 
  registrationController.getUserRegistrations(req, res)
);

router.get('/:id', authenticateToken, validateRegistrationId, (req: Request, res: Response) => 
  registrationController.getRegistration(req, res)
);

router.put('/:id', authenticateToken, validateRegistrationId, (req: Request, res: Response) => 
  registrationController.updateRegistration(req, res)
);

router.delete('/:id', authenticateToken, validateRegistrationId, (req: Request, res: Response) => 
  registrationController.cancelRegistration(req, res)
);

// Organizer routes
router.get('/event/:eventId', authenticateToken, requireOrganizer, validateEventId, (req: Request, res: Response) => 
  registrationController.getEventRegistrations(req, res)
);

router.post('/:id/checkin', authenticateToken, requireOrganizer, validateRegistrationId, (req: Request, res: Response) => 
  registrationController.checkInUser(req, res)
);

export default router;