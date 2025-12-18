import { Pool } from 'pg';
import { Review, ReviewStats } from '../../shared/models/Review';
import { db } from '../config/database';

export class ReviewRepository {
  constructor(private database: Pool = db) {}

  async create(review: Review): Promise<Review> {
    const client = await this.database.connect();
    try {
      const query = `
        INSERT INTO reviews (
          id, event_id, user_id, rating, comment, is_verified_attendee,
          status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      
      const values = [
        review.id, review.eventId, review.userId, review.rating,
        review.comment, review.isVerifiedAttendee, review.status,
        review.createdAt, review.updatedAt
      ];

      const result = await client.query(query, values);
      return this.mapRowToReview(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<Review | null> {
    const client = await this.database.connect();
    try {
      const query = 'SELECT * FROM reviews WHERE id = $1';
      const result = await client.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToReview(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async findByEvent(eventId: string, limit: number = 20, offset: number = 0): Promise<Review[]> {
    const client = await this.database.connect();
    try {
      const query = `
        SELECT r.*, u.name as user_name, u.profile->>'avatar' as user_avatar
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.event_id = $1 AND r.status = 'published'
        ORDER BY r.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      
      const result = await client.query(query, [eventId, limit, offset]);
      return result.rows.map(row => this.mapRowToReview(row));
    } finally {
      client.release();
    }
  }

  async findByUser(userId: string): Promise<Review[]> {
    const client = await this.database.connect();
    try {
      const query = `
        SELECT r.*, e.title as event_title
        FROM reviews r
        JOIN events e ON r.event_id = e.id
        WHERE r.user_id = $1
        ORDER BY r.created_at DESC
      `;
      
      const result = await client.query(query, [userId]);
      return result.rows.map(row => this.mapRowToReview(row));
    } finally {
      client.release();
    }
  }

  async findByEventAndUser(eventId: string, userId: string): Promise<Review | null> {
    const client = await this.database.connect();
    try {
      const query = 'SELECT * FROM reviews WHERE event_id = $1 AND user_id = $2';
      const result = await client.query(query, [eventId, userId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToReview(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async update(id: string, review: Partial<Review>): Promise<Review | null> {
    const client = await this.database.connect();
    try {
      const updateFields: string[] = [];
      const values: any[] = [id];
      let paramIndex = 2;

      if (review.rating !== undefined) {
        updateFields.push(`rating = $${paramIndex++}`);
        values.push(review.rating);
      }
      if (review.comment !== undefined) {
        updateFields.push(`comment = $${paramIndex++}`);
        values.push(review.comment);
      }
      if (review.status !== undefined) {
        updateFields.push(`status = $${paramIndex++}`);
        values.push(review.status);
      }
      if (review.flaggedReason !== undefined) {
        updateFields.push(`flagged_reason = $${paramIndex++}`);
        values.push(review.flaggedReason);
      }

      updateFields.push(`updated_at = $${paramIndex++}`);
      values.push(new Date());

      const query = `UPDATE reviews SET ${updateFields.join(', ')} WHERE id = $1 RETURNING *`;
      const result = await client.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToReview(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async delete(id: string): Promise<boolean> {
    const client = await this.database.connect();
    try {
      const query = 'DELETE FROM reviews WHERE id = $1';
      const result = await client.query(query, [id]);
      return (result.rowCount ?? 0) > 0;
    } finally {
      client.release();
    }
  }

  async getEventStats(eventId: string): Promise<ReviewStats> {
    const client = await this.database.connect();
    try {
      const query = `
        SELECT 
          AVG(rating)::numeric(3,2) as average_rating,
          COUNT(*) as total_reviews,
          COUNT(*) FILTER (WHERE rating = 1) as rating_1,
          COUNT(*) FILTER (WHERE rating = 2) as rating_2,
          COUNT(*) FILTER (WHERE rating = 3) as rating_3,
          COUNT(*) FILTER (WHERE rating = 4) as rating_4,
          COUNT(*) FILTER (WHERE rating = 5) as rating_5
        FROM reviews 
        WHERE event_id = $1 AND status = 'published'
      `;
      
      const result = await client.query(query, [eventId]);
      const row = result.rows[0];
      
      return {
        averageRating: parseFloat(row.average_rating) || 0,
        totalReviews: parseInt(row.total_reviews) || 0,
        ratingDistribution: {
          1: parseInt(row.rating_1) || 0,
          2: parseInt(row.rating_2) || 0,
          3: parseInt(row.rating_3) || 0,
          4: parseInt(row.rating_4) || 0,
          5: parseInt(row.rating_5) || 0
        }
      };
    } finally {
      client.release();
    }
  }

  async getFlaggedReviews(): Promise<Review[]> {
    const client = await this.database.connect();
    try {
      const query = `
        SELECT r.*, u.name as user_name, e.title as event_title
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN events e ON r.event_id = e.id
        WHERE r.status = 'flagged'
        ORDER BY r.created_at DESC
      `;
      
      const result = await client.query(query);
      return result.rows.map(row => this.mapRowToReview(row));
    } finally {
      client.release();
    }
  }

  private mapRowToReview(row: any): Review {
    return {
      id: row.id,
      eventId: row.event_id,
      userId: row.user_id,
      rating: row.rating,
      comment: row.comment,
      isVerifiedAttendee: row.is_verified_attendee,
      status: row.status,
      flaggedReason: row.flagged_reason,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      // Populated fields if available
      user: row.user_name ? {
        name: row.user_name,
        avatar: row.user_avatar
      } : undefined,
      event: row.event_title ? {
        title: row.event_title
      } : undefined
    };
  }
}