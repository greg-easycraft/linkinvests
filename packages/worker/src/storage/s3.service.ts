import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { CONFIG_TOKEN, type ConfigType } from '~/config';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor(@Inject(CONFIG_TOKEN) config: ConfigType) {
    const region = config.S3_REGION;
    const bucket = config.S3_BUCKET;
    const endpoint = config.S3_ENDPOINT_URL;

    this.bucket = bucket;

    // Configure S3 client with optional LocalStack endpoint
    const s3Config = {
      region,
      endpoint,
      forcePathStyle: true, // Always use path-style for LocalStack compatibility
      credentials: {
        accessKeyId: config.S3_ACCESS_KEY_ID || '',
        secretAccessKey: config.S3_SECRET_ACCESS_KEY || '',
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
        `File downloaded successfully: ${buffer.length} bytes from ${s3Path}`
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
   * Move a file from one S3 path to another
   * @param sourcePath - Source S3 path in format: s3://bucket/key
   * @param destinationPath - Destination S3 path in format: s3://bucket/key
   */
  async moveFile(sourceKey: string, destinationKey: string): Promise<void> {
    try {
      this.logger.log(`Moving file from ${sourceKey} to ${destinationKey}`);

      // Step 1: Copy the object to the new location
      const copyCommand = new CopyObjectCommand({
        Bucket: this.bucket,
        Key: destinationKey,
        CopySource: `${this.bucket}/${sourceKey}`,
      });

      await this.s3Client.send(copyCommand);
      this.logger.log(`File copied successfully to: ${destinationKey}`);

      // Step 2: Delete the original object
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: sourceKey,
      });

      await this.s3Client.send(deleteCommand);
      this.logger.log(`Original file deleted successfully: ${sourceKey}`);

      this.logger.log(
        `File moved successfully from ${sourceKey} to ${destinationKey}`
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to move file from ${sourceKey} to ${destinationKey}`,
        {
          error: err,
          stack: err.stack,
          sourceKey,
          destinationKey,
        }
      );
      throw error;
    }
  }

  /**
   * Generate a unique S3 key for a failing companies CSV file
   * @param departmentId - Department number
   * @param date - Date string for the file
   */
  generateFailingCompaniesKey(departmentId: string, date: string): string {
    return `failing-companies/dept-${departmentId}/${date}.csv`;
  }
}
