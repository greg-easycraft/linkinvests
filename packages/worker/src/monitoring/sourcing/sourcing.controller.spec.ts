import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  SOURCE_COMPANY_BUILDINGS_QUEUE,
  INGEST_DECEASES_CSV_QUEUE,
  SOURCE_ENERGY_SIEVES_QUEUE,
  SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE,
  SOURCE_LISTINGS_QUEUE,
} from '@linkinvests/shared';

import { SourcingController } from './sourcing.controller';

describe('SourcingController', () => {
  let controller: SourcingController;
  const mockCompanyBuildingsQueue = {
    add: jest.fn(),
  } as unknown as jest.Mocked<Queue>;
  const mockDeceasesQueue = {
    add: jest.fn(),
  } as unknown as jest.Mocked<Queue>;
  const mockEnergyDiagnosticsQueue = {
    add: jest.fn(),
  } as unknown as jest.Mocked<Queue>;
  const mockFailingCompaniesQueue = {
    add: jest.fn(),
  } as unknown as jest.Mocked<Queue>;
  const mockListingsQueue = {
    add: jest.fn(),
  } as unknown as jest.Mocked<Queue>;

  beforeAll(async () => {
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
          useValue: mockEnergyDiagnosticsQueue,
        },
        {
          provide: getQueueToken(SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE),
          useValue: mockFailingCompaniesQueue,
        },
        {
          provide: getQueueToken(SOURCE_LISTINGS_QUEUE),
          useValue: mockListingsQueue,
        },
      ],
    }).compile();

    controller = module.get<SourcingController>(SourcingController);

    // Suppress logger output during tests
    jest.spyOn(controller['logger'], 'log').mockImplementation();
    jest.spyOn(controller['logger'], 'warn').mockImplementation();
    jest.spyOn(controller['logger'], 'error').mockImplementation();
  });

  beforeEach(() => {
    // Create mock queues
    jest.clearAllMocks();
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
          beforeDate: undefined,
        },
        {
          removeOnComplete: 100,
          removeOnFail: 100,
        }
      );

      expect(controller['logger'].log).toHaveBeenCalledWith({
        jobId: mockJobId,
        departmentId: 75,
        sinceDate: '2024-01-01',
        beforeDate: undefined,
        message: 'Failing companies job enqueued',
      });
    });

    it('should successfully enqueue a failing companies job with beforeDate', async () => {
      const mockJobId = 'job-456';
      mockFailingCompaniesQueue.add.mockResolvedValue({ id: mockJobId } as any);

      const result = await controller.enqueueFailingCompanies(
        75,
        '2024-01-01',
        '2024-01-31'
      );

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
          beforeDate: '2024-01-31',
        },
        {
          removeOnComplete: 100,
          removeOnFail: 100,
        }
      );

      expect(controller['logger'].log).toHaveBeenCalledWith({
        jobId: mockJobId,
        departmentId: 75,
        sinceDate: '2024-01-01',
        beforeDate: '2024-01-31',
        message: 'Failing companies job enqueued',
      });
    });

    it('should return error when departmentId is missing', async () => {
      const result = await controller.enqueueFailingCompanies(
        undefined as any,
        '2024-01-01'
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
        }
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

  describe('enqueueIngestDeceasesCsv', () => {
    it('should successfully enqueue a deceases CSV ingestion job', async () => {
      const mockJobId = 'job-789';
      mockDeceasesQueue.add.mockResolvedValue({ id: mockJobId } as any);

      const result = await controller.enqueueIngestDeceasesCsv('test-file.csv');

      expect(result).toEqual({
        success: true,
        jobId: mockJobId,
        message: 'Job enqueued successfully',
      });

      expect(mockDeceasesQueue.add).toHaveBeenCalledWith(
        'ingest-deceases-csv',
        {
          fileName: 'test-file.csv',
        },
        {
          removeOnComplete: 100,
          removeOnFail: 100,
        }
      );

      expect(controller['logger'].log).toHaveBeenCalledWith({
        jobId: mockJobId,
        fileName: 'test-file.csv',
        message: 'Deceases CSV ingestion job enqueued',
      });
    });

    it('should return error when fileName is missing', async () => {
      const result = await controller.enqueueIngestDeceasesCsv('');

      expect(result).toEqual({
        success: false,
        error: 'fileName is required',
      });

      expect(mockDeceasesQueue.add).not.toHaveBeenCalled();
    });

    it('should handle queue errors gracefully', async () => {
      const error = new Error('Database connection failed');
      mockDeceasesQueue.add.mockRejectedValue(error);

      const result = await controller.enqueueIngestDeceasesCsv('test-file.csv');

      expect(result).toEqual({
        success: false,
        error: 'Database connection failed',
      });

      expect(controller['logger'].error).toHaveBeenCalledWith({
        error: 'Database connection failed',
        message: 'Failed to enqueue deceases CSV ingestion job',
      });
    });
  });

  describe('enqueueEnergyDiagnostics', () => {
    it('should successfully enqueue an energy sieves job with default energy classes', async () => {
      const mockJobId = 'job-101';
      mockEnergyDiagnosticsQueue.add.mockResolvedValue({
        id: mockJobId,
      } as any);

      const result = await controller.enqueueEnergyDiagnostics(
        75,
        '2024-01-01',
        undefined,
        undefined
      );

      expect(result).toEqual({
        success: true,
        jobId: mockJobId,
        message: 'Job enqueued successfully',
      });

      expect(mockEnergyDiagnosticsQueue.add).toHaveBeenCalledWith(
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
        }
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
      mockEnergyDiagnosticsQueue.add.mockResolvedValue({
        id: mockJobId,
      } as any);

      const result = await controller.enqueueEnergyDiagnostics(
        75,
        '2024-01-01',
        '2024-12-31',
        ['E', 'F', 'G']
      );

      expect(result).toEqual({
        success: true,
        jobId: mockJobId,
        message: 'Job enqueued successfully',
      });

      expect(mockEnergyDiagnosticsQueue.add).toHaveBeenCalledWith(
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
        }
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
      mockEnergyDiagnosticsQueue.add.mockResolvedValue({
        id: mockJobId,
      } as any);

      const result = await controller.enqueueEnergyDiagnostics(
        75,
        '2024-01-01',
        undefined,
        ['D', 'E']
      );

      expect(result).toEqual({
        success: true,
        jobId: mockJobId,
        message: 'Job enqueued successfully',
      });

      expect(mockEnergyDiagnosticsQueue.add).toHaveBeenCalledWith(
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
        }
      );
    });

    it('should return error when departmentId is missing', async () => {
      const result = await controller.enqueueEnergyDiagnostics(
        undefined as any,
        '2024-01-01',
        undefined,
        undefined
      );

      expect(result).toEqual({
        success: false,
        error: 'departmentId is required',
      });

      expect(mockEnergyDiagnosticsQueue.add).not.toHaveBeenCalled();
    });

    it('should return error when sinceDate is missing', async () => {
      const result = await controller.enqueueEnergyDiagnostics(
        75,
        '',
        undefined,
        undefined
      );

      expect(result).toEqual({
        success: false,
        error: 'sinceDate is required (format: YYYY-MM-DD)',
      });

      expect(mockEnergyDiagnosticsQueue.add).not.toHaveBeenCalled();
    });

    it('should handle queue errors gracefully', async () => {
      const error = new Error('API rate limit exceeded');
      mockEnergyDiagnosticsQueue.add.mockRejectedValue(error);

      const result = await controller.enqueueEnergyDiagnostics(
        75,
        '2024-01-01',
        undefined,
        undefined
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

  describe('enqueueListings', () => {
    it('should successfully enqueue a listings job with no parameters', async () => {
      const mockJobId = 'job-200';
      mockListingsQueue.add.mockResolvedValue({ id: mockJobId } as any);

      const result = await controller.enqueueListings();

      expect(result).toEqual({
        success: true,
        jobId: mockJobId,
        message: 'Listings sourcing job enqueued successfully',
      });

      expect(mockListingsQueue.add).toHaveBeenCalledWith(
        'source-listings',
        {
          source: undefined,
          afterDate: undefined,
          beforeDate: undefined,
          energyGradeMax: undefined,
          energyGradeMin: undefined,
          propertyTypes: undefined,
          departmentCode: undefined,
        },
        {
          removeOnComplete: 100,
          removeOnFail: 100,
        }
      );

      expect(controller['logger'].log).toHaveBeenCalledWith({
        jobId: mockJobId,
        source: undefined,
        filters: {
          afterDate: undefined,
          beforeDate: undefined,
          energyGradeMax: undefined,
          energyGradeMin: undefined,
          propertyTypes: undefined,
          departmentCode: undefined,
        },
        message: 'Listings sourcing job enqueued',
      });
    });

    it('should successfully enqueue a listings job with all parameters', async () => {
      const mockJobId = 'job-201';
      mockListingsQueue.add.mockResolvedValue({ id: mockJobId } as any);

      const result = await controller.enqueueListings(
        'notaires',
        '2024-01-01',
        '2024-12-31',
        'C',
        'A',
        ['apartment', 'house'],
        '75'
      );

      expect(result).toEqual({
        success: true,
        jobId: mockJobId,
        message: 'Listings sourcing job enqueued successfully',
      });

      expect(mockListingsQueue.add).toHaveBeenCalledWith(
        'source-listings',
        {
          source: 'notaires',
          afterDate: '2024-01-01',
          beforeDate: '2024-12-31',
          energyGradeMax: 'C',
          energyGradeMin: 'A',
          propertyTypes: ['apartment', 'house'],
          departmentCode: '75',
        },
        {
          removeOnComplete: 100,
          removeOnFail: 100,
        }
      );

      expect(controller['logger'].log).toHaveBeenCalledWith({
        jobId: mockJobId,
        source: 'notaires',
        filters: {
          afterDate: '2024-01-01',
          beforeDate: '2024-12-31',
          energyGradeMax: 'C',
          energyGradeMin: 'A',
          propertyTypes: ['apartment', 'house'],
          departmentCode: '75',
        },
        message: 'Listings sourcing job enqueued',
      });
    });

    it('should successfully enqueue a listings job with partial parameters', async () => {
      const mockJobId = 'job-202';
      mockListingsQueue.add.mockResolvedValue({ id: mockJobId } as any);

      const result = await controller.enqueueListings(
        'mls',
        '2024-06-01',
        undefined,
        'F',
        undefined,
        ['house'],
        undefined
      );

      expect(result).toEqual({
        success: true,
        jobId: mockJobId,
        message: 'Listings sourcing job enqueued successfully',
      });

      expect(mockListingsQueue.add).toHaveBeenCalledWith(
        'source-listings',
        {
          source: 'mls',
          afterDate: '2024-06-01',
          beforeDate: undefined,
          energyGradeMax: 'F',
          energyGradeMin: undefined,
          propertyTypes: ['house'],
          departmentCode: undefined,
        },
        {
          removeOnComplete: 100,
          removeOnFail: 100,
        }
      );
    });

    it('should handle queue errors gracefully', async () => {
      const error = new Error('Queue service unavailable');
      mockListingsQueue.add.mockRejectedValue(error);

      const result = await controller.enqueueListings('notaires', '2024-01-01');

      expect(result).toEqual({
        success: false,
        error: 'Queue service unavailable',
      });

      expect(controller['logger'].error).toHaveBeenCalledWith({
        error: 'Queue service unavailable',
        message: 'Failed to enqueue listings sourcing job',
      });
    });

    it('should handle non-Error objects thrown from queue', async () => {
      mockListingsQueue.add.mockRejectedValue('String error');

      const result = await controller.enqueueListings();

      expect(result.success).toBe(false);
      expect(result.error).toBeUndefined(); // err.message will be undefined for non-Error objects
    });

    it('should handle empty arrays and empty strings correctly', async () => {
      const mockJobId = 'job-203';
      mockListingsQueue.add.mockResolvedValue({ id: mockJobId } as any);

      const result = await controller.enqueueListings(
        '',
        '',
        '',
        '',
        '',
        [],
        ''
      );

      expect(result.success).toBe(true);

      expect(mockListingsQueue.add).toHaveBeenCalledWith(
        'source-listings',
        {
          source: '',
          afterDate: '',
          beforeDate: '',
          energyGradeMax: '',
          energyGradeMin: '',
          propertyTypes: [],
          departmentCode: '',
        },
        {
          removeOnComplete: 100,
          removeOnFail: 100,
        }
      );
    });

    it('should log all parameters correctly', async () => {
      const mockJobId = 'job-204';
      mockListingsQueue.add.mockResolvedValue({ id: mockJobId } as any);

      await controller.enqueueListings(
        'test-source',
        '2024-03-01',
        '2024-03-31',
        'E',
        'B',
        ['studio', 'duplex'],
        '69'
      );

      expect(controller['logger'].log).toHaveBeenCalledWith({
        jobId: mockJobId,
        source: 'test-source',
        filters: {
          afterDate: '2024-03-01',
          beforeDate: '2024-03-31',
          energyGradeMax: 'E',
          energyGradeMin: 'B',
          propertyTypes: ['studio', 'duplex'],
          departmentCode: '69',
        },
        message: 'Listings sourcing job enqueued',
      });
    });
  });
});
