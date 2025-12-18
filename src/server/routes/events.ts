import { Router, Request, Response } from 'express';
import { EventController } from '../controllers/EventController';
import { EventService } from '../services/EventService';
import { EventRepository } from '../repositories/EventRepository';
import { UserService } from '../services/UserService';
import { UserRepository } from '../repositories/UserRepository';
import { EmailService } from '../services/EmailService';
import { NotificationService } from '../services/NotificationService';
import { authenticateToken, requireOrganizer } from '../middleware/auth';
import { validateEventCreation } from '../middleware/validation';

const router = Router();

// Initialize services
const eventRepository = new EventRepository();
const userRepository = new UserRepository();
const emailService = new EmailService();
const userService = new UserService(userRepository, emailService);
const notificationService = new NotificationService(emailService, userRepository, eventRepository);
const eventService = new EventService(eventRepository, userService, notificationService);
const eventController = new EventController(eventService);

// Public routes - specific routes must come before parameterized routes
router.get('/search', (req: Request, res: Response) => eventController.searchEvents(req, res));

// Use search functionality for the root route as a workaround
router.get('/', (req: Request, res: Response) => {
  // Redirect to search with empty query to get all events
  req.query = { ...req.query }; // Preserve existing query params
  eventController.searchEvents(req, res);
});

// Parameterized routes must come after specific routes
router.get('/:id/capacity', (req: Request, res: Response) => eventController.getEventCapacity(req, res));
router.get('/:id', (req: Request, res: Response) => eventController.getEvent(req, res));

// Protected routes
router.post('/', authenticateToken, requireOrganizer, validateEventCreation, (req: Request, res: Response) => eventController.createEvent(req, res));
router.put('/:id', authenticateToken, requireOrganizer, (req, res) => eventController.updateEvent(req, res));
router.delete('/:id', authenticateToken, requireOrganizer, (req, res) => eventController.deleteEvent(req, res));
router.post('/:id/publish', authenticateToken, requireOrganizer, (req, res) => eventController.publishEvent(req, res));
router.post('/:id/cancel', authenticateToken, requireOrganizer, (req, res) => eventController.cancelEvent(req, res));

// Organizer-only routes
router.get('/my/events', authenticateToken, requireOrganizer, (req, res) => eventController.getMyEvents(req, res));
router.get('/:id/attendees', authenticateToken, requireOrganizer, (req, res) => eventController.getEventAttendees(req, res));
router.get('/:id/analytics', authenticateToken, requireOrganizer, (req, res) => eventController.getEventAnalytics(req, res));

export default router;