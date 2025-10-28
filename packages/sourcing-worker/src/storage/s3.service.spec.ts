import { S3Service } from './s3.service';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';
import { Readable } from 'stream';

const s3Mock = mockClient(S3Client);

describe('S3Service', () => {
  let service: S3Service;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      AWS_REGION: 'us-east-1',
      AWS_S3_BUCKET: 'test-bucket',
      AWS_ACCESS_KEY_ID: 'test-key',
      AWS_SECRET_ACCESS_KEY: 'test-secret',
    };

    s3Mock.reset();
    service = new S3Service();

    // Suppress logger output during tests
    jest.spyOn(service['logger'], 'log').mockImplementation();
    jest.spyOn(service['logger'], 'error').mockImplementation();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should throw error if AWS_REGION is not set', () => {
      delete process.env.AWS_REGION;

      expect(() => new S3Service()).toThrow(
        'AWS_REGION environment variable is not set',
      );
    });

    it('should throw error if AWS_S3_BUCKET is not set', () => {
      delete process.env.AWS_S3_BUCKET;

      expect(() => new S3Service()).toThrow(
        'AWS_S3_BUCKET environment variable is not set',
      );
    });

    it('should initialize with correct configuration', () => {
      const service = new S3Service();

      expect(service).toBeDefined();
      expect(service['bucket']).toBe('test-bucket');
    });
  });

  describe('uploadFile', () => {
    it('should successfully upload file to S3', async () => {
      const buffer = Buffer.from('test content');
      const key = 'test-folder/test-file.csv';

      s3Mock.on(PutObjectCommand).resolves({});

      const result = await service.uploadFile(buffer, key);

      expect(result).toBe('s3://test-bucket/test-folder/test-file.csv');
      expect(s3Mock).toHaveReceivedCommandWith(PutObjectCommand, {
        Bucket: 'test-bucket',
        Key: key,
        Body: buffer,
        ContentType: 'text/csv',
      });
    });

    it('should throw error on upload failure', async () => {
      const buffer = Buffer.from('test content');
      const key = 'test-file.csv';

      s3Mock.on(PutObjectCommand).rejects(new Error('S3 upload error'));

      await expect(service.uploadFile(buffer, key)).rejects.toThrow(
        'S3 upload error',
      );
      expect(service['logger'].error).toHaveBeenCalled();
    });
  });

  describe('downloadFile', () => {
    it('should successfully download file from S3', async () => {
      const mockData = Buffer.from('test content');
      const mockStream = Readable.from([mockData]);

      s3Mock.on(GetObjectCommand).resolves({
        Body: mockStream as any,
      });

      const result = await service.downloadFile('s3://test-bucket/test-file.csv');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString()).toBe('test content');
      expect(s3Mock).toHaveReceivedCommandWith(GetObjectCommand, {
        Bucket: 'test-bucket',
        Key: 'test-file.csv',
      });
    });

    it('should throw error for invalid S3 path format', async () => {
      await expect(service.downloadFile('invalid-path')).rejects.toThrow(
        'Invalid S3 path format: invalid-path',
      );
    });

    it('should throw error when no data received from S3', async () => {
      s3Mock.on(GetObjectCommand).resolves({
        Body: undefined,
      });

      await expect(
        service.downloadFile('s3://test-bucket/test-file.csv'),
      ).rejects.toThrow('No data received from S3');
    });

    it('should throw error on download failure', async () => {
      s3Mock.on(GetObjectCommand).rejects(new Error('S3 download error'));

      await expect(
        service.downloadFile('s3://test-bucket/test-file.csv'),
      ).rejects.toThrow('S3 download error');
      expect(service['logger'].error).toHaveBeenCalled();
    });
  });

  describe('deleteFile', () => {
    it('should successfully delete file from S3', async () => {
      s3Mock.on(DeleteObjectCommand).resolves({});

      await service.deleteFile('s3://test-bucket/test-file.csv');

      expect(s3Mock).toHaveReceivedCommandWith(DeleteObjectCommand, {
        Bucket: 'test-bucket',
        Key: 'test-file.csv',
      });
    });

    it('should throw error for invalid S3 path format', async () => {
      await expect(service.deleteFile('invalid-path')).rejects.toThrow(
        'Invalid S3 path format: invalid-path',
      );
    });

    it('should throw error on delete failure', async () => {
      s3Mock.on(DeleteObjectCommand).rejects(new Error('S3 delete error'));

      await expect(
        service.deleteFile('s3://test-bucket/test-file.csv'),
      ).rejects.toThrow('S3 delete error');
      expect(service['logger'].error).toHaveBeenCalled();
    });
  });

  describe('generateFailingCompaniesKey', () => {
    it('should generate correct S3 key', () => {
      const key = service.generateFailingCompaniesKey(75, '2024-01-01');

      expect(key).toBe('failing-companies/dept-75/2024-01-01.csv');
    });

    it('should handle different department IDs', () => {
      const key1 = service.generateFailingCompaniesKey(1, '2024-01-01');
      const key2 = service.generateFailingCompaniesKey(93, '2024-06-15');

      expect(key1).toBe('failing-companies/dept-1/2024-01-01.csv');
      expect(key2).toBe('failing-companies/dept-93/2024-06-15.csv');
    });
  });
});
