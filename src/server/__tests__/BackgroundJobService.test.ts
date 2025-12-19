import { backgroundJobService } from '../services/BackgroundJobService';

describe('BackgroundJobService', () => {
  beforeEach(() => {
    // Clear any existing jobs
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any running jobs
    backgroundJobService.cancelJob('test-job');
    backgroundJobService.cancelJob('test-recurring');
    backgroundJobService.cancelJob('test-delayed');
  });

  describe('Job Scheduling', () => {
    it('should schedule a recurring job', (done) => {
      let executionCount = 0;

      const testJob = async () => {
        executionCount++;
        if (executionCount >= 2) {
          backgroundJobService.cancelJob('test-recurring');
          expect(executionCount).toBeGreaterThanOrEqual(2);
          done();
        }
      };

      backgroundJobService.scheduleRecurring('test-recurring', testJob, 100); // 100ms interval
    }, 10000);

    it('should schedule a delayed job', (done) => {
      let executed = false;

      const testJob = async () => {
        executed = true;
        expect(executed).toBe(true);
        done();
      };

      backgroundJobService.scheduleDelayed('test-delayed', testJob, 100); // 100ms delay
    }, 5000);

    it('should cancel a job', (done) => {
      let executed = false;

      const testJob = async () => {
        executed = true;
      };

      backgroundJobService.scheduleDelayed('test-cancel', testJob, 100);
      backgroundJobService.cancelJob('test-cancel');

      // Wait longer than the delay to ensure job was cancelled
      setTimeout(() => {
        expect(executed).toBe(false);
        done();
      }, 200);
    }, 5000);
  });

  describe('Job Initialization', () => {
    it('should initialize jobs with services', () => {
      const mockServices = {
        eventService: {
          getUpcomingEvents: jest.fn().mockResolvedValue([]),
          searchEvents: jest.fn().mockResolvedValue({ data: [] }),
          getEventRegistrations: jest.fn().mockResolvedValue([]),
        },
        emailService: {
          sendEventReminder: jest.fn().mockResolvedValue(true),
        },
      };

      // This should not throw an error
      expect(() => {
        backgroundJobService.initializeJobs(mockServices);
      }).not.toThrow();
    });

    it('should handle null services gracefully', () => {
      const mockServices = {
        eventService: null,
        emailService: null,
      };

      // This should not throw an error
      expect(() => {
        backgroundJobService.initializeJobs(mockServices);
      }).not.toThrow();
    });
  });

  describe('Job Error Handling', () => {
    it('should handle job errors gracefully', (done) => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const failingJob = async () => {
        throw new Error('Test job error');
      };

      backgroundJobService.scheduleDelayed('test-error', failingJob, 50);

      setTimeout(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('❌ Delayed job failed: test-error'),
          expect.any(Error)
        );
        consoleSpy.mockRestore();
        done();
      }, 150);
    }, 5000);

    it('should handle recurring job errors gracefully', (done) => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      let errorCount = 0;

      const failingJob = async () => {
        errorCount++;
        if (errorCount >= 2) {
          backgroundJobService.cancelJob('test-recurring-error');
          expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('❌ Job failed: test-recurring-error'),
            expect.any(Error)
          );
          consoleSpy.mockRestore();
          done();
        }
        throw new Error('Recurring job error');
      };

      backgroundJobService.scheduleRecurring(
        'test-recurring-error',
        failingJob,
        50
      );
    }, 5000);
  });

  describe('Multiple Jobs', () => {
    it('should handle multiple concurrent jobs', (done) => {
      let job1Executed = false;
      let job2Executed = false;
      let job3Executed = false;

      const job1 = async () => {
        job1Executed = true;
      };
      const job2 = async () => {
        job2Executed = true;
      };
      const job3 = async () => {
        job3Executed = true;
      };

      backgroundJobService.scheduleDelayed('job1', job1, 50);
      backgroundJobService.scheduleDelayed('job2', job2, 75);
      backgroundJobService.scheduleDelayed('job3', job3, 100);

      setTimeout(() => {
        expect(job1Executed).toBe(true);
        expect(job2Executed).toBe(true);
        expect(job3Executed).toBe(true);
        done();
      }, 200);
    }, 5000);

    it('should handle multiple jobs with different names', (done) => {
      let job1Executed = false;
      let job2Executed = false;

      const job1 = async () => {
        job1Executed = true;
      };
      const job2 = async () => {
        job2Executed = true;
      };

      // Schedule two different jobs
      backgroundJobService.scheduleDelayed('multi-test-1', job1, 50);
      backgroundJobService.scheduleDelayed('multi-test-2', job2, 75);

      setTimeout(() => {
        expect(job1Executed).toBe(true);
        expect(job2Executed).toBe(true);
        done();
      }, 150);
    }, 5000);
  });

  describe('Job Lifecycle', () => {
    it('should handle job execution without errors', (done) => {
      let jobExecuted = false;

      const testJob = async () => {
        jobExecuted = true;
      };

      backgroundJobService.scheduleDelayed('simple-test', testJob, 50);

      setTimeout(() => {
        expect(jobExecuted).toBe(true);
        done();
      }, 150);
    }, 5000);
  });
});
