import { Test, TestingModule } from '@nestjs/testing';
import { FailingCompaniesProcessor } from './failing-companies.processor';
import { S3Service } from '~/storage';
import { Queue } from 'bullmq';
import { getQueueToken } from '@nestjs/bullmq';
import { SOURCE_COMPANY_BUILDINGS_QUEUE } from '@linkinvest/shared';
import * as undici from 'undici';

// Mock undici.request at module level
jest.mock('undici', () => ({
  request: jest.fn(),
}));

describe('FailingCompaniesProcessor', () => {
  let processor: FailingCompaniesProcessor;
  let mockS3Service: jest.Mocked<S3Service>;
  let mockCompanyBuildingsQueue: jest.Mocked<Queue>;

  beforeEach(async () => {
    mockS3Service = {
      uploadFile: jest.fn(),
      generateFailingCompaniesKey: jest.fn(),
      downloadFile: jest.fn(),
      deleteFile: jest.fn(),
    } as any;

    mockCompanyBuildingsQueue = {
      add: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FailingCompaniesProcessor,
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
        {
          provide: getQueueToken(SOURCE_COMPANY_BUILDINGS_QUEUE),
          useValue: mockCompanyBuildingsQueue,
        },
      ],
    }).compile();

    processor = module.get<FailingCompaniesProcessor>(
      FailingCompaniesProcessor,
    );

    // Suppress logger output during tests
    jest.spyOn(processor['logger'], 'log').mockImplementation();
    jest.spyOn(processor['logger'], 'warn').mockImplementation();
    jest.spyOn(processor['logger'], 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('buildApiUrl', () => {
    it('should construct correct OpenDatasoft URL with filters', () => {
      const url = processor['buildApiUrl'](75, '2024-01-01');

      expect(url).toContain(
        'https://bodacc-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/annonces-commerciales/exports/csv',
      );
      expect(url).toContain('where=');
      expect(url).toContain('familleavis%3A%22collective%22');
      expect(url).toContain('numerodepartement%3A75');
      expect(url).toContain('dateparution%3E%3D%222024-01-01%22');
    });

    it('should use limit=-1 to get all records', () => {
      const url = processor['buildApiUrl'](75, '2024-01-01');

      expect(url).toContain('limit=-1');
    });

    it('should encode department and date in where clause', () => {
      const url = processor['buildApiUrl'](93, '2024-06-15');

      expect(url).toContain('numerodepartement%3A93');
      expect(url).toContain('dateparution%3E%3D%222024-06-15%22');
    });

    it('should select correct CSV columns', () => {
      const url = processor['buildApiUrl'](75, '2024-01-01');

      expect(url).toContain('select=');
      expect(url).toContain('numerodepartement');
      expect(url).toContain('departement_nom_officiel');
      expect(url).toContain('familleavis_lib');
      expect(url).toContain('typeavis_lib');
      expect(url).toContain('dateparution');
      expect(url).toContain('commercant');
      expect(url).toContain('ville');
      expect(url).toContain('cp');
      expect(url).toContain('listepersonnes');
      expect(url).toContain('jugement');
    });
  });

  describe('fetchCsvData', () => {
    const mockRequest = undici.request as jest.MockedFunction<
      typeof undici.request
    >;

    it('should successfully fetch CSV from API (returns Buffer)', async () => {
      const csvData = 'test,csv,data';
      const buffer = Buffer.from(csvData);
      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength,
      );

      mockRequest.mockResolvedValue({
        statusCode: 200,
        body: {
          arrayBuffer: jest.fn().mockResolvedValue(arrayBuffer),
        },
      } as any);

      const result = await processor['fetchCsvData'](
        'https://example.com/test',
      );

      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString()).toBe(csvData);
      expect(mockRequest).toHaveBeenCalledWith('https://example.com/test', {
        method: 'GET',
        headersTimeout: 60000,
      });
    });

    it('should throw error on non-200 status', async () => {
      mockRequest.mockResolvedValue({
        statusCode: 404,
        body: {
          arrayBuffer: jest.fn(),
        },
      } as any);

      await expect(
        processor['fetchCsvData']('https://example.com/test'),
      ).rejects.toThrow('Failed to fetch data from API. Status: 404');
    });

    it('should handle network errors', async () => {
      mockRequest.mockRejectedValue(new Error('Network error'));

      await expect(
        processor['fetchCsvData']('https://example.com/test'),
      ).rejects.toThrow('Network error');

      expect(processor['logger'].error).toHaveBeenCalled();
    });
  });

  describe('process', () => {
    const mockJob = {
      data: {
        departmentId: 75,
        sinceDate: '2024-01-01',
      },
    } as any;

    const mockRequest = undici.request as jest.MockedFunction<
      typeof undici.request
    >;

    it('should orchestrate full flow: fetch → upload to S3 → enqueue job', async () => {
      const csvData = 'test,csv,data';
      const buffer = Buffer.from(csvData);
      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength,
      );

      mockRequest.mockResolvedValue({
        statusCode: 200,
        body: {
          arrayBuffer: jest.fn().mockResolvedValue(arrayBuffer),
        },
      } as any);

      mockS3Service.generateFailingCompaniesKey.mockReturnValue(
        'failing-companies/75/2024-01-01.csv',
      );
      mockS3Service.uploadFile.mockResolvedValue(
        's3://bucket/failing-companies/75/2024-01-01.csv',
      );
      mockCompanyBuildingsQueue.add.mockResolvedValue({
        id: 'job-123',
      } as any);

      await processor.process(mockJob);

      // Verify API URL construction
      expect(mockRequest).toHaveBeenCalledWith(
        expect.stringContaining('numerodepartement%3A75'),
        expect.any(Object),
      );

      // Verify S3 key generation
      expect(mockS3Service.generateFailingCompaniesKey).toHaveBeenCalledWith(
        75,
        '2024-01-01',
      );

      // Verify S3 upload
      expect(mockS3Service.uploadFile).toHaveBeenCalledWith(
        expect.any(Buffer),
        'failing-companies/75/2024-01-01.csv',
      );

      // Verify queue enqueue
      expect(mockCompanyBuildingsQueue.add).toHaveBeenCalledWith(
        'source-company-buildings',
        { sourceFile: 's3://bucket/failing-companies/75/2024-01-01.csv' },
        {
          removeOnComplete: 100,
          removeOnFail: 100,
        },
      );
    });

    it('should call S3Service.generateFailingCompaniesKey() with correct params', async () => {
      const csvData = 'test,csv,data';
      const buffer = Buffer.from(csvData);
      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength,
      );

      mockRequest.mockResolvedValue({
        statusCode: 200,
        body: {
          arrayBuffer: jest.fn().mockResolvedValue(arrayBuffer),
        },
      } as any);

      mockS3Service.generateFailingCompaniesKey.mockReturnValue(
        'failing-companies/93/2024-06-15.csv',
      );
      mockS3Service.uploadFile.mockResolvedValue(
        's3://bucket/failing-companies/93/2024-06-15.csv',
      );
      mockCompanyBuildingsQueue.add.mockResolvedValue({
        id: 'job-456',
      } as any);

      await processor.process({
        data: { departmentId: 93, sinceDate: '2024-06-15' },
      } as any);

      expect(mockS3Service.generateFailingCompaniesKey).toHaveBeenCalledWith(
        93,
        '2024-06-15',
      );
    });

    it('should enqueue company-buildings job with correct S3 path', async () => {
      const csvData = 'test,csv,data';
      const buffer = Buffer.from(csvData);
      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength,
      );

      mockRequest.mockResolvedValue({
        statusCode: 200,
        body: {
          arrayBuffer: jest.fn().mockResolvedValue(arrayBuffer),
        },
      } as any);

      mockS3Service.generateFailingCompaniesKey.mockReturnValue(
        'failing-companies/75/2024-01-01.csv',
      );
      mockS3Service.uploadFile.mockResolvedValue(
        's3://my-bucket/failing-companies/75/2024-01-01.csv',
      );
      mockCompanyBuildingsQueue.add.mockResolvedValue({
        id: 'job-789',
      } as any);

      await processor.process(mockJob);

      expect(mockCompanyBuildingsQueue.add).toHaveBeenCalledWith(
        'source-company-buildings',
        {
          sourceFile: 's3://my-bucket/failing-companies/75/2024-01-01.csv',
        },
        expect.any(Object),
      );
    });

    it('should log error and rethrow on failure', async () => {
      mockRequest.mockRejectedValue(new Error('API error'));

      await expect(processor.process(mockJob)).rejects.toThrow('API error');
      expect(processor['logger'].error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to process failing companies'),
        expect.any(String),
      );
    });
  });
});
