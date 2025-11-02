import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor() {
    const region = process.env.S3_REGION;
    const bucket = process.env.S3_BUCKET;
    const endpoint = process.env.S3_ENDPOINT;

    if (!region) {
      throw new Error('S3_REGION environment variable is not set');
    }

    if (!bucket) {
      throw new Error('S3_BUCKET environment variable is not set');
    }

    this.bucket = bucket;

    // Configure S3 client with optional LocalStack endpoint
    const s3Config = {
      region,
      endpoint,
      forcePathStyle: true, // Always use path-style for LocalStack compatibility
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      },
    };

    this.s3Client = new S3Client(s3Config);

    this.logger.log(`S3Service initialized with bucket: ${bucket}`);
  }

  /**
   * Upload a file buffer to S3
   * @param buffer - File content as Buffer
   * @param key - S3 object key (file path)
   * @returns S3 path in format: s3://bucket/key
   */
  async uploadFile(buffer: Buffer, key: string): Promise<string> {
    try {
      this.logger.log(`Uploading file to S3: ${key}`);

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: 'text/csv',
      });

      await this.s3Client.send(command);

      const s3Path = `s3://${this.bucket}/${key}`;
      this.logger.log(`File uploaded successfully: ${s3Path}`);

      return s3Path;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to upload file to S3`, {
        error: err,
        stack: err.stack,
        key,
      });
      throw error;
    }
  }

  /**
   * Download a file from S3
   * @param s3Path - S3 path in format: s3://bucket/key
   * @returns File content as Buffer
   */
  async downloadFile(s3Path: string): Promise<Buffer> {
    try {
      this.logger.log(`Downloading file from S3: ${s3Path}`);

      // Parse S3 path (format: s3://bucket/key)
      const match = s3Path.match(/^s3:\/\/([^/]+)\/(.+)$/);
      if (!match) {
        throw new Error(`Invalid S3 path format: ${s3Path}`);
      }

      const [, bucket, key] = match;

      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error('No data received from S3');
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      this.logger.log(
        `File downloaded successfully: ${buffer.length} bytes from ${s3Path}`,
      );

      return buffer;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to download file from S3`, {
        error: err,
        stack: err.stack,
        s3Path,
      });
      throw error;
    }
  }

  /**
   * Delete a file from S3
   * @param s3Path - S3 path in format: s3://bucket/key
   */
  async deleteFile(s3Path: string): Promise<void> {
    try {
      this.logger.log(`Deleting file from S3: ${s3Path}`);

      // Parse S3 path (format: s3://bucket/key)
      const match = s3Path.match(/^s3:\/\/([^/]+)\/(.+)$/);
      if (!match) {
        throw new Error(`Invalid S3 path format: ${s3Path}`);
      }

      const [, bucket, key] = match;

      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await this.s3Client.send(command);

      this.logger.log(`File deleted successfully: ${s3Path}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to delete file from S3`, {
        error: err,
        stack: err.stack,
        s3Path,
      });
      throw error;
    }
  }

  /**
   * Generate a unique S3 key for a failing companies CSV file
   * @param departmentId - Department number
   * @param date - Date string for the file
   */
  generateFailingCompaniesKey(departmentId: number, date: string): string {
    return `failing-companies/dept-${departmentId}/${date}.csv`;
  }
}
