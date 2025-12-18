import { db } from '../config/database';
import { logger } from '../config/logger';

export interface ModerationFlag {
  id: string;
  contentType: 'event' | 'review' | 'user' | 'comment';
  contentId: string;
  reporterId: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedBy?: string;
  reviewedAt?: Date;
  action?: 'none' | 'warning' | 'content_removed' | 'user_suspended' | 'user_banned';
  actionReason?: string;
  createdAt: Date;
}

export class ModerationService {
  // Report content for moderation
  async reportContent(data: {
    contentType: string;
    contentId: string;
    reporterId: string;
    reason: string;
    description?: string;
  }): Promise<ModerationFlag> {
    try {
      const result = await db.query(`
        INSERT INTO moderation_flags (content_type, content_id, reporter_id, reason, description)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [data.contentType, data.contentId, data.reporterId, data.reason, data.description]);

      const flag = result.rows[0];
      
      logger.info('Content reported for moderation', {
        flagId: flag.id,
        contentType: data.contentType,
        contentId: data.contentId,
        reporterId: data.reporterId,
        reason: data.reason
      });

      return flag;
    } catch (error) {
      logger.error('Failed to report content', error as Error, data);
      throw new Error('Failed to report content');
    }
  }

  // Get pending moderation flags
  async getPendingFlags(limit: number = 50, offset: number = 0): Promise<ModerationFlag[]> {
    try {
      const result = await db.query(`
        SELECT mf.*, 
               u.name as reporter_name, u.email as reporter_email,
               r.name as reviewer_name
        FROM moderation_flags mf
        JOIN users u ON mf.reporter_id = u.id
        LEFT JOIN users r ON mf.reviewed_by = r.id
        WHERE mf.status = 'pending'
        ORDER BY mf.created_at ASC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);

      return result.rows;
    } catch (error) {
      logger.error('Failed to get pending flags', error as Error);
      throw new Error('Failed to get pending flags');
    }
  }

  // Review a moderation flag
  async reviewFlag(
    flagId: string, 
    reviewerId: string, 
    action: string, 
    actionReason?: string
  ): Promise<void> {
    try {
      // Update flag status
      await db.query(`
        UPDATE moderation_flags 
        SET status = 'reviewed', 
            reviewed_by = $1, 
            reviewed_at = NOW(),
            action = $2,
            action_reason = $3
        WHERE id = $4
      `, [reviewerId, action, actionReason, flagId]);

      // Apply moderation action
      await this.applyModerationAction(flagId, action, reviewerId);

      logger.info('Moderation flag reviewed', {
        flagId,
        reviewerId,
        action,
        actionReason
      });
    } catch (error) {
      logger.error('Failed to review flag', error as Error, { flagId, reviewerId, action });
      throw new Error('Failed to review moderation flag');
    }
  }

  // Apply moderation action
  private async applyModerationAction(flagId: string, action: string, reviewerId: string): Promise<void> {
    try {
      // Get flag details
      const flagResult = await db.query(`
        SELECT * FROM moderation_flags WHERE id = $1
      `, [flagId]);

      if (flagResult.rows.length === 0) {
        throw new Error('Flag not found');
      }

      const flag = flagResult.rows[0];

      switch (action) {
        case 'content_removed':
          await this.removeContent(flag.content_type, flag.content_id);
          break;
          
        case 'user_suspended':
          await this.suspendUser(flag.content_id, '7 days', reviewerId);
          break;
          
        case 'user_banned':
          await this.banUser(flag.content_id, reviewerId);
          break;
          
        case 'warning':
          await this.sendWarning(flag.content_id, flag.reason, reviewerId);
          break;
          
        default:
          // No action needed
          break;
      }

      logger.info('Moderation action applied', {
        flagId,
        action,
        contentType: flag.content_type,
        contentId: flag.content_id
      });
    } catch (error) {
      logger.error('Failed to apply moderation action', error as Error, { flagId, action });
      throw error;
    }
  }

  // Remove content
  private async removeContent(contentType: string, contentId: string): Promise<void> {
    try {
      switch (contentType) {
        case 'event':
          await db.query(`UPDATE events SET status = 'removed' WHERE id = $1`, [contentId]);
          break;
          
        case 'review':
          await db.query(`UPDATE reviews SET status = 'removed' WHERE id = $1`, [contentId]);
          break;
          
        default:
          logger.warn('Unknown content type for removal', { contentType, contentId });
      }
    } catch (error) {
      logger.error('Failed to remove content', error as Error, { contentType, contentId });
      throw error;
    }
  }

  // Suspend user
  private async suspendUser(userId: string, duration: string, reviewerId: string): Promise<void> {
    try {
      // Calculate suspension end date
      const suspensionEnd = new Date();
      suspensionEnd.setDate(suspensionEnd.getDate() + 7); // 7 days

      await db.query(`
        UPDATE users 
        SET is_active = false,
            suspension_end = $1,
            suspended_by = $2,
            suspended_at = NOW()
        WHERE id = $3
      `, [suspensionEnd, reviewerId, userId]);

      logger.info('User suspended', { userId, duration, reviewerId });
    } catch (error) {
      logger.error('Failed to suspend user', error as Error, { userId, duration });
      throw error;
    }
  }

  // Ban user permanently
  private async banUser(userId: string, reviewerId: string): Promise<void> {
    try {
      await db.query(`
        UPDATE users 
        SET is_active = false,
            is_banned = true,
            banned_by = $1,
            banned_at = NOW()
        WHERE id = $2
      `, [reviewerId, userId]);

      logger.info('User banned', { userId, reviewerId });
    } catch (error) {
      logger.error('Failed to ban user', error as Error, { userId });
      throw error;
    }
  }

  // Send warning to user
  private async sendWarning(userId: string, reason: string, reviewerId: string): Promise<void> {
    try {
      // This would integrate with notification system
      logger.info('Warning sent to user', { userId, reason, reviewerId });
      
      // TODO: Send actual notification/email to user
    } catch (error) {
      logger.error('Failed to send warning', error as Error, { userId, reason });
      throw error;
    }
  }

  // Get moderation statistics
  async getModerationStats(): Promise<any> {
    try {
      const result = await db.query(`
        SELECT 
          status,
          COUNT(*) as count
        FROM moderation_flags
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY status
      `);

      const stats = result.rows.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, {});

      return {
        last30Days: stats,
        totalPending: stats.pending || 0
      };
    } catch (error) {
      logger.error('Failed to get moderation stats', error as Error);
      throw new Error('Failed to get moderation statistics');
    }
  }

  // Auto-moderate content (basic implementation)
  async autoModerate(contentType: string, content: string): Promise<boolean> {
    try {
      // Simple keyword-based auto-moderation
      const bannedWords = ['spam', 'scam', 'fake', 'fraud', 'illegal'];
      const contentLower = content.toLowerCase();
      
      const hasBannedWords = bannedWords.some(word => contentLower.includes(word));
      
      if (hasBannedWords) {
        logger.warn('Content auto-flagged for moderation', { 
          contentType, 
          content: content.substring(0, 100) + '...' 
        });
        return true; // Needs moderation
      }
      
      return false; // Content is clean
    } catch (error) {
      logger.error('Auto-moderation failed', error as Error);
      return false; // Default to allowing content if auto-moderation fails
    }
  }
}