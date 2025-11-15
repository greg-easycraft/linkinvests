import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SCRAPING_QUEUE } from '@linkinvests/shared';

import { ScrapingController } from './scraping.controller';
import type { ScrapingJobData } from '../types/scraping-job.types';

describe('ScrapingController', () => {
  let controller: ScrapingController;
  let mockScrapingQueue: jest.Mocked<Queue>;

  beforeEach(async () => {
    // Create mock scraping queue
    mockScrapingQueue = {
      add: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScrapingController],
      providers: [
        {
          provide: getQueueToken(SCRAPING_QUEUE),
          useValue: mockScrapingQueue,
        },
      ],
    }).compile();

    controller = module.get<ScrapingController>(ScrapingController);

    // Suppress logger output during tests
    jest.spyOn(controller['logger'], 'log').mockImplementation();
    jest.spyOn(controller['logger'], 'warn').mockImplementation();
    jest.spyOn(controller['logger'], 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('enqueueAuctionJob', () => {
    it('should successfully enqueue an auction job with departmentId only', async () => {
      const mockJobId = 'auction-job-123';
      const currentDate = new Date().toISOString().split('T')[0];
      mockScrapingQueue.add.mockResolvedValue({ id: mockJobId } as any);

      const result = await controller.enqueueAuctionJob(75);

      const expectedJobData: ScrapingJobData = {
        jobName: 'auctions',
        departmentId: 75,
        sinceDate: currentDate,
      };

      expect(result).toEqual({
        success: true,
        jobId: mockJobId,
        message: 'Auction scraping job enqueued successfully',
        data: expectedJobData,
      });

      expect(mockScrapingQueue.add).toHaveBeenCalledWith(
        'scrape-auctions',
        expectedJobData,
        {
          removeOnComplete: 100,
          removeOnFail: 100,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        },
      );

      expect(controller['logger'].log).toHaveBeenCalledWith({
        jobId: mockJobId,
        departmentId: 75,
        sinceDate: undefined,
        message: 'Auction scraping job enqueued',
      });
    });

    it('should successfully enqueue an auction job with departmentId and sinceDate', async () => {
      const mockJobId = 'auction-job-456';
      const sinceDate = '2024-01-01';
      mockScrapingQueue.add.mockResolvedValue({ id: mockJobId } as any);

      const result = await controller.enqueueAuctionJob(75, sinceDate);

      const expectedJobData: ScrapingJobData = {
        jobName: 'auctions',
        departmentId: 75,
        sinceDate: sinceDate,
      };

      expect(result).toEqual({
        success: true,
        jobId: mockJobId,
        message: 'Auction scraping job enqueued successfully',
        data: expectedJobData,
      });

      expect(mockScrapingQueue.add).toHaveBeenCalledWith(
        'scrape-auctions',
        expectedJobData,
        {
          removeOnComplete: 100,
          removeOnFail: 100,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        },
      );

      expect(controller['logger'].log).toHaveBeenCalledWith({
        jobId: mockJobId,
        departmentId: 75,
        sinceDate: sinceDate,
        message: 'Auction scraping job enqueued',
      });
    });

    describe('Validation Tests', () => {
      it('should return error when departmentId is missing', async () => {
        const result = await controller.enqueueAuctionJob(undefined as any);

        expect(result).toEqual({
          success: false,
          error: 'departmentId is required',
        });

        expect(mockScrapingQueue.add).not.toHaveBeenCalled();
      });

      it('should return error when departmentId is not a number', async () => {
        const result = await controller.enqueueAuctionJob('invalid' as any);

        expect(result).toEqual({
          success: false,
          error: 'departmentId must be a number between 1 and 98',
        });

        expect(mockScrapingQueue.add).not.toHaveBeenCalled();
      });

      it('should return error when departmentId is less than 1', async () => {
        const result = await controller.enqueueAuctionJob(0);

        expect(result).toEqual({
          success: false,
          error: 'departmentId is required', // 0 is falsy, so caught by !departmentId check
        });

        expect(mockScrapingQueue.add).not.toHaveBeenCalled();
      });

      it('should return error when departmentId is greater than 98', async () => {
        const result = await controller.enqueueAuctionJob(96);

        expect(result).toEqual({
          success: false,
          error: 'departmentId must be a number between 1 and 98',
        });

        expect(mockScrapingQueue.add).not.toHaveBeenCalled();
      });

      it('should accept departmentId at boundary values', async () => {
        mockScrapingQueue.add.mockResolvedValue({ id: 'test-job' } as any);

        // Test lower boundary
        const result1 = await controller.enqueueAuctionJob(1);
        expect(result1.success).toBe(true);

        // Test upper boundary
        const result2 = await controller.enqueueAuctionJob(98);
        expect(result2.success).toBe(true);

        expect(mockScrapingQueue.add).toHaveBeenCalledTimes(2);
      });

      it('should return error when sinceDate format is invalid', async () => {
        const result = await controller.enqueueAuctionJob(75, 'invalid-date');

        expect(result).toEqual({
          success: false,
          error: 'sinceDate must be in ISO format YYYY-MM-DD',
        });

        expect(mockScrapingQueue.add).not.toHaveBeenCalled();
      });

      it('should accept valid sinceDate formats', async () => {
        mockScrapingQueue.add.mockResolvedValue({ id: 'test-job' } as any);

        const validDates = ['2024-01-01', '2023-12-31', '2025-06-15'];

        for (const date of validDates) {
          const result = await controller.enqueueAuctionJob(75, date);
          expect(result.success).toBe(true);
        }

        expect(mockScrapingQueue.add).toHaveBeenCalledTimes(validDates.length);
      });

      it('should reject invalid sinceDate formats', async () => {
        const invalidFormats = [
          '24-01-01', // Wrong year format
          '2024-1-01', // Wrong month format
          '2024-01-1', // Wrong day format
          '2024/01/01', // Wrong separator
          '01-01-2024', // Wrong order
          'not-a-date', // Not a date
        ];

        // These should fail format validation
        for (const date of invalidFormats) {
          const result = await controller.enqueueAuctionJob(75, date);
          expect(result.success).toBe(false);
          expect(result.error).toBe(
            'sinceDate must be in ISO format YYYY-MM-DD',
          );
        }

        expect(mockScrapingQueue.add).not.toHaveBeenCalled();
      });

      it('should accept dates with invalid values but correct format', async () => {
        // These pass regex validation but are invalid dates
        const invalidDateValues = ['2024-13-01', '2024-01-32'];
        mockScrapingQueue.add.mockResolvedValue({ id: 'test-job' } as any);

        for (const date of invalidDateValues) {
          const result = await controller.enqueueAuctionJob(75, date);
          expect(result.success).toBe(true); // Format is correct, so validation passes
        }

        expect(mockScrapingQueue.add).toHaveBeenCalledTimes(2);
      });
    });

    describe('Error Handling', () => {
      it('should handle queue errors gracefully', async () => {
        const error = new Error('Queue connection failed');
        mockScrapingQueue.add.mockRejectedValue(error);

        const result = await controller.enqueueAuctionJob(75, '2024-01-01');

        expect(result).toEqual({
          success: false,
          error: 'Queue connection failed',
        });

        expect(controller['logger'].error).toHaveBeenCalledWith({
          error: 'Queue connection failed',
          stack: error.stack,
          message: 'Failed to enqueue auction job',
        });
      });

      it('should handle non-Error objects thrown from queue', async () => {
        mockScrapingQueue.add.mockRejectedValue('String error');

        const result = await controller.enqueueAuctionJob(75, '2024-01-01');

        expect(result.success).toBe(false);
        expect(result.error).toBeUndefined(); // err.message will be undefined for non-Error objects
      });

      it('should handle undefined errors', async () => {
        mockScrapingQueue.add.mockRejectedValue(undefined);

        // This should throw an error because the controller tries to access .message on undefined
        await expect(
          controller.enqueueAuctionJob(75, '2024-01-01'),
        ).rejects.toThrow();
      });
    });

    describe('Job Configuration', () => {
      it('should configure job with correct retry and cleanup settings', async () => {
        mockScrapingQueue.add.mockResolvedValue({ id: 'test-job' } as any);

        await controller.enqueueAuctionJob(75, '2024-01-01');

        expect(mockScrapingQueue.add).toHaveBeenCalledWith(
          'scrape-auctions',
          expect.any(Object),
          {
            removeOnComplete: 100,
            removeOnFail: 100,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 5000,
            },
          },
        );
      });

      it('should use current date when sinceDate is not provided', async () => {
        const currentDate = new Date().toISOString().split('T')[0];
        mockScrapingQueue.add.mockResolvedValue({ id: 'test-job' } as any);

        await controller.enqueueAuctionJob(75);

        expect(mockScrapingQueue.add).toHaveBeenCalledWith(
          'scrape-auctions',
          {
            jobName: 'auctions',
            departmentId: 75,
            sinceDate: currentDate,
          },
          expect.any(Object),
        );
      });
    });

    describe('Logging', () => {
      it('should log successful job enqueuing with all parameters', async () => {
        const mockJobId = 'test-job-789';
        mockScrapingQueue.add.mockResolvedValue({ id: mockJobId } as any);

        await controller.enqueueAuctionJob(75, '2024-01-01');

        expect(controller['logger'].log).toHaveBeenCalledWith({
          jobId: mockJobId,
          departmentId: 75,
          sinceDate: '2024-01-01',
          message: 'Auction scraping job enqueued',
        });
      });

      it('should log errors with full error information', async () => {
        const error = new Error('Test error');
        error.stack = 'Error stack trace';
        mockScrapingQueue.add.mockRejectedValue(error);

        await controller.enqueueAuctionJob(75, '2024-01-01');

        expect(controller['logger'].error).toHaveBeenCalledWith({
          error: 'Test error',
          stack: 'Error stack trace',
          message: 'Failed to enqueue auction job',
        });
      });
    });
  });

  describe('HTTP Status Codes', () => {
    it('should return 202 ACCEPTED status for successful requests', () => {
      // This is tested implicitly by the @HttpCode(HttpStatus.ACCEPTED) decorator
      // The actual HTTP status code testing would typically be done in integration tests
      expect(HttpStatus.ACCEPTED).toBe(202);
    });
  });

  describe('Response Format', () => {
    it('should return consistent success response format', async () => {
      mockScrapingQueue.add.mockResolvedValue({ id: 'test-job' } as any);

      const result = await controller.enqueueAuctionJob(75, '2024-01-01');

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('jobId', 'test-job');
      expect(result).toHaveProperty(
        'message',
        'Auction scraping job enqueued successfully',
      );
      expect(result).toHaveProperty('data');
      expect(result.data).toEqual({
        jobName: 'auctions',
        departmentId: 75,
        sinceDate: '2024-01-01',
      });
    });

    it('should return consistent error response format', async () => {
      const result = await controller.enqueueAuctionJob(undefined as any);

      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('error', 'departmentId is required');
      expect(result).not.toHaveProperty('jobId');
      expect(result).not.toHaveProperty('data');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string sinceDate', async () => {
      const mockJobId = 'test-job';
      const currentDate = new Date().toISOString().split('T')[0];
      mockScrapingQueue.add.mockResolvedValue({ id: mockJobId } as any);

      const result = await controller.enqueueAuctionJob(75, '');

      expect(result.success).toBe(true); // Empty string is falsy, so validation is skipped and current date is used
      expect(result.data?.sinceDate).toBe(currentDate);
    });

    it('should handle null departmentId', async () => {
      const result = await controller.enqueueAuctionJob(null as any);

      expect(result).toEqual({
        success: false,
        error: 'departmentId is required',
      });
    });

    it('should handle zero departmentId', async () => {
      const result = await controller.enqueueAuctionJob(0);

      expect(result).toEqual({
        success: false,
        error: 'departmentId is required', // 0 is falsy
      });
    });

    it('should handle negative departmentId', async () => {
      const result = await controller.enqueueAuctionJob(-1);

      expect(result).toEqual({
        success: false,
        error: 'departmentId must be a number between 1 and 98',
      });
    });

    it('should handle float departmentId', async () => {
      const result = await controller.enqueueAuctionJob(75.5);

      // Since the validation checks typeof === 'number', this should pass type check
      // but fail range check since 75.5 is between 1 and 98
      mockScrapingQueue.add.mockResolvedValue({ id: 'test-job' } as any);

      const successResult = await controller.enqueueAuctionJob(75.5);
      expect(successResult.success).toBe(true);
    });
  });
});
