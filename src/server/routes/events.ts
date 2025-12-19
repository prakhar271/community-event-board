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
import { cacheMiddleware } from '../services/CacheService';

const router = Router();

// Initialize services
const eventRepository = new EventRepository();
const userRepository = new UserRepository();
const emailService = new EmailService();
const userService = new UserService(userRepository, emailService);
const notificationService = new NotificationService(
  emailService,
  userRepository,
  eventRepository
);
const eventService = new EventService(
  eventRepository,
  userService,
  notificationService
);
const eventController = new EventController(eventService);

// Public routes - specific routes must come before parameterized routes

/**
 * @swagger
 * /api/events/search:
 *   get:
 *     summary: Search and filter events
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query for event title/description
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by event category
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter events starting after this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter events ending before this date
 *       - in: query
 *         name: isPaid
 *         schema:
 *           type: boolean
 *         description: Filter by paid/free events
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of events per page
 *     responses:
 *       200:
 *         description: List of events matching search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/search', cacheMiddleware(300), (req: Request, res: Response) =>
  eventController.searchEvents(req, res)
);

// Use search functionality for the root route as a workaround
router.get('/', cacheMiddleware(300), (req: Request, res: Response) => {
  // Redirect to search with empty query to get all events
  req.query = { ...req.query }; // Preserve existing query params
  eventController.searchEvents(req, res);
});

// Parameterized routes must come after specific routes

/**
 * @swagger
 * /api/events/{id}/capacity:
 *   get:
 *     summary: Get event capacity information
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event capacity information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 capacity:
 *                   type: integer
 *                 registered:
 *                   type: integer
 *                 available:
 *                   type: integer
 *       404:
 *         description: Event not found
 */
router.get(
  '/:id/capacity',
  cacheMiddleware(60),
  (req: Request, res: Response) => eventController.getEventCapacity(req, res)
);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get event details by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 */
router.get('/:id', cacheMiddleware(600), (req: Request, res: Response) =>
  eventController.getEvent(req, res)
);

// Protected routes
router.post(
  '/',
  authenticateToken,
  requireOrganizer,
  validateEventCreation,
  (req: Request, res: Response) => eventController.createEvent(req, res)
);
router.put('/:id', authenticateToken, requireOrganizer, (req, res) =>
  eventController.updateEvent(req, res)
);
router.delete('/:id', authenticateToken, requireOrganizer, (req, res) =>
  eventController.deleteEvent(req, res)
);
router.post('/:id/publish', authenticateToken, requireOrganizer, (req, res) =>
  eventController.publishEvent(req, res)
);
router.post('/:id/cancel', authenticateToken, requireOrganizer, (req, res) =>
  eventController.cancelEvent(req, res)
);

// Organizer-only routes
router.get('/my/events', authenticateToken, requireOrganizer, (req, res) =>
  eventController.getMyEvents(req, res)
);
router.get('/:id/attendees', authenticateToken, requireOrganizer, (req, res) =>
  eventController.getEventAttendees(req, res)
);
router.get('/:id/analytics', authenticateToken, requireOrganizer, (req, res) =>
  eventController.getEventAnalytics(req, res)
);

export default router;
