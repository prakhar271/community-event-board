import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, requireRole } from '../../middleware/auth';
import { globalErrorHandler } from '../../middleware/errorHandler';
import { env } from '../../config/env';

describe('Auth Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('authenticateToken', () => {
    it('should reject requests without token', async () => {
      app.get('/protected', authenticateToken, (req, res) => {
        res.json({ success: true });
      });
      app.use(globalErrorHandler);

      const response = await request(app).get('/protected').expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('token');
    });

    it('should reject requests with invalid token', async () => {
      app.get('/protected', authenticateToken, (req, res) => {
        res.json({ success: true });
      });
      app.use(globalErrorHandler);

      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject requests with malformed authorization header', async () => {
      app.get('/protected', authenticateToken, (req, res) => {
        res.json({ success: true });
      });
      app.use(globalErrorHandler);

      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should accept requests with valid token', async () => {
      const validToken = jwt.sign(
        { userId: 'test-user-id', role: 'resident' },
        env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      app.get('/protected', authenticateToken, (req, res) => {
        res.json({
          success: true,
          user: req.user,
        });
      });
      app.use(globalErrorHandler);

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.userId).toBe('test-user-id');
    });

    it('should reject expired tokens', async () => {
      const expiredToken = jwt.sign(
        { userId: 'test-user-id', role: 'resident' },
        env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' } // Expired 1 hour ago
      );

      app.get('/protected', authenticateToken, (req, res) => {
        res.json({ success: true });
      });
      app.use(globalErrorHandler);

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('requireRole', () => {
    const createTokenForRole = (role: string) => {
      return jwt.sign(
        { userId: 'test-user-id', role },
        env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );
    };

    it('should allow access for correct role', async () => {
      const adminToken = createTokenForRole('admin');

      app.get(
        '/admin-only',
        authenticateToken,
        requireRole(['admin']),
        (req, res) => {
          res.json({ success: true });
        }
      );
      app.use(globalErrorHandler);

      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should deny access for incorrect role', async () => {
      const residentToken = createTokenForRole('resident');

      app.get(
        '/admin-only',
        authenticateToken,
        requireRole(['admin']),
        (req, res) => {
          res.json({ success: true });
        }
      );
      app.use(globalErrorHandler);

      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${residentToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('permission');
    });

    it('should allow access for multiple allowed roles', async () => {
      const organizerToken = createTokenForRole('organizer');

      app.get(
        '/organizer-admin',
        authenticateToken,
        requireRole(['admin', 'organizer']),
        (req, res) => {
          res.json({ success: true });
        }
      );
      app.use(globalErrorHandler);

      const response = await request(app)
        .get('/organizer-admin')
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should handle missing user role', async () => {
      const tokenWithoutRole = jwt.sign(
        { userId: 'test-user-id' }, // No role
        env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      app.get(
        '/admin-only',
        authenticateToken,
        requireRole(['admin']),
        (req, res) => {
          res.json({ success: true });
        }
      );
      app.use(globalErrorHandler);

      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${tokenWithoutRole}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
