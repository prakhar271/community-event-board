import { Router, Request, Response } from 'express';
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/UserService';
import { UserRepository } from '../repositories/UserRepository';
import { EmailService } from '../services/EmailService';
import { authenticateToken } from '../middleware/auth';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';
import multer from 'multer';
import path from 'path';

const router = Router();

// Initialize services
const userRepository = new UserRepository();
const emailService = new EmailService();
const userService = new UserService(userRepository, emailService);
const userController = new UserController(userService);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  }
});

// Validation middleware
const validateProfileUpdate = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('location.city').optional().trim().isLength({ min: 2 }).withMessage('City must be at least 2 characters'),
  body('location.state').optional().trim().isLength({ min: 2 }).withMessage('State must be at least 2 characters'),
  body('interests').optional().isArray().withMessage('Interests must be an array'),
  body('notificationPreferences.email').optional().isBoolean().withMessage('Email preference must be boolean'),
  body('notificationPreferences.push').optional().isBoolean().withMessage('Push preference must be boolean'),
  body('notificationPreferences.sms').optional().isBoolean().withMessage('SMS preference must be boolean'),
  handleValidationErrors
];

// Protected routes
router.get('/profile', authenticateToken, (req: Request, res: Response) => 
  userController.getProfile(req, res)
);

router.put('/profile', authenticateToken, validateProfileUpdate, (req: Request, res: Response) => 
  userController.updateProfile(req, res)
);

router.post('/avatar', authenticateToken, upload.single('avatar'), (req: Request, res: Response) => 
  userController.uploadAvatar(req, res)
);

router.delete('/avatar', authenticateToken, (req: Request, res: Response) => 
  userController.deleteAvatar(req, res)
);

// Organizer upgrade routes
router.post('/upgrade-to-organizer', authenticateToken, (req: Request, res: Response) => 
  userController.upgradeToOrganizer(req, res)
);

export default router;