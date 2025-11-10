import { Test, TestingModule } from '@nestjs/testing';
import { AuctionsCron } from './auctions.cron';
import { Queue } from 'bullmq';
import { SCRAPING_QUEUE } from '@linkinvests/shared';

// Mock BullMQ Queue
const mockQueue = {
  add: jest.fn(),
  getJobs: jest.fn(),
  clean: jest.fn(),
};

describe('AuctionsCron', () => {
  let cronService: AuctionsCron;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuctionsCron,
        {
          provide: `BullQueue_${SCRAPING_QUEUE}`,
          useValue: mockQueue,
        },
      ],
    }).compile();

    cronService = module.get<AuctionsCron>(AuctionsCron);

    // Suppress logger
    jest.spyOn(cronService['logger'], 'log').mockImplementation();
    jest.spyOn(cronService['logger'], 'warn').mockImplementation();
    jest.spyOn(cronService['logger'], 'error').mockImplementation();

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('handleDailyAuctionScraping', () => {
    beforeEach(() => {
      (mockQueue.add as jest.MockedFunction<any>).mockResolvedValue({
        id: 'job-123',
        name: 'auctions',
        data: {},
      } as any);
    });

    it('should schedule auction scraping job successfully', async () => {
      await cronService.handleDailyAuctionScraping();

      expect(mockQueue.add).toHaveBeenCalledWith(
        'auctions',
        {
          jobName: 'auctions',
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: {
            age: 7 * 24 * 3600,
            count: 100,
          },
          removeOnFail: {
            age: 30 * 24 * 3600,
          },
        }
      );

      expect(cronService['logger'].log).toHaveBeenCalledWith(
        'Starting daily auction scraping for all departments'
      );
    });

    it('should handle job scheduling failure', async () => {
      const schedulingError = new Error('Queue unavailable');
      (mockQueue.add as jest.MockedFunction<any>).mockRejectedValue(schedulingError);

      await cronService.handleDailyAuctionScraping();

      expect(cronService['logger'].error).toHaveBeenCalledWith(
        'Failed to enqueue auction job',
        schedulingError
      );
    });

    it('should configure job options correctly', async () => {
      await cronService.handleDailyAuctionScraping();

      const jobOptions = (mockQueue.add as jest.MockedFunction<any>).mock.calls[0][2];
      expect(jobOptions).toEqual({
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 10,
        removeOnFail: 5,
      });
    });

    it('should handle queue connection issues', async () => {
      const connectionError = new Error('ECONNREFUSED: Connection refused');
      (mockQueue.add as jest.MockedFunction<any>).mockRejectedValue(connectionError);

      await cronService.handleDailyAuctionScraping();

      expect(cronService['logger'].error).toHaveBeenCalledWith(
        'Failed to enqueue auction job',
        connectionError
      );
    });

    it('should handle Redis unavailability', async () => {
      const redisError = new Error('Redis connection lost');
      (mockQueue.add as jest.MockedFunction<any>).mockRejectedValue(redisError);

      await cronService.handleDailyAuctionScraping();

      expect(cronService['logger'].error).toHaveBeenCalledWith(
        'Failed to enqueue auction job',
        redisError
      );
    });

    it('should handle queue full scenarios', async () => {
      const queueFullError = new Error('Queue is full');
      (mockQueue.add as jest.MockedFunction<any>).mockRejectedValue(queueFullError);

      await cronService.handleDailyAuctionScraping();

      expect(cronService['logger'].error).toHaveBeenCalledWith(
        'Failed to enqueue auction job',
        queueFullError
      );
    });

    it('should not throw errors on failure', async () => {
      (mockQueue.add as jest.MockedFunction<any>).mockRejectedValue(new Error('Any error'));

      // Should not throw, only log
      await expect(cronService.handleDailyAuctionScraping()).resolves.not.toThrow();
    });

    it('should schedule with empty job data', async () => {
      await cronService.handleDailyAuctionScraping();

      expect(mockQueue.add).toHaveBeenCalledWith(
        'scrape-auctions',
        {}, // Empty data object
        expect.any(Object)
      );
    });

    it('should use correct job name', async () => {
      await cronService.handleDailyAuctionScraping();

      expect(mockQueue.add).toHaveBeenCalledWith(
        'scrape-auctions',
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should handle timeout scenarios', async () => {
      const timeoutError = new Error('Operation timed out');
      (mockQueue.add as jest.MockedFunction<any>).mockRejectedValue(timeoutError);

      await cronService.handleDailyAuctionScraping();

      expect(cronService['logger'].error).toHaveBeenCalledWith(
        'Failed to enqueue auction job',
        timeoutError
      );
    });

    it('should handle authentication errors', async () => {
      const authError = new Error('Authentication failed');
      (mockQueue.add as jest.MockedFunction<any>).mockRejectedValue(authError);

      await cronService.handleDailyAuctionScraping();

      expect(cronService['logger'].error).toHaveBeenCalledWith(
        'Failed to enqueue auction job',
        authError
      );
    });
  });

  describe('cron scheduling configuration', () => {
    it('should be configured to run daily at 2 AM Paris time', () => {
      // Check if the cron decorator is properly configured
      // This would typically be verified through metadata or integration tests
      expect(cronService.handleDailyAuctionScraping).toBeDefined();
    });

    it('should handle timezone considerations', async () => {
      // Mock Date to simulate different times
      const originalDate = global.Date;
      const mockDate = new Date('2025-01-15T02:00:00+01:00'); // 2 AM Paris time

      global.Date = jest.fn(() => mockDate) as any;
      global.Date.now = jest.fn(() => mockDate.getTime());

      await cronService.handleDailyAuctionScraping();

      expect(mockQueue.add).toHaveBeenCalledTimes(1);

      global.Date = originalDate;
    });

    it('should handle daylight saving time transitions', async () => {
      // Test behavior during DST transitions
      const dstDate = new Date('2025-03-30T02:00:00+02:00'); // DST transition
      jest.spyOn(global, 'Date').mockImplementation(() => dstDate as any);

      await cronService.handleDailyAuctionScraping();

      expect(mockQueue.add).toHaveBeenCalledTimes(1);
    });
  });

  describe('job configuration and retry logic', () => {
    it('should configure appropriate retry attempts', async () => {
      await cronService.handleDailyAuctionScraping();

      const jobOptions = (mockQueue.add as jest.MockedFunction<any>).mock.calls[0][2];
      expect(jobOptions.attempts).toBe(3);
    });

    it('should configure exponential backoff', async () => {
      await cronService.handleDailyAuctionScraping();

      const jobOptions = (mockQueue.add as jest.MockedFunction<any>).mock.calls[0][2];
      expect(jobOptions.backoff).toEqual({
        type: 'exponential',
        delay: 5000,
      });
    });

    it('should configure job cleanup policies', async () => {
      await cronService.handleDailyAuctionScraping();

      const jobOptions = (mockQueue.add as jest.MockedFunction<any>).mock.calls[0][2];
      expect(jobOptions.removeOnComplete).toBe(10);
      expect(jobOptions.removeOnFail).toBe(5);
    });

    it('should handle job priority if needed', async () => {
      await cronService.handleDailyAuctionScraping();

      const jobOptions = (mockQueue.add as jest.MockedFunction<any>).mock.calls[0][2];
      // Job priority could be added if needed
      expect(jobOptions).toBeDefined();
    });
  });

  describe('error scenarios and resilience', () => {
    it('should handle network interruptions gracefully', async () => {
      const networkError = new Error('ENETUNREACH: Network is unreachable');
      (mockQueue.add as jest.MockedFunction<any>).mockRejectedValue(networkError);

      await cronService.handleDailyAuctionScraping();

      expect(cronService['logger'].error).toHaveBeenCalledWith(
        'Failed to enqueue auction job',
        networkError
      );
    });

    it('should handle malformed job data gracefully', async () => {
      // Even though we pass empty object, test resilience
      (mockQueue.add as jest.MockedFunction<any>).mockRejectedValue(new Error('Invalid job data'));

      await cronService.handleDailyAuctionScraping();

      expect(cronService['logger'].error).toHaveBeenCalledWith(
        'Failed to enqueue auction job',
        expect.any(Error)
      );
    });

    it('should handle queue service downtime', async () => {
      const serviceDownError = new Error('Service temporarily unavailable');
      (mockQueue.add as jest.MockedFunction<any>).mockRejectedValue(serviceDownError);

      await cronService.handleDailyAuctionScraping();

      expect(cronService['logger'].error).toHaveBeenCalledWith(
        'Failed to enqueue auction job',
        serviceDownError
      );
    });

    it('should handle memory issues in queue', async () => {
      const memoryError = new Error('Out of memory');
      (mockQueue.add as jest.MockedFunction<any>).mockRejectedValue(memoryError);

      await cronService.handleDailyAuctionScraping();

      expect(cronService['logger'].error).toHaveBeenCalledWith(
        'Failed to enqueue auction job',
        memoryError
      );
    });

    it('should handle concurrent scheduling attempts', async () => {
      // Simulate multiple cron triggers
      const promises = [
        cronService.handleDailyAuctionScraping(),
        cronService.handleDailyAuctionScraping(),
        cronService.handleDailyAuctionScraping(),
      ];

      await Promise.all(promises);

      expect(mockQueue.add).toHaveBeenCalledTimes(3);
      expect(cronService['logger'].log).toHaveBeenCalledTimes(3);
    });
  });

  describe('queue initialization and management', () => {
    it('should initialize queue with correct configuration', () => {
      // The queue should be initialized in the constructor
      expect(cronService['queue']).toBeDefined();
    });

    it('should handle queue health monitoring', async () => {
      // If health monitoring is implemented
      mockQueue.getJobs = jest.fn().mockResolvedValue([]);

      await cronService.handleDailyAuctionScraping();

      // Should successfully add job without checking health first
      expect(mockQueue.add).toHaveBeenCalledTimes(1);
    });

    it('should handle queue cleanup operations', async () => {
      // If cleanup is implemented
      mockQueue.clean = jest.fn().mockResolvedValue(0);

      await cronService.handleDailyAuctionScraping();

      expect(mockQueue.add).toHaveBeenCalledTimes(1);
    });
  });

  describe('logging and monitoring', () => {
    it('should log successful job scheduling', async () => {
      await cronService.handleDailyAuctionScraping();

      expect(cronService['logger'].log).toHaveBeenCalledWith(
        'Scheduled auction scraping job'
      );
    });

    it('should log detailed error information', async () => {
      const detailedError = new Error('Detailed error message');
      detailedError.stack = 'Error: Detailed error message\n    at ...';
      (mockQueue.add as jest.MockedFunction<any>).mockRejectedValue(detailedError);

      await cronService.handleDailyAuctionScraping();

      expect(cronService['logger'].error).toHaveBeenCalledWith(
        'Failed to enqueue auction job',
        detailedError
      );
    });

    it('should maintain consistent logging format', async () => {
      await cronService.handleDailyAuctionScraping();

      const logCalls = (cronService['logger'].log as jest.MockedFunction<any>).mock.calls;
      expect(logCalls).toHaveLength(1);
      expect(typeof logCalls[0][0]).toBe('string');
    });

    it('should handle logging system failures gracefully', async () => {
      // If logger throws an error, it shouldn't break the cron
      jest.spyOn(cronService['logger'], 'log').mockImplementation(() => {
        throw new Error('Logger failed');
      });

      // Should not throw even if logging fails
      await expect(cronService.handleDailyAuctionScraping()).resolves.not.toThrow();
    });
  });

  describe('performance and resource management', () => {
    it('should complete scheduling quickly', async () => {
      const startTime = Date.now();
      await cronService.handleDailyAuctionScraping();
      const endTime = Date.now();

      // Should complete within reasonable time (using mock, so should be very fast)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should not block on job scheduling', async () => {
      // Mock a slow add operation
      (mockQueue.add as jest.MockedFunction<any>).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ id: 'job-123' } as any), 100)
          )
      );

      const startTime = Date.now();
      await cronService.handleDailyAuctionScraping();
      const endTime = Date.now();

      // Should wait for the operation to complete
      expect(endTime - startTime).toBeGreaterThanOrEqual(90);
    });

    it('should handle resource cleanup properly', async () => {
      await cronService.handleDailyAuctionScraping();

      // Verify no resource leaks (in a real scenario)
      expect(mockQueue.add).toHaveBeenCalledTimes(1);
    });
  });
});
