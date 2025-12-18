import { Router, Request, Response } from 'express';
import { AuthController } from '../controllers/AuthController';
import { UserService } from '../services/UserService';
import { UserRepository } from '../repositories/UserRepository';
import { EmailService } from '../services/EmailService';
import { validateUserRegistration, validateUserLogin } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Initialize services
const userRepository = new UserRepository();
const emailService = new EmailService();
const userService = new UserService(userRepository, emailService);
const authController = new AuthController(userService);

// Public routes
router.post('/register', validateUserRegistration, (req: Request, res: Response) => authController.register(req, res));
router.post('/login', validateUserLogin, (req: Request, res: Response) => authController.login(req, res));
router.post('/refresh-token', (req: Request, res: Response) => authController.refreshToken(req, res));
router.get('/verify-email', (req: Request, res: Response) => authController.verifyEmail(req, res));
router.post('/request-password-reset', (req: Request, res: Response) => authController.requestPasswordReset(req, res));
router.post('/reset-password', (req: Request, res: Response) => authController.resetPassword(req, res));

// Protected routes
router.post('/logout', authenticateToken, (req: Request, res: Response) => authController.logout(req, res));
router.post('/change-password', authenticateToken, (req: Request, res: Response) => authController.changePassword(req, res));

export default router;