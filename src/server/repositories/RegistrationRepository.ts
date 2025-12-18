import { Pool } from 'pg';
import { RegistrationModel } from '../models/RegistrationModel';
import { db } from '../config/database';

export class RegistrationRepository {
  constructor(private database: Pool = db) {}

  async create(registration: RegistrationModel): Promise<RegistrationModel> {
    const client = await this.database.connect();
    try {
      const registrationData = registration.toDatabase();
      const query = `
        INSERT INTO registrations (
          id, event_id, user_id, status, registered_at, checked_in,
          waitlist_position, ticket_id, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      
      const values = [
        registrationData.id, registrationData.event_id, registrationData.user_id,
        registrationData.status, registrationData.registered_at, registrationData.checked_in,
        registrationData.waitlist_position, registrationData.ticket_id, registrationData.notes
      ];

      const result = await client.query(query, values);
      return RegistrationModel.fromDatabase(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<RegistrationModel | null> {
    const client = await this.database.connect();
    try {
      const query = 'SELECT * FROM registrations WHERE id = $1';
      const result = await client.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return RegistrationModel.fromDatabase(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async findByEventAndUser(eventId: string, userId: string): Promise<RegistrationModel | null> {
    const client = await this.database.connect();
    try {
      const query = 'SELECT * FROM registrations WHERE event_id = $1 AND user_id = $2';
      const result = await client.query(query, [eventId, userId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return RegistrationModel.fromDatabase(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async findByEvent(eventId: string): Promise<RegistrationModel[]> {
    const client = await this.database.connect();
    try {
      const query = 'SELECT * FROM registrations WHERE event_id = $1 ORDER BY registered_at ASC';
      const result = await client.query(query, [eventId]);
      
      return result.rows.map(row => RegistrationModel.fromDatabase(row));
    } finally {
      client.release();
    }
  }

  async findByUser(userId: string): Promise<RegistrationModel[]> {
    const client = await this.database.connect();
    try {
      const query = 'SELECT * FROM registrations WHERE user_id = $1 ORDER BY registered_at DESC';
      const result = await client.query(query, [userId]);
      
      return result.rows.map(row => RegistrationModel.fromDatabase(row));
    } finally {
      client.release();
    }
  }

  async update(id: string, registration: Partial<RegistrationModel>): Promise<RegistrationModel | null> {
    const client = await this.database.connect();
    try {
      const registrationData = new RegistrationModel(registration).toDatabase();
      
      const setClause = Object.keys(registrationData)
        .filter(key => key !== 'id' && registrationData[key] !== undefined)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');
      
      const values = [id, ...Object.keys(registrationData)
        .filter(key => key !== 'id' && registrationData[key] !== undefined)
        .map(key => registrationData[key])];
      
      const query = `UPDATE registrations SET ${setClause} WHERE id = $1 RETURNING *`;
      const result = await client.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return RegistrationModel.fromDatabase(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async delete(id: string): Promise<boolean> {
    const client = await this.database.connect();
    try {
      const query = 'DELETE FROM registrations WHERE id = $1';
      const result = await client.query(query, [id]);
      return (result.rowCount ?? 0) > 0;
    } finally {
      client.release();
    }
  }

  async getEventCapacity(eventId: string): Promise<{ confirmed: number; waitlisted: number }> {
    const client = await this.database.connect();
    try {
      const query = `
        SELECT 
          COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
          COUNT(*) FILTER (WHERE status = 'waitlisted') as waitlisted
        FROM registrations 
        WHERE event_id = $1
      `;
      
      const result = await client.query(query, [eventId]);
      const { confirmed, waitlisted } = result.rows[0];
      
      return {
        confirmed: parseInt(confirmed) || 0,
        waitlisted: parseInt(waitlisted) || 0
      };
    } finally {
      client.release();
    }
  }

  async getNextWaitlistPosition(eventId: string): Promise<number> {
    const client = await this.database.connect();
    try {
      const query = `
        SELECT COALESCE(MAX(waitlist_position), 0) + 1 as next_position
        FROM registrations 
        WHERE event_id = $1 AND status = 'waitlisted'
      `;
      
      const result = await client.query(query, [eventId]);
      return result.rows[0].next_position;
    } finally {
      client.release();
    }
  }

  async moveFromWaitlist(eventId: string, count: number = 1): Promise<RegistrationModel[]> {
    const client = await this.database.connect();
    try {
      await client.query('BEGIN');
      
      const query = `
        UPDATE registrations 
        SET status = 'confirmed', waitlist_position = NULL
        WHERE event_id = $1 AND status = 'waitlisted'
        ORDER BY waitlist_position ASC
        LIMIT $2
        RETURNING *
      `;
      
      const result = await client.query(query, [eventId, count]);
      
      await client.query('COMMIT');
      return result.rows.map(row => RegistrationModel.fromDatabase(row));
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}