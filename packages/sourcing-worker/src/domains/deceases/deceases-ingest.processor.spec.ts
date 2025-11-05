import { Test } from '@nestjs/testing';
import { Job, Queue } from 'bullmq';
import { getQueueToken } from '@nestjs/bullmq';

import { SOURCE_DECEASES_CSV_PROCESS_QUEUE } from '@linkinvests/shared';
import { S3Service } from '~/storage/s3.service';
import { DeceasesIngestProcessor } from './deceases-ingest.processor';
import {
  DeceasesIngestJobData,
  DeceasesCsvProcessJobData,
} from './types/deceases.types';

// Mock S3Service
const mockS3Service = {
  downloadFile: jest.fn(),
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
  generateFailingCompaniesKey: jest.fn(),
} as unknown as jest.Mocked<S3Service>;

// Mock Queue
const mockQueue = {
  add: jest.fn(),
} as unknown as jest.Mocked<Queue<DeceasesCsvProcessJobData>>;

describe('DeceasesIngestProcessor', () => {
  let processor: DeceasesIngestProcessor;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DeceasesIngestProcessor,
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
        {
          provide: getQueueToken(SOURCE_DECEASES_CSV_PROCESS_QUEUE),
          useValue: mockQueue,
        },
      ],
    }).compile();

    processor = module.get<DeceasesIngestProcessor>(DeceasesIngestProcessor);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('process', () => {
    it('should process manual S3 path successfully', async () => {
      const jobData: DeceasesIngestJobData = {
        s3Path: 's3://test-bucket/deceases/Deces_2025_M10.csv',
      };

      const mockJob = {
        id: 'test-job-123',
        data: jobData,
      } as Job<DeceasesIngestJobData>;

      // Mock S3 file exists check
      mockS3Service.downloadFile.mockResolvedValueOnce(Buffer.from('test'));

      // Mock queue add
      mockQueue.add.mockResolvedValueOnce({
        id: 'process-job-456',
      } as any);

      await processor.process(mockJob);

      // Verify S3 file existence check
      expect(mockS3Service.downloadFile).toHaveBeenCalledWith(
        's3://test-bucket/deceases/Deces_2025_M10.csv',
      );

      // Verify CSV processing job was enqueued
      expect(mockQueue.add).toHaveBeenCalledWith(
        'process-csv',
        {
          s3Path: 's3://test-bucket/deceases/Deces_2025_M10.csv',
          fileName: 'Deces_2025_M10.csv',
        },
        {
          removeOnComplete: 100,
          removeOnFail: 100,
        },
      );
    });

    it('should handle scheduled download request', async () => {
      const jobData: DeceasesIngestJobData = {
        year: 2025,
        month: 10,
      };

      const mockJob = {
        id: 'test-job-123',
        data: jobData,
      } as Job<DeceasesIngestJobData>;

      await expect(processor.process(mockJob)).rejects.toThrow(
        'Automatic download not yet implemented',
      );

      // Should not attempt to add to process queue since download failed
      expect(mockQueue.add).not.toHaveBeenCalled();
    });

    it('should throw error when neither s3Path nor year/month provided', async () => {
      const jobData: DeceasesIngestJobData = {};

      const mockJob = {
        id: 'test-job-123',
        data: jobData,
      } as Job<DeceasesIngestJobData>;

      await expect(processor.process(mockJob)).rejects.toThrow(
        'Either s3Path or (year, month) must be provided',
      );
    });

    it('should throw error when S3 file does not exist', async () => {
      const jobData: DeceasesIngestJobData = {
        s3Path: 's3://test-bucket/deceases/nonexistent.csv',
      };

      const mockJob = {
        id: 'test-job-123',
        data: jobData,
      } as Job<DeceasesIngestJobData>;

      // Mock S3 file does not exist
      mockS3Service.downloadFile.mockRejectedValueOnce(
        new Error('File not found'),
      );

      await expect(processor.process(mockJob)).rejects.toThrow(
        'File not found in S3: s3://test-bucket/deceases/nonexistent.csv',
      );

      expect(mockQueue.add).not.toHaveBeenCalled();
    });

    it('should extract filename correctly from S3 path', async () => {
      const jobData: DeceasesIngestJobData = {
        s3Path: 's3://test-bucket/path/to/file/Deces_2025_M10.csv',
      };

      const mockJob = {
        id: 'test-job-123',
        data: jobData,
      } as Job<DeceasesIngestJobData>;

      mockS3Service.downloadFile.mockResolvedValueOnce(Buffer.from('test'));
      mockQueue.add.mockResolvedValueOnce({ id: 'process-job-456' } as any);

      await processor.process(mockJob);

      expect(mockQueue.add).toHaveBeenCalledWith(
        'process-csv',
        {
          s3Path: 's3://test-bucket/path/to/file/Deces_2025_M10.csv',
          fileName: 'Deces_2025_M10.csv',
        },
        expect.any(Object),
      );
    });

    it('should handle malformed S3 path gracefully', async () => {
      const jobData: DeceasesIngestJobData = {
        s3Path: 'invalid-path',
      };

      const mockJob = {
        id: 'test-job-123',
        data: jobData,
      } as Job<DeceasesIngestJobData>;

      mockS3Service.downloadFile.mockResolvedValueOnce(Buffer.from('test'));
      mockQueue.add.mockResolvedValueOnce({ id: 'process-job-456' } as any);

      await processor.process(mockJob);

      expect(mockQueue.add).toHaveBeenCalledWith(
        'process-csv',
        {
          s3Path: 'invalid-path',
          fileName: 'unknown.csv', // Fallback filename
        },
        expect.any(Object),
      );
    });
  });

  describe('extractFileNameFromS3Path (private method)', () => {
    it('should extract filename from valid S3 path', async () => {
      const jobData: DeceasesIngestJobData = {
        s3Path: 's3://bucket/folder/subfolder/filename.csv',
      };

      const mockJob = {
        id: 'test-job-123',
        data: jobData,
      } as Job<DeceasesIngestJobData>;

      mockS3Service.downloadFile.mockResolvedValueOnce(Buffer.from('test'));
      mockQueue.add.mockResolvedValueOnce({ id: 'process-job-456' } as any);

      await processor.process(mockJob);

      expect(mockQueue.add).toHaveBeenCalledWith(
        'process-csv',
        expect.objectContaining({
          fileName: 'filename.csv',
        }),
        expect.any(Object),
      );
    });

    it('should handle S3 path without folders', async () => {
      const jobData: DeceasesIngestJobData = {
        s3Path: 's3://bucket/filename.csv',
      };

      const mockJob = {
        id: 'test-job-123',
        data: jobData,
      } as Job<DeceasesIngestJobData>;

      mockS3Service.downloadFile.mockResolvedValueOnce(Buffer.from('test'));
      mockQueue.add.mockResolvedValueOnce({ id: 'process-job-456' } as any);

      await processor.process(mockJob);

      expect(mockQueue.add).toHaveBeenCalledWith(
        'process-csv',
        expect.objectContaining({
          fileName: 'filename.csv',
        }),
        expect.any(Object),
      );
    });
  });
});
