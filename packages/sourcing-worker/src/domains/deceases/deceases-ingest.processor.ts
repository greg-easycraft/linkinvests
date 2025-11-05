import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import {
  SOURCE_DECEASES_CSV_INGEST_QUEUE,
  SOURCE_DECEASES_CSV_PROCESS_QUEUE,
} from '@linkinvests/shared';

import { S3Service } from '~/storage/s3.service';
import {
  DeceasesIngestJobData,
  DeceasesCsvProcessJobData,
} from './types/deceases.types';

@Injectable()
@Processor(SOURCE_DECEASES_CSV_INGEST_QUEUE)
export class DeceasesIngestProcessor extends WorkerHost {
  private readonly logger = new Logger(DeceasesIngestProcessor.name);

  constructor(
    private readonly s3Service: S3Service,
    @InjectQueue(SOURCE_DECEASES_CSV_PROCESS_QUEUE)
    private readonly csvProcessQueue: Queue<DeceasesCsvProcessJobData>,
  ) {
    super();
  }

  async process(job: Job<DeceasesIngestJobData>): Promise<void> {
    const { s3Path, year, month } = job.data;

    this.logger.log('Starting CSV ingest job', {
      jobId: job.id,
      s3Path,
      year,
      month,
    });

    try {
      let csvS3Path: string;
      let fileName: string;

      if (s3Path) {
        // Manual triggering with specific S3 path
        csvS3Path = s3Path;
        fileName = this.extractFileNameFromS3Path(s3Path);

        this.logger.log('Processing manual S3 path', {
          s3Path: csvS3Path,
          fileName,
        });
      } else if (year && month) {
        // Scheduled download from INSEE or external source
        const result = await this.downloadMonthlyFile(year, month);
        csvS3Path = result.s3Path;
        fileName = result.fileName;

        this.logger.log('Downloaded monthly file', {
          year,
          month,
          s3Path: csvS3Path,
          fileName,
        });
      } else {
        throw new Error('Either s3Path or (year, month) must be provided');
      }

      // Verify file exists in S3
      try {
        await this.s3Service.downloadFile(csvS3Path);
        this.logger.log('Verified file exists in S3', { s3Path: csvS3Path });
      } catch (error) {
        this.logger.error('File not found in S3', {
          s3Path: csvS3Path,
          error: error instanceof Error ? error.message : String(error),
        });
        throw new Error(`File not found in S3: ${csvS3Path}`);
      }

      // Enqueue CSV processing job
      await this.csvProcessQueue.add(
        'process-csv',
        {
          s3Path: csvS3Path,
          fileName,
        },
        {
          removeOnComplete: 100,
          removeOnFail: 100,
        },
      );

      this.logger.log('CSV processing job enqueued successfully', {
        s3Path: csvS3Path,
        fileName,
      });
    } catch (error) {
      this.logger.error('CSV ingest job failed', {
        jobId: job.id,
        s3Path,
        year,
        month,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  /**
   * Download monthly INSEE file and upload to S3
   * NOTE: This is a placeholder for now. In the future, this could:
   * - Download directly from INSEE FTP/HTTP endpoints
   * - Integrate with external data providers
   * - Handle authentication and data agreements
   */
  private downloadMonthlyFile(
    year: number,
    month: number,
  ): Promise<{
    s3Path: string;
    fileName: string;
  }> {
    const fileName = `Deces_${year}_M${String(month).padStart(2, '0')}.csv`;
    const s3Key = `deceases/raw/${fileName}`;
    const s3Path = `s3://${process.env.S3_BUCKET}/${s3Key}`;

    this.logger.log('Attempting to download monthly file', {
      year,
      month,
      fileName,
      s3Path,
    });

    // For now, throw an error since we don't have direct INSEE access
    // This can be implemented later when we have proper INSEE integration
    throw new Error(
      `Automatic download not yet implemented. Please manually upload ${fileName} to S3 and use manual triggering with s3Path.`,
    );

    // Future implementation might look like:
    // const inseeUrl = `https://insee.fr/files/${fileName}`;
    // const response = await fetch(inseeUrl);
    // const buffer = Buffer.from(await response.arrayBuffer());
    // await this.s3Service.uploadFile(buffer, s3Key);
    //
    // return {
    //   s3Path,
    //   fileName,
    // };
  }

  /**
   * Extract filename from S3 path
   */
  private extractFileNameFromS3Path(s3Path: string): string {
    try {
      // Remove s3:// prefix and bucket name to get the key
      const key = s3Path.replace(/^s3:\/\/[^/]+\//, '');
      // Extract filename from the key
      return key.split('/').pop() || 'unknown.csv';
    } catch (error) {
      this.logger.warn('Failed to extract filename from S3 path', {
        s3Path,
        error: error instanceof Error ? error.message : String(error),
      });
      return 'unknown.csv';
    }
  }
}
