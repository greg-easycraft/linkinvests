import { Injectable, Logger } from '@nestjs/common';

import type {
  InseeFileMetadata,
  ScrapedDeceasesFile,
} from '../types/deceases.types';
import { subMonths } from 'date-fns';

@Injectable()
export class InseeScraperService {
  private readonly logger = new Logger(InseeScraperService.name);
  private readonly inseeUrl = 'https://www.insee.fr/fr/information/4190491';

  // Rate limiting
  private lastRequestTime = 0;
  private readonly minRequestInterval = 1000; // 1 second between requests
  private readonly maxRetries = 3;
  private readonly retryDelay = 2000; // 2 seconds

  /**
   * Scrape the INSEE page to find new monthly CSV files
   * @param existingFiles - Files already processed from database
   * @returns List of new files to download
   */
  async scrapeNewMonthlyFiles(
    existingFiles: ScrapedDeceasesFile[]
  ): Promise<InseeFileMetadata[]> {
    try {
      this.logger.log('Starting scrape of INSEE page for deceases files');

      const html = await this.fetchPageWithRetry(this.inseeUrl);
      const allFiles = this.extractFileMetadataFromHtml(html);
      const newFiles = this.filterNewFiles(allFiles, existingFiles);

      this.logger.log(
        `Found ${allFiles.length} total files, ${newFiles.length} new files`
      );

      return newFiles;
    } catch (error: unknown) {
      this.logger.error({ error }, 'Failed to scrape INSEE page');
      throw error;
    }
  }

  /**
   * Extract file metadata from HTML content
   * Only matches <a class="fichier" href="...zip"> tags
   * Filters out files older than 1 year
   * @param html - The HTML content of the INSEE page
   * @returns Array of file metadata
   */
  private extractFileMetadataFromHtml(html: string): InseeFileMetadata[] {
    const files: InseeFileMetadata[] = [];
    const today = new Date();
    const oneYearAgo = subMonths(today, 12);

    try {
      // Match only <a class="fichier" href="...zip"> tags
      const anchorRegex = /<a\s+class="fichier"\s+href="([^"]+\.zip)"/gi;
      const yearMonthRegex = /(\d{4})[-_]M?(\d{1,2})\.zip$/i;

      let match: RegExpExecArray | null;

      while ((match = anchorRegex.exec(html)) !== null) {
        const href = match[1];
        if (!href) continue;

        // Extract filename from href path
        const fileName = href.split('/').pop();
        if (!fileName) continue;

        // Parse year and month from filename
        const yearMonthMatch = fileName.match(yearMonthRegex);
        if (!yearMonthMatch || !yearMonthMatch[1] || !yearMonthMatch[2]) {
          this.logger.warn(
            { fileName },
            'Could not parse year/month from filename'
          );
          continue;
        }

        const year = parseInt(yearMonthMatch[1], 10);
        const month = parseInt(yearMonthMatch[2], 10);

        // Validate month
        if (month < 1 || month > 12) {
          this.logger.warn({ fileName, month }, 'Invalid month in filename');
          continue;
        }

        // Skip files older than 1 year
        const fileDate = new Date(year, month - 1, 1);
        if (fileDate < oneYearAgo) {
          this.logger.debug(
            { fileName, year, month },
            'Skipping file older than 1 year'
          );
          continue;
        }

        files.push({
          fileName,
          url: href,
          year,
          month,
        });
      }

      this.logger.log(
        `Extracted ${files.length} deceases files from HTML (within last year)`
      );
      return files;
    } catch (error: unknown) {
      this.logger.error({ error }, 'Failed to extract file metadata from HTML');
      throw error;
    }
  }

  /**
   * Filter files to get only new ones not yet in database
   * @param files - All available files
   * @param existingFiles - Files already in database
   * @returns New files to process
   */
  private filterNewFiles(
    files: InseeFileMetadata[],
    existingFiles: ScrapedDeceasesFile[]
  ): InseeFileMetadata[] {
    const existingFileNames = new Set(existingFiles.map((f) => f.fileName));

    const newFiles = files.filter(
      (file) => !existingFileNames.has(file.fileName)
    );

    // Sort by year and month (oldest first) for systematic processing
    newFiles.sort((a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year;
      }
      return a.month - b.month;
    });

    this.logger.log(
      `Filtered ${files.length} files to ${newFiles.length} new files not in database`
    );

    return newFiles;
  }

  /**
   * Fetch page content with retry logic
   * @param url - The URL to fetch
   * @returns HTML content
   */
  private async fetchPageWithRetry(url: string): Promise<string> {
    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      await this.sleep(this.minRequestInterval - timeSinceLastRequest);
    }

    let lastError: Error | null = null;

    // Retry logic
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.lastRequestTime = Date.now();

        this.logger.log({ url, attempt }, `Fetching page (attempt ${attempt})`);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (compatible; LinkInvestsBot/1.0; +https://linkinvests.com)',
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'fr,en;q=0.9',
          },
          signal: AbortSignal.timeout(30000), // 30s timeout
        });

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('retry-after');
          const waitTime = retryAfter
            ? parseInt(retryAfter, 10) * 1000
            : this.retryDelay * attempt;
          this.logger.warn(
            { attempt, waitTime },
            `Rate limited. Waiting ${waitTime}ms`
          );
          await this.sleep(waitTime);
          continue;
        }

        if (response.status !== 200) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();

        if (!html || html.length === 0) {
          throw new Error('Empty response received');
        }

        this.logger.log(
          { htmlLength: html.length },
          'Successfully fetched page content'
        );

        return html;
      } catch (error: unknown) {
        lastError = error as Error;
        if (attempt < this.maxRetries) {
          this.logger.warn(
            { attempt, maxRetries: this.maxRetries, error },
            `Attempt ${attempt}/${this.maxRetries} failed. Retrying...`
          );
          await this.sleep(this.retryDelay * attempt);
        }
      }
    }

    throw lastError || new Error('Failed to fetch page');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
