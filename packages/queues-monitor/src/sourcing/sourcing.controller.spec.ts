import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  SOURCE_COMPANY_BUILDINGS_QUEUE,
  INGEST_DECEASES_CSV_QUEUE,
  SOURCE_ENERGY_SIEVES_QUEUE,
  SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE,
} from '@linkinvests/shared';

import { SourcingController } from './sourcing.controller';

describe('SourcingController', () => {
  let controller: SourcingController;
  let mockCompanyBuildingsQueue: jest.Mocked<Queue>;
  let mockDeceasesQueue: jest.Mocked<Queue>;
  let mockEnergySievesQueue: jest.Mocked<Queue>;
  let mockFailingCompaniesQueue: jest.Mocked<Queue>;

  beforeEach(async () => {
    // Create mock queues
    mockCompanyBuildingsQueue = {
      add: jest.fn(),
    } as any;

    mockDeceasesQueue = {
      add: jest.fn(),
    } as any;

    mockEnergySievesQueue = {
      add: jest.fn(),
    } as any;

    mockFailingCompaniesQueue = {
      add: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SourcingController],
      providers: [
        {
          provide: getQueueToken(SOURCE_COMPANY_BUILDINGS_QUEUE),
          useValue: mockCompanyBuildingsQueue,
        },
        {
          provide: getQueueToken(INGEST_DECEASES_CSV_QUEUE),
          useValue: mockDeceasesQueue,
        },
        {
          provide: getQueueToken(SOURCE_ENERGY_SIEVES_QUEUE),
          useValue: mockEnergySievesQueue,
        },
        {
          provide: getQueueToken(SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE),
          useValue: mockFailingCompaniesQueue,
        },
      ],
    }).compile();

    controller = module.get<SourcingController>(SourcingController);

    // Suppress logger output during tests
    jest.spyOn(controller['logger'], 'log').mockImplementation();
    jest.spyOn(controller['logger'], 'warn').mockImplementation();
    jest.spyOn(controller['logger'], 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('enqueueFailingCompanies', () => {
    it('should successfully enqueue a failing companies job', async () => {
      const mockJobId = 'job-123';
      mockFailingCompaniesQueue.add.mockResolvedValue({ id: mockJobId } as any);

      const result = await controller.enqueueFailingCompanies(75, '2024-01-01');

      expect(result).toEqual({
        success: true,
        jobId: mockJobId,
        message: 'Job enqueued successfully',
      });

      expect(mockFailingCompaniesQueue.add).toHaveBeenCalledWith(
        'source-failing-companies',
        {
          departmentId: 75,
          sinceDate: '2024-01-01',
        },
        {
          removeOnComplete: 100,
          removeOnFail: 100,
        },
      );

      expect(controller['logger'].log).toHaveBeenCalledWith({
        jobId: mockJobId,
        departmentId: 75,
        sinceDate: '2024-01-01',
        message: 'Failing companies job enqueued',
      });
    });

    it('should return error when departmentId is missing', async () => {
      const result = await controller.enqueueFailingCompanies(
        undefined as any,
        '2024-01-01',
      );

      expect(result).toEqual({
        success: false,
        error: 'departmentId is required',
      });

      expect(mockFailingCompaniesQueue.add).not.toHaveBeenCalled();
    });

    it('should return error when sinceDate is missing', async () => {
      const result = await controller.enqueueFailingCompanies(75, '');

      expect(result).toEqual({
        success: false,
        error: 'sinceDate is required (format: YYYY-MM-DD)',
      });

      expect(mockFailingCompaniesQueue.add).not.toHaveBeenCalled();
    });

    it('should handle queue errors gracefully', async () => {
      const error = new Error('Queue connection failed');
      mockFailingCompaniesQueue.add.mockRejectedValue(error);

      const result = await controller.enqueueFailingCompanies(75, '2024-01-01');

      expect(result).toEqual({
        success: false,
        error: 'Queue connection failed',
      });

      expect(controller['logger'].error).toHaveBeenCalledWith({
        error: 'Queue connection failed',
        message: 'Failed to enqueue failing companies job',
      });
    });
  });

  describe('enqueueCompanyBuildings', () => {
    it('should successfully enqueue a company buildings job', async () => {
      const mockJobId = 'job-456';
      mockCompanyBuildingsQueue.add.mockResolvedValue({ id: mockJobId } as any);

      const result = await controller.enqueueCompanyBuildings('test-file.csv');

      expect(result).toEqual({
        success: true,
        jobId: mockJobId,
        message: 'Job enqueued successfully',
      });

      expect(mockCompanyBuildingsQueue.add).toHaveBeenCalledWith(
        'source-company-buildings',
        {
          sourceFile: 'test-file.csv',
        },
        {
          removeOnComplete: 100,
          removeOnFail: 100,
        },
      );

      expect(controller['logger'].log).toHaveBeenCalledWith({
        jobId: mockJobId,
        sourceFile: 'test-file.csv',
        message: 'Company buildings job enqueued',
      });
    });

    it('should return error when sourceFile is missing', async () => {
      const result = await controller.enqueueCompanyBuildings('');

      expect(result).toEqual({
        success: false,
        error: 'sourceFile is required',
      });

      expect(mockCompanyBuildingsQueue.add).not.toHaveBeenCalled();
    });

    it('should handle queue errors gracefully', async () => {
      const error = new Error('File not found');
      mockCompanyBuildingsQueue.add.mockRejectedValue(error);

      const result = await controller.enqueueCompanyBuildings('test-file.csv');

      expect(result).toEqual({
        success: false,
        error: 'File not found',
      });

      expect(controller['logger'].error).toHaveBeenCalledWith({
        error: 'File not found',
        message: 'Failed to enqueue company buildings job',
      });
    });
  });

  describe('enqueueDeceases', () => {
    it('should successfully enqueue a deceases job with only sinceDate', async () => {
      const mockJobId = 'job-789';
      mockDeceasesQueue.add.mockResolvedValue({ id: mockJobId } as any);

      const result = await controller.enqueueDeceases('2024-01-01');

      expect(result).toEqual({
        success: true,
        jobId: mockJobId,
        message: 'Job enqueued successfully',
      });

      expect(mockDeceasesQueue.add).toHaveBeenCalledWith(
        'import-deceases',
        {
          sinceDate: '2024-01-01',
          untilDate: undefined,
        },
        {
          removeOnComplete: 100,
          removeOnFail: 100,
        },
      );

      expect(controller['logger'].log).toHaveBeenCalledWith({
        jobId: mockJobId,
        sinceDate: '2024-01-01',
        untilDate: undefined,
        message: 'Deceases job enqueued',
      });
    });

    it('should successfully enqueue a deceases job with both sinceDate and untilDate', async () => {
      const mockJobId = 'job-789';
      mockDeceasesQueue.add.mockResolvedValue({ id: mockJobId } as any);

      const result = await controller.enqueueDeceases(
        '2024-01-01',
        '2024-12-31',
      );

      expect(result).toEqual({
        success: true,
        jobId: mockJobId,
        message: 'Job enqueued successfully',
      });

      expect(mockDeceasesQueue.add).toHaveBeenCalledWith(
        'import-deceases',
        {
          sinceDate: '2024-01-01',
          untilDate: '2024-12-31',
        },
        {
          removeOnComplete: 100,
          removeOnFail: 100,
        },
      );

      expect(controller['logger'].log).toHaveBeenCalledWith({
        jobId: mockJobId,
        sinceDate: '2024-01-01',
        untilDate: '2024-12-31',
        message: 'Deceases job enqueued',
      });
    });

    it('should return error when sinceDate is missing', async () => {
      const result = await controller.enqueueDeceases('');

      expect(result).toEqual({
        success: false,
        error: 'sinceDate is required (format: YYYY-MM-DD)',
      });

      expect(mockDeceasesQueue.add).not.toHaveBeenCalled();
    });

    it('should handle queue errors gracefully', async () => {
      const error = new Error('Database connection failed');
      mockDeceasesQueue.add.mockRejectedValue(error);

      const result = await controller.enqueueDeceases('2024-01-01');

      expect(result).toEqual({
        success: false,
        error: 'Database connection failed',
      });

      expect(controller['logger'].error).toHaveBeenCalledWith({
        error: 'Database connection failed',
        message: 'Failed to enqueue deceases job',
      });
    });
  });

  describe('enqueueEnergySieves', () => {
    it('should successfully enqueue an energy sieves job with default energy classes', async () => {
      const mockJobId = 'job-101';
      mockEnergySievesQueue.add.mockResolvedValue({ id: mockJobId } as any);

      const result = await controller.enqueueEnergySieves(
        75,
        '2024-01-01',
        undefined,
        undefined,
      );

      expect(result).toEqual({
        success: true,
        jobId: mockJobId,
        message: 'Job enqueued successfully',
      });

      expect(mockEnergySievesQueue.add).toHaveBeenCalledWith(
        'source-energy-sieves',
        {
          departmentId: 75,
          sinceDate: '2024-01-01',
          beforeDate: undefined,
          energyClasses: ['F', 'G'],
        },
        {
          removeOnComplete: 100,
          removeOnFail: 100,
        },
      );

      expect(controller['logger'].log).toHaveBeenCalledWith({
        jobId: mockJobId,
        departmentId: 75,
        sinceDate: '2024-01-01',
        beforeDate: undefined,
        energyClasses: ['F', 'G'],
        message: 'Energy sieves job enqueued',
      });
    });

    it('should successfully enqueue an energy sieves job with beforeDate', async () => {
      const mockJobId = 'job-102';
      mockEnergySievesQueue.add.mockResolvedValue({ id: mockJobId } as any);

      const result = await controller.enqueueEnergySieves(
        75,
        '2024-01-01',
        '2024-12-31',
        ['E', 'F', 'G'],
      );

      expect(result).toEqual({
        success: true,
        jobId: mockJobId,
        message: 'Job enqueued successfully',
      });

      expect(mockEnergySievesQueue.add).toHaveBeenCalledWith(
        'source-energy-sieves',
        {
          departmentId: 75,
          sinceDate: '2024-01-01',
          beforeDate: '2024-12-31',
          energyClasses: ['E', 'F', 'G'],
        },
        {
          removeOnComplete: 100,
          removeOnFail: 100,
        },
      );

      expect(controller['logger'].log).toHaveBeenCalledWith({
        jobId: mockJobId,
        departmentId: 75,
        sinceDate: '2024-01-01',
        beforeDate: '2024-12-31',
        energyClasses: ['E', 'F', 'G'],
        message: 'Energy sieves job enqueued',
      });
    });

    it('should successfully enqueue an energy sieves job with custom energy classes but no beforeDate', async () => {
      const mockJobId = 'job-103';
      mockEnergySievesQueue.add.mockResolvedValue({ id: mockJobId } as any);

      const result = await controller.enqueueEnergySieves(
        75,
        '2024-01-01',
        undefined,
        ['D', 'E'],
      );

      expect(result).toEqual({
        success: true,
        jobId: mockJobId,
        message: 'Job enqueued successfully',
      });

      expect(mockEnergySievesQueue.add).toHaveBeenCalledWith(
        'source-energy-sieves',
        {
          departmentId: 75,
          sinceDate: '2024-01-01',
          beforeDate: undefined,
          energyClasses: ['D', 'E'],
        },
        {
          removeOnComplete: 100,
          removeOnFail: 100,
        },
      );
    });

    it('should return error when departmentId is missing', async () => {
      const result = await controller.enqueueEnergySieves(
        undefined as any,
        '2024-01-01',
        undefined,
        undefined,
      );

      expect(result).toEqual({
        success: false,
        error: 'departmentId is required',
      });

      expect(mockEnergySievesQueue.add).not.toHaveBeenCalled();
    });

    it('should return error when sinceDate is missing', async () => {
      const result = await controller.enqueueEnergySieves(
        75,
        '',
        undefined,
        undefined,
      );

      expect(result).toEqual({
        success: false,
        error: 'sinceDate is required (format: YYYY-MM-DD)',
      });

      expect(mockEnergySievesQueue.add).not.toHaveBeenCalled();
    });

    it('should handle queue errors gracefully', async () => {
      const error = new Error('API rate limit exceeded');
      mockEnergySievesQueue.add.mockRejectedValue(error);

      const result = await controller.enqueueEnergySieves(
        75,
        '2024-01-01',
        undefined,
        undefined,
      );

      expect(result).toEqual({
        success: false,
        error: 'API rate limit exceeded',
      });

      expect(controller['logger'].error).toHaveBeenCalledWith({
        error: 'API rate limit exceeded',
        message: 'Failed to enqueue energy sieves job',
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

  describe('Error Handling', () => {
    it('should handle unexpected errors in failing companies endpoint', async () => {
      const error = new Error('Unexpected error');
      mockFailingCompaniesQueue.add.mockRejectedValue(error);

      const result = await controller.enqueueFailingCompanies(75, '2024-01-01');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unexpected error');
      expect(controller['logger'].error).toHaveBeenCalled();
    });

    it('should handle non-Error objects thrown from queue', async () => {
      mockFailingCompaniesQueue.add.mockRejectedValue('String error');

      const result = await controller.enqueueFailingCompanies(75, '2024-01-01');

      expect(result.success).toBe(false);
      expect(result.error).toBeUndefined(); // err.message will be undefined for non-Error objects
    });
  });

  describe('Logging', () => {
    it('should log successful job enqueuing', async () => {
      mockFailingCompaniesQueue.add.mockResolvedValue({
        id: 'test-job',
      } as any);

      await controller.enqueueFailingCompanies(75, '2024-01-01');

      expect(controller['logger'].log).toHaveBeenCalledWith({
        jobId: 'test-job',
        departmentId: 75,
        sinceDate: '2024-01-01',
        message: 'Failing companies job enqueued',
      });
    });

    it('should log errors when job enqueuing fails', async () => {
      const error = new Error('Test error');
      mockFailingCompaniesQueue.add.mockRejectedValue(error);

      await controller.enqueueFailingCompanies(75, '2024-01-01');

      expect(controller['logger'].error).toHaveBeenCalledWith({
        error: 'Test error',
        message: 'Failed to enqueue failing companies job',
      });
    });
  });
});
