import { Inject, Injectable, Logger } from '@nestjs/common';
import { domainSchema } from '@linkinvests/db';
import { desc, eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

import { DATABASE_CONNECTION, type DomainDbType } from '~/database';

import type {
  ScrapedDeceasesFile,
  ScrapedDeceasesFilesRepository,
} from '../types';

@Injectable()
export class ScrapedDeceasesFilesRepositoryImpl implements ScrapedDeceasesFilesRepository {
  private readonly logger = new Logger(ScrapedDeceasesFilesRepositoryImpl.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DomainDbType
  ) { }

  /**
   * Get all monthly files (excluding yearly aggregates) from the database
   * @returns Array of scraped deceases files
   */
  async getMonthlyFiles(): Promise<ScrapedDeceasesFile[]> {
    try {
      const files = await this.db
        .select()
        .from(domainSchema.scrapedDeceasesFiles)
        .orderBy(desc(domainSchema.scrapedDeceasesFiles.createdAt));

      // Filter for monthly files only (exclude yearly aggregates)
      // Monthly files typically have format like "deces-2024-01.csv" or similar
      const monthlyFiles = files.filter((file) =>
        this.isMonthlyFile(file.fileName)
      );

      this.logger.log(
        `Retrieved ${monthlyFiles.length} monthly files from database`
      );
      return monthlyFiles;
    } catch (error: unknown) {
      this.logger.error({ error }, 'Failed to get monthly files');
      throw error;
    }
  }

  /**
   * Get the latest file by creation date
   * @returns The most recent scraped deceases file or null if none exist
   */
  async getLatestFile(): Promise<ScrapedDeceasesFile | null> {
    try {
      const files = await this.db
        .select()
        .from(domainSchema.scrapedDeceasesFiles)
        .orderBy(desc(domainSchema.scrapedDeceasesFiles.createdAt))
        .limit(1);

      const latestFile = files[0] || null;

      if (latestFile) {
        this.logger.log(`Retrieved latest file: ${latestFile.fileName}`);
      } else {
        this.logger.log('No files found in database');
      }

      return latestFile;
    } catch (error: unknown) {
      this.logger.error({ error }, 'Failed to get latest file');
      throw error;
    }
  }

  /**
   * Insert a new file record
   * @param fileName - The name of the file to insert
   * @returns The created file record
   */
  async insertFile(fileName: string): Promise<void> {
    try {
      await this.db
        .insert(domainSchema.scrapedDeceasesFiles)
        .values({ id: randomUUID(), fileName });

      this.logger.log(`Successfully inserted file: ${fileName}`);
    } catch (error: unknown) {
      this.logger.error({ error, fileName }, 'Failed to insert file');
      throw error;
    }
  }

  /**
   * Check if a file with the given name already exists
   * @param fileName - The file name to check
   * @returns True if file exists, false otherwise
   */
  async fileExists(fileName: string): Promise<boolean> {
    try {
      const files = await this.db
        .select()
        .from(domainSchema.scrapedDeceasesFiles)
        .where(eq(domainSchema.scrapedDeceasesFiles.fileName, fileName))
        .limit(1);

      const exists = files.length > 0;
      this.logger.log(`File ${fileName} exists: ${exists}`);

      return exists;
    } catch (error: unknown) {
      this.logger.error({ error, fileName }, 'Failed to check if file exists');
      throw error;
    }
  }

  /**
   * Determine if a file name represents a monthly file (not yearly aggregate)
   * @param fileName - The file name to check
   * @returns True if it's a monthly file, false otherwise
   */
  private isMonthlyFile(fileName: string): boolean {
    // Pattern to match monthly files like "deces-2024-01.csv" or similar
    // This excludes yearly files like "deces-2024.csv"
    const monthlyPattern = /\d{4}-\d{2}/;
    return monthlyPattern.test(fileName);
  }
}
