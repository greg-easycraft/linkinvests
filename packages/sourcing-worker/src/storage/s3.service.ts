import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor() {
    const region = process.env.AWS_REGION;
    const bucket = process.env.AWS_S3_BUCKET;
    const endpoint = process.env.AWS_ENDPOINT;

    if (!region) {
      throw new Error('AWS_REGION environment variable is not set');
    }

    if (!bucket) {
      throw new Error('AWS_S3_BUCKET environment variable is not set');
    }

    this.bucket = bucket;

    // Configure S3 client with optional LocalStack endpoint
    const s3Config = {
      region,
      endpoint,
      forcePathStyle: process.env.NODE_ENV === 'development' ? true : false,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
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
   * Generate a unique S3 key for a failing companies CSV file
   * @param departmentId - Department number
   * @param date - Date string for the file
   */
  generateFailingCompaniesKey(departmentId: number, date: string): string {
    return `failing-companies/dept-${departmentId}/${date}.csv`;
  }
}
