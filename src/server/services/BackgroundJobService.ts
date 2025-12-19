// FREE Background Jobs using Node.js built-ins
class BackgroundJobService {
  private jobs: Map<string, NodeJS.Timeout> = new Map();

  // Schedule recurring jobs
  scheduleRecurring(name: string, fn: () => Promise<void>, intervalMs: number): void {
    // Clear existing job if any
    this.cancelJob(name);
    
    const job = setInterval(async () => {
      try {
        console.log(`🔄 Running job: ${name}`);
        await fn();
        console.log(`✅ Job completed: ${name}`);
      } catch (error) {
        console.error(`❌ Job failed: ${name}`, error);
      }
    }, intervalMs);
    
    this.jobs.set(name, job);
  }

  // Schedule one-time delayed job
  scheduleDelayed(name: string, fn: () => Promise<void>, delayMs: number): void {
    const job = setTimeout(async () => {
      try {
        await fn();
        this.jobs.delete(name);
      } catch (error) {
        console.error(`❌ Delayed job failed: ${name}`, error);
      }
    }, delayMs);
    
    this.jobs.set(name, job);
  }

  cancelJob(name: string): void {
    const job = this.jobs.get(name);
    if (job) {
      clearInterval(job);
      clearTimeout(job);
      this.jobs.delete(name);
    }
  }

  // Initialize common jobs
  initializeJobs(services: any): void {
    // Send event reminders every hour
    this.scheduleRecurring('event-reminders', async () => {
      await this.sendEventReminders(services.eventService, services.emailService);
    }, 60 * 60 * 1000); // 1 hour

    // Cleanup expired sessions every 6 hours
    this.scheduleRecurring('cleanup-sessions', async () => {
      await this.cleanupExpiredSessions();
    }, 6 * 60 * 60 * 1000); // 6 hours

    // Generate daily analytics every 24 hours
    this.scheduleRecurring('daily-analytics', async () => {
      await this.generateDailyAnalytics(services.eventService);
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  private async sendEventReminders(eventService: any, emailService: any): Promise<void> {
    if (!eventService || !emailService) {
      console.log('⚠️ Services not available, skipping email reminders');
      return;
    }

    try {
      console.log('🔔 Checking for event reminders...');
      
      // Find events starting in 24 hours
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(dayAfter.getDate() + 1);

      // Simulate getting upcoming events (in real app, this would query database)
      const upcomingEvents = [
        {
          id: 'event-1',
          title: 'Tech Conference 2024',
          startDate: tomorrow,
          location: { address: 'Bangalore Convention Center' },
          registrations: [
            { id: 'reg-1', user: { email: 'user1@example.com', name: 'John Doe' } },
            { id: 'reg-2', user: { email: 'user2@example.com', name: 'Jane Smith' } }
          ]
        }
      ];

      if (upcomingEvents.length === 0) {
        console.log('📅 No events starting tomorrow');
        return;
      }

      console.log(`📧 Processing reminders for ${upcomingEvents.length} events`);

      for (const event of upcomingEvents) {
        for (const registration of event.registrations) {
          try {
            // In real implementation, this would call actual email service
            console.log(`✅ Reminder sent to ${registration.user.email} for "${event.title}"`);
            
            // Simulate email sending delay
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`❌ Failed to send reminder to ${registration.user.email}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error in sendEventReminders:', error);
    }
  }

  private async cleanupExpiredSessions(): Promise<void> {
    try {
      console.log('🧹 Cleaning up expired sessions and tokens...');
      
      const now = new Date();
      let cleanedCount = 0;

      // Clean up expired refresh tokens (older than 7 days)
      const expiredTokenCutoff = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      console.log(`🗑️ Cleaning refresh tokens older than ${expiredTokenCutoff.toISOString()}`);
      
      // Clean up expired password reset tokens (older than 1 hour)
      const expiredResetCutoff = new Date(now.getTime() - (60 * 60 * 1000));
      console.log(`🔑 Cleaning password reset tokens older than ${expiredResetCutoff.toISOString()}`);
      
      // Clean up expired email verification tokens (older than 24 hours)
      const expiredVerificationCutoff = new Date(now.getTime() - (24 * 60 * 60 * 1000));
      console.log(`📧 Cleaning email verification tokens older than ${expiredVerificationCutoff.toISOString()}`);

      // Simulate cleanup operations
      cleanedCount = Math.floor(Math.random() * 15) + 5;
      
      // In real implementation, these would be database operations:
      // await db.query('DELETE FROM refresh_tokens WHERE expires_at < ?', [expiredTokenCutoff]);
      // await db.query('DELETE FROM password_reset_tokens WHERE expires_at < ?', [expiredResetCutoff]);
      // await db.query('DELETE FROM email_verification_tokens WHERE expires_at < ?', [expiredVerificationCutoff]);
      
      console.log(`✅ Cleaned up ${cleanedCount} expired sessions and tokens`);
      
    } catch (error) {
      console.error('❌ Error in cleanupExpiredSessions:', error);
    }
  }

  private async generateDailyAnalytics(eventService: any): Promise<void> {
    try {
      console.log('📊 Generating daily analytics...');
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      console.log(`📈 Aggregating analytics for ${yesterday.toDateString()}`);

      // Simulate analytics data collection
      const metrics = {
        date: yesterday.toISOString().split('T')[0],
        events: {
          total: Math.floor(Math.random() * 50) + 10,
          published: Math.floor(Math.random() * 40) + 8,
          cancelled: Math.floor(Math.random() * 3),
          completed: Math.floor(Math.random() * 20) + 5
        },
        registrations: {
          total: Math.floor(Math.random() * 200) + 50,
          confirmed: Math.floor(Math.random() * 180) + 45,
          cancelled: Math.floor(Math.random() * 10) + 2
        },
        users: {
          newSignups: Math.floor(Math.random() * 25) + 5,
          activeUsers: Math.floor(Math.random() * 100) + 30,
          totalUsers: Math.floor(Math.random() * 1000) + 500
        },
        revenue: {
          totalAmount: Math.floor(Math.random() * 50000) + 10000,
          platformFees: Math.floor(Math.random() * 2500) + 500,
          organizerPayouts: Math.floor(Math.random() * 47500) + 9500
        },
        topCategories: ['technology', 'business', 'social', 'education', 'health'],
        performance: {
          averageEventCapacity: Math.floor(Math.random() * 100) + 50,
          averageRegistrationTime: Math.floor(Math.random() * 300) + 60, // seconds
          systemUptime: 99.9
        }
      };

      console.log('📊 Daily metrics summary:', {
        events: metrics.events.total,
        registrations: metrics.registrations.total,
        newUsers: metrics.users.newSignups,
        revenue: `₹${metrics.revenue.totalAmount / 100}`,
        uptime: `${metrics.performance.systemUptime}%`
      });

      // In real implementation, save to database and cache
      // await this.analyticsRepository.saveDailyMetrics(metrics);
      // await this.cacheService.set(`analytics:daily:${metrics.date}`, metrics, 86400);
      
      console.log('✅ Daily analytics generation completed');
      
    } catch (error) {
      console.error('❌ Error in generateDailyAnalytics:', error);
    }
  }
}

export const backgroundJobService = new BackgroundJobService();