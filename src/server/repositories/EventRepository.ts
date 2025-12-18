import { Pool } from 'pg';
import { EventModel } from '../models/EventModel';
import { SearchFilters, PaginationOptions, PaginatedResponse } from '../../shared/types';
import { db } from '../config/database';

export class EventRepository {
  constructor(private database: Pool = db) {}

  async create(event: EventModel): Promise<EventModel> {
    const client = await this.database.connect();
    try {
      const eventData = event.toDatabase();
      const query = `
        INSERT INTO events (
          id, title, description, category, organizer_id, location, schedule,
          capacity, registration_deadline, requirements, images, status,
          is_paid, ticket_price, tags, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *
      `;
      
      const values = [
        eventData.id, eventData.title, eventData.description, eventData.category,
        eventData.organizer_id, eventData.location, eventData.schedule,
        eventData.capacity, eventData.registration_deadline, eventData.requirements,
        eventData.images, eventData.status, eventData.is_paid, eventData.ticket_price,
        eventData.tags, eventData.created_at, eventData.updated_at
      ];

      const result = await client.query(query, values);
      return EventModel.fromDatabase(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<EventModel | null> {
    const client = await this.database.connect();
    try {
      const query = 'SELECT * FROM events WHERE id = $1';
      const result = await client.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return EventModel.fromDatabase(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async update(id: string, event: Partial<EventModel>): Promise<EventModel | null> {
    const client = await this.database.connect();
    try {
      const eventData = new EventModel(event).toDatabase();
      eventData.updated_at = new Date();
      
      const setClause = Object.keys(eventData)
        .filter(key => key !== 'id' && eventData[key] !== undefined)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');
      
      const values = [id, ...Object.keys(eventData)
        .filter(key => key !== 'id' && eventData[key] !== undefined)
        .map(key => eventData[key])];
      
      const query = `UPDATE events SET ${setClause} WHERE id = $1 RETURNING *`;
      const result = await client.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return EventModel.fromDatabase(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async delete(id: string): Promise<boolean> {
    const client = await this.database.connect();
    try {
      const query = 'DELETE FROM events WHERE id = $1';
      const result = await client.query(query, [id]);
      return (result.rowCount ?? 0) > 0;
    } finally {
      client.release();
    }
  }

  async search(filters: SearchFilters, pagination: PaginationOptions): Promise<PaginatedResponse<EventModel>> {
    const client = await this.database.connect();
    try {
      let whereClause = "WHERE status = 'published'";
      const queryParams: any[] = [];
      let paramIndex = 1;

      // Add filters
      if (filters.query) {
        whereClause += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
        queryParams.push(`%${filters.query}%`);
        paramIndex++;
      }

      if (filters.categories && filters.categories.length > 0) {
        whereClause += ` AND category = ANY($${paramIndex})`;
        queryParams.push(filters.categories);
        paramIndex++;
      }

      if (filters.location) {
        // Geospatial search using PostGIS or simple distance calculation
        whereClause += ` AND ST_DWithin(
          ST_Point((location->>'coordinates'->>0)::float, (location->>'coordinates'->>1)::float)::geography,
          ST_Point($${paramIndex}, $${paramIndex + 1})::geography,
          $${paramIndex + 2}
        )`;
        queryParams.push(filters.location.coordinates[0], filters.location.coordinates[1], filters.location.radius * 1000);
        paramIndex += 3;
      }

      if (filters.dateRange) {
        whereClause += ` AND (schedule->>'startDate')::timestamp >= $${paramIndex} AND (schedule->>'startDate')::timestamp <= $${paramIndex + 1}`;
        queryParams.push(filters.dateRange.start, filters.dateRange.end);
        paramIndex += 2;
      }

      // Count total results
      const countQuery = `SELECT COUNT(*) FROM events ${whereClause}`;
      const countResult = await client.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].count);

      // Get paginated results
      const offset = (pagination.page - 1) * pagination.limit;
      const orderBy = this.buildOrderBy(filters.sortBy, filters.sortOrder);
      
      const query = `
        SELECT * FROM events 
        ${whereClause} 
        ${orderBy}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      queryParams.push(pagination.limit, offset);
      const result = await client.query(query, queryParams);
      
      const events = result.rows.map(row => EventModel.fromDatabase(row));
      
      return {
        success: true,
        data: events,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages: Math.ceil(total / pagination.limit)
        }
      };
    } finally {
      client.release();
    }
  }

  async findAll(pagination: PaginationOptions): Promise<PaginatedResponse<EventModel>> {
    const client = await this.database.connect();
    try {
      const countQuery = "SELECT COUNT(*) FROM events WHERE status = 'published'";
      const countResult = await client.query(countQuery);
      const total = parseInt(countResult.rows[0].count);

      const offset = (pagination.page - 1) * pagination.limit;
      const query = `
        SELECT * FROM events 
        WHERE status = 'published'
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `;
      
      const result = await client.query(query, [pagination.limit, offset]);
      const events = result.rows.map(row => EventModel.fromDatabase(row));
      
      return {
        success: true,
        data: events,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages: Math.ceil(total / pagination.limit)
        }
      };
    } finally {
      client.release();
    }
  }

  async findByOrganizer(organizerId: string, pagination: PaginationOptions): Promise<PaginatedResponse<EventModel>> {
    const client = await this.database.connect();
    try {
      const countQuery = 'SELECT COUNT(*) FROM events WHERE organizer_id = $1';
      const countResult = await client.query(countQuery, [organizerId]);
      const total = parseInt(countResult.rows[0].count);

      const offset = (pagination.page - 1) * pagination.limit;
      const query = `
        SELECT * FROM events 
        WHERE organizer_id = $1 
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `;
      
      const result = await client.query(query, [organizerId, pagination.limit, offset]);
      const events = result.rows.map(row => EventModel.fromDatabase(row));
      
      return {
        success: true,
        data: events,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages: Math.ceil(total / pagination.limit)
        }
      };
    } finally {
      client.release();
    }
  }

  async getCapacityInfo(eventId: string): Promise<{ available: number; total: number; waitlist: number }> {
    const client = await this.database.connect();
    try {
      const eventQuery = 'SELECT capacity FROM events WHERE id = $1';
      const eventResult = await client.query(eventQuery, [eventId]);
      
      if (eventResult.rows.length === 0) {
        throw new Error('Event not found');
      }
      
      const capacity = eventResult.rows[0].capacity;
      
      const registrationQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
          COUNT(*) FILTER (WHERE status = 'waitlisted') as waitlisted
        FROM registrations 
        WHERE event_id = $1
      `;
      
      const registrationResult = await client.query(registrationQuery, [eventId]);
      const { confirmed, waitlisted } = registrationResult.rows[0];
      
      return {
        total: capacity || -1,
        available: capacity ? Math.max(0, capacity - parseInt(confirmed)) : -1,
        waitlist: parseInt(waitlisted)
      };
    } finally {
      client.release();
    }
  }

  private buildOrderBy(sortBy?: string, sortOrder?: string): string {
    const order = sortOrder === 'desc' ? 'DESC' : 'ASC';
    
    switch (sortBy) {
      case 'date':
        return `ORDER BY (schedule->>'startDate')::timestamp ${order}`;
      case 'popularity':
        return `ORDER BY (SELECT COUNT(*) FROM registrations WHERE event_id = events.id) ${order}`;
      case 'price':
        return `ORDER BY ticket_price ${order}`;
      default:
        return `ORDER BY created_at ${order}`;
    }
  }
}