import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';

import { S3Service } from '~/storage/s3.service';
import { InseeScraperService } from './insee-scraper.service';
import { FileDownloadService } from './file-download.service';
import type {
  InseeFileMetadata,
  ScrapedDeceasesFile,
} from '../types/deceases.types';

interface ScraperStats {
  filesFound: number;
  filesDownloaded: number;
  filesUploaded: number;
  errors: number;
  failedFiles: Array<{
    file: InseeFileMetadata;
    error: string;
  }>;
}

export abstract class AbstractDeceasesRepository {
  abstract getMonthlyFiles(): Promise<ScrapedDeceasesFile[]>;
  abstract insertFile(fileName: string): Promise<void>;
}

@Injectable()
export class DeceasesScrapingService {
  private readonly logger = new Logger(DeceasesScrapingService.name);

  constructor(
    private readonly inseeScraperService: InseeScraperService,
    private readonly fileDownloadService: FileDownloadService,
    private readonly s3Service: S3Service,
    private readonly repository: AbstractDeceasesRepository
  ) {}

  async scrapeDeceases(job: Job): Promise<void> {
    this.logger.log('Starting deceases scraping job', {
      jobId: job.id,
    });

    const stats: ScraperStats = {
      filesFound: 0,
      filesDownloaded: 0,
      filesUploaded: 0,
      errors: 0,
      failedFiles: [],
    };

    try {
      // Step 1: Get existing files from database
      this.logger.log('Fetching existing files from database');
      const existingFiles = await this.repository.getMonthlyFiles();
      this.logger.log(
        `Found ${existingFiles.length} existing files in database`
      );

      // Step 2: Scrape INSEE page for new files
      this.logger.log('Scraping INSEE page for new files');
      const availableFiles =
        await this.inseeScraperService.scrapeNewMonthlyFiles(existingFiles);
      stats.filesFound = availableFiles.length;

      if (availableFiles.length === 0) {
        this.logger.log('No new files found, scraper job completed');
        return;
      }

      this.logger.log(`Found ${availableFiles.length} new files to process`);

      // Step 3: Process each new file
      for (const fileMetadata of availableFiles) {
        try {
          await this.processFile(fileMetadata, stats);
        } catch (error: unknown) {
          stats.errors++;
          stats.failedFiles.push({
            file: fileMetadata,
            error: error instanceof Error ? error.message : String(error),
          });

          this.logger.error(
            {
              error,
              fileName: fileMetadata.fileName,
              url: fileMetadata.url,
            },
            'Failed to process file'
          );

          // Continue with other files even if one fails
          continue;
        }
      }

      // Step 4: Final logging and cleanup
      this.logger.log('Scraper job completed', {
        finalStats: stats,
        successRate: `${stats.filesUploaded}/${stats.filesFound}`,
      });

      // Log failed files if any
      if (stats.failedFiles.length > 0) {
        this.logger.warn(
          { failedFiles: stats.failedFiles },
          `${stats.failedFiles.length} files failed to process`
        );
      }
    } catch (error: unknown) {
      this.logger.error(
        { error, jobId: job.id, stats },
        'Scraper job failed with critical error'
      );
      throw error;
    }
  }

  /**
   * Process a single file: download, extract, upload to S3, record in DB
   */
  private async processFile(
    fileMetadata: InseeFileMetadata,
    stats: ScraperStats
  ): Promise<void> {
    const { fileName, url } = fileMetadata;

    this.logger.log(
      { fileName, url, year: fileMetadata.year, month: fileMetadata.month },
      'Processing file'
    );

    let tempPaths: string[] = [];

    try {
      // Step 1: Download and extract file
      this.logger.log({ fileName }, 'Downloading and extracting ZIP file');
      const downloadResult = await this.fileDownloadService.downloadAndExtract(
        url,
        fileName
      );

      tempPaths = downloadResult.tempPaths;
      stats.filesDownloaded++;

      // Step 2: Upload CSV to S3
      const csvFileName = this.generateCsvFileName(fileMetadata);
      const s3Key = `deceases/${csvFileName}`;

      this.logger.log(
        {
          fileName,
          csvFileName,
          s3Key,
          csvSize: downloadResult.csvBuffer.length,
        },
        'Uploading CSV to S3'
      );

      await this.s3Service.uploadFile(downloadResult.csvBuffer, s3Key);
      stats.filesUploaded++;

      this.logger.log({ s3Key }, 'Successfully uploaded CSV to S3');

      // Step 3: Record file in database
      this.logger.log({ fileName: csvFileName }, 'Recording file in database');
      await this.repository.insertFile(csvFileName);

      this.logger.log(
        { fileName, csvFileName, s3Key },
        'Successfully processed file and uploaded to S3. CSV processing will be handled by sourcing-worker.'
      );
    } catch (error: unknown) {
      this.logger.error({ error, fileName, url }, 'Failed to process file');
      throw error;
    } finally {
      // Step 4: Cleanup temporary files
      if (tempPaths.length > 0) {
        try {
          await this.fileDownloadService.cleanupTempFiles(tempPaths);
          this.logger.log({ tempPaths }, 'Cleaned up temporary files');
        } catch (cleanupError: unknown) {
          this.logger.warn(
            { error: cleanupError, tempPaths },
            'Failed to cleanup some temporary files'
          );
          // Don't fail the main process for cleanup errors
        }
      }
    }
  }

  /**
   * Generate a standardized CSV file name from metadata
   */
  private generateCsvFileName(fileMetadata: InseeFileMetadata): string {
    const { year, month } = fileMetadata;

    // Format: deces-YYYY-MM.csv
    const monthStr = month.toString().padStart(2, '0');
    return `deces-${year}-${monthStr}.csv`;
  }

  /**
   * Check if a file should be processed (useful for force rescrape logic)
   */
  private shouldProcessFile(
    fileMetadata: InseeFileMetadata,
    existingFiles: ScrapedDeceasesFile[],
    forceRescrape: boolean
  ): boolean {
    if (forceRescrape) {
      return true;
    }

    const existingFileNames = new Set(existingFiles.map((f) => f.fileName));
    const csvFileName = this.generateCsvFileName(fileMetadata);

    return !existingFileNames.has(csvFileName);
  }
}
