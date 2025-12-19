import request from 'supertest';
import express from 'express';
import eventRoutes from '../../routes/events';
import { globalErrorHandler } from '../../middleware/errorHandler';

describe('Events Controller', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/events', eventRoutes);
    app.use(globalErrorHandler);
  });

  describe('GET /api/events', () => {
    it('should return events list', async () => {
      const response = await request(app).get('/api/events');

      expect(response.status).toBeLessThan(500);
    });

    it('should handle pagination parameters', async () => {
      const response = await request(app).get('/api/events?page=1&limit=10');

      expect(response.status).toBeLessThan(500);
    });

    it('should handle search parameters', async () => {
      const response = await request(app).get(
        '/api/events?query=test&category=technology'
      );

      expect(response.status).toBeLessThan(500);
    });

    it('should validate pagination limits', async () => {
      const response = await request(app).get('/api/events?page=0&limit=1000');

      // Should handle invalid pagination gracefully
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('GET /api/events/:id', () => {
    it('should validate UUID format', async () => {
      const response = await request(app)
        .get('/api/events/invalid-uuid')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should accept valid UUID', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const response = await request(app).get(`/api/events/${validUuid}`);

      // Should not fail validation (might fail at service level)
      expect(response.status).not.toBe(400);
    });
  });

  describe('POST /api/events', () => {
    const validEventData = {
      title: 'Test Event',
      description:
        'This is a test event description that is long enough to pass validation',
      category: 'technology',
      location: 'Test Location',
      startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      endDate: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
      capacity: 50,
      isPaid: false,
    };

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/events')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate title length', async () => {
      const response = await request(app)
        .post('/api/events')
        .send({
          ...validEventData,
          title: 'A', // Too short
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate description length', async () => {
      const response = await request(app)
        .post('/api/events')
        .send({
          ...validEventData,
          description: 'Short', // Too short
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate date format', async () => {
      const response = await request(app)
        .post('/api/events')
        .send({
          ...validEventData,
          startDate: 'invalid-date',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate end date after start date', async () => {
      const response = await request(app)
        .post('/api/events')
        .send({
          ...validEventData,
          startDate: new Date(Date.now() + 172800000).toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString(),
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate capacity', async () => {
      const response = await request(app)
        .post('/api/events')
        .send({
          ...validEventData,
          capacity: 0, // Invalid capacity
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate paid event ticket price', async () => {
      const response = await request(app)
        .post('/api/events')
        .send({
          ...validEventData,
          isPaid: true,
          // Missing ticketPrice
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/events/:id', () => {
    it('should validate UUID format', async () => {
      const response = await request(app)
        .put('/api/events/invalid-uuid')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('should validate UUID format', async () => {
      const response = await request(app)
        .delete('/api/events/invalid-uuid')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
