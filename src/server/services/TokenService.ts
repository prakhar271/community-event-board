import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { db } from '../config/database';
import { env } from '../config/env';
import { logger } from '../config/logger';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenData {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  isRevoked: boolean;
}

export class TokenService {
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';

  // Generate token pair
  async generateTokenPair(userId: string): Promise<TokenPair> {
    try {
      // Generate access token
      const accessToken = jwt.sign(
        { userId, type: 'access' },
        env.JWT_SECRET,
        { expiresIn: this.ACCESS_TOKEN_EXPIRY }
      );

      // Generate refresh token
      const refreshToken = randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      // Store refresh token in database
      await db.query(`
        INSERT INTO refresh_tokens (user_id, token, expires_at)
        VALUES ($1, $2, $3)
      `, [userId, refreshToken, expiresAt]);

      logger.info('Token pair generated', { userId });

      return { accessToken, refreshToken };
    } catch (error) {
      logger.error('Failed to generate token pair', error as Error, { userId });
      throw new Error('Token generation failed');
    }
  }

  // Refresh access token
  async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    try {
      // Find and validate refresh token
      const result = await db.query(`
        SELECT rt.*, u.id as user_id, u.email, u.role
        FROM refresh_tokens rt
        JOIN users u ON rt.user_id = u.id
        WHERE rt.token = $1 
          AND rt.expires_at > NOW() 
          AND rt.is_revoked = false
      `, [refreshToken]);

      if (result.rows.length === 0) {
        throw new Error('Invalid or expired refresh token');
      }

      const tokenData = result.rows[0];

      // Revoke old refresh token (rotation)
      await this.revokeRefreshToken(refreshToken);

      // Generate new token pair
      const newTokenPair = await this.generateTokenPair(tokenData.user_id);

      logger.info('Access token refreshed', { 
        userId: tokenData.user_id,
        oldToken: refreshToken.substring(0, 8) + '...'
      });

      return newTokenPair;
    } catch (error) {
      logger.error('Failed to refresh access token', error as Error, { refreshToken: refreshToken.substring(0, 8) + '...' });
      throw error;
    }
  }

  // Revoke refresh token
  async revokeRefreshToken(refreshToken: string): Promise<void> {
    try {
      await db.query(`
        UPDATE refresh_tokens 
        SET is_revoked = true, revoked_at = NOW()
        WHERE token = $1
      `, [refreshToken]);

      logger.info('Refresh token revoked', { 
        token: refreshToken.substring(0, 8) + '...'
      });
    } catch (error) {
      logger.error('Failed to revoke refresh token', error as Error);
      throw error;
    }
  }

  // Revoke all user tokens (logout all devices)
  async revokeAllUserTokens(userId: string): Promise<void> {
    try {
      await db.query(`
        UPDATE refresh_tokens 
        SET is_revoked = true, revoked_at = NOW()
        WHERE user_id = $1 AND is_revoked = false
      `, [userId]);

      logger.info('All user tokens revoked', { userId });
    } catch (error) {
      logger.error('Failed to revoke all user tokens', error as Error, { userId });
      throw error;
    }
  }

  // Cleanup expired tokens (background job)
  async cleanupExpiredTokens(): Promise<void> {
    try {
      const result = await db.query(`
        DELETE FROM refresh_tokens 
        WHERE expires_at < NOW() OR is_revoked = true
      `);

      logger.info('Expired tokens cleaned up', { 
        deletedCount: result.rowCount 
      });
    } catch (error) {
      logger.error('Failed to cleanup expired tokens', error as Error);
    }
  }

  // Verify access token
  verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  // Get user refresh tokens
  async getUserRefreshTokens(userId: string): Promise<RefreshTokenData[]> {
    try {
      const result = await db.query(`
        SELECT id, user_id, token, expires_at, created_at, is_revoked
        FROM refresh_tokens
        WHERE user_id = $1 AND is_revoked = false
        ORDER BY created_at DESC
      `, [userId]);

      return result.rows;
    } catch (error) {
      logger.error('Failed to get user refresh tokens', error as Error, { userId });
      throw error;
    }
  }
}