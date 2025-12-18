import { Pool } from 'pg';
import { UserModel } from '../models/UserModel';
import { db } from '../config/database';

export class UserRepository {
  constructor(private database: Pool = db) {}

  async create(user: UserModel): Promise<UserModel> {
    const client = await this.database.connect();
    try {
      const userData = user.toDatabase();
      const query = `
        INSERT INTO users (
          id, email, name, role, profile, organizer_profile, is_verified,
          is_active, password_hash, created_at, last_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;
      
      const values = [
        userData.id, userData.email, userData.name, userData.role,
        userData.profile, userData.organizer_profile, userData.is_verified,
        userData.is_active, userData.password_hash, userData.created_at,
        userData.last_active
      ];

      const result = await client.query(query, values);
      return UserModel.fromDatabase(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<UserModel | null> {
    const client = await this.database.connect();
    try {
      const query = 'SELECT * FROM users WHERE id = $1';
      const result = await client.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return UserModel.fromDatabase(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    const client = await this.database.connect();
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await client.query(query, [email]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return UserModel.fromDatabase(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async update(id: string, user: Partial<UserModel>): Promise<UserModel | null> {
    const client = await this.database.connect();
    try {
      const userData = new UserModel(user).toDatabase();
      
      const setClause = Object.keys(userData)
        .filter(key => key !== 'id' && userData[key] !== undefined)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');
      
      const values = [id, ...Object.keys(userData)
        .filter(key => key !== 'id' && userData[key] !== undefined)
        .map(key => userData[key])];
      
      const query = `UPDATE users SET ${setClause} WHERE id = $1 RETURNING *`;
      const result = await client.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return UserModel.fromDatabase(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async delete(id: string): Promise<boolean> {
    const client = await this.database.connect();
    try {
      const query = 'DELETE FROM users WHERE id = $1';
      const result = await client.query(query, [id]);
      return (result.rowCount ?? 0) > 0;
    } finally {
      client.release();
    }
  }
}