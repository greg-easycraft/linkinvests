import { Injectable, Logger } from '@nestjs/common';

import type {
  InseeFileMetadata,
  ScrapedDeceasesFile,
} from '../types/deceases.types';

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
      const monthlyFiles = allFiles.filter(
        (file) => file.fileType === 'monthly'
      );
      const newFiles = this.filterNewFiles(monthlyFiles, existingFiles);

      this.logger.log(
        `Found ${allFiles.length} total files, ${monthlyFiles.length} monthly files, ${newFiles.length} new files`
      );

      return newFiles;
    } catch (error: unknown) {
      this.logger.error({ error }, 'Failed to scrape INSEE page');
      throw error;
    }
  }

  /**
   * Extract file metadata from HTML content
   * @param html - The HTML content of the INSEE page
   * @returns Array of file metadata
   */
  private extractFileMetadataFromHtml(html: string): InseeFileMetadata[] {
    const files: InseeFileMetadata[] = [];

    try {
      // Extract all anchor tags with href attributes
      const anchorRegex = /<a[^>]+href\s*=\s*["']([^"']+)["'][^>]*>/gi;
      let match: RegExpExecArray | null;

      while ((match = anchorRegex.exec(html)) !== null) {
        const href = match[1];

        // Check if this is a ZIP file link containing deceases data
        if (href && this.isDeceasesZipFile(href)) {
          const metadata = this.parseFileMetadata(href);
          if (metadata) {
            files.push(metadata);
          }
        }
      }

      this.logger.log(`Extracted ${files.length} deceases files from HTML`);
      return files;
    } catch (error: unknown) {
      this.logger.error({ error }, 'Failed to extract file metadata from HTML');
      throw error;
    }
  }

  /**
   * Check if a URL points to a deceases ZIP file
   * @param url - The URL to check
   * @returns True if it's a deceases ZIP file
   */
  private isDeceasesZipFile(url: string): boolean {
    // Look for ZIP files containing "deces" or similar patterns
    const deceasesPatterns = [
      /deces.*\.zip$/i,
      /deceases.*\.zip$/i,
      /mortality.*\.zip$/i,
      /death.*\.zip$/i,
    ];

    return deceasesPatterns.some((pattern) => pattern.test(url));
  }

  /**
   * Parse file metadata from URL
   * @param url - The file URL
   * @returns File metadata or null if parsing fails
   */
  private parseFileMetadata(url: string): InseeFileMetadata | null {
    try {
      // Extract filename from URL
      const fileName = url.split('/').pop() || '';

      // Extract year and month from filename
      // Expected formats: deces-2024-01.zip, deces_2024_01.zip, etc.
      const yearMonthPattern = /(\d{4})[-_](\d{2})/;
      const yearOnlyPattern = /(\d{4})(?![-_]\d{2})/;

      let year: number;
      let month: number;
      let fileType: 'monthly' | 'yearly';

      const yearMonthMatch = fileName.match(yearMonthPattern);
      if (yearMonthMatch && yearMonthMatch[1] && yearMonthMatch[2]) {
        year = parseInt(yearMonthMatch[1], 10);
        month = parseInt(yearMonthMatch[2], 10);
        fileType = 'monthly';
      } else {
        const yearOnlyMatch = fileName.match(yearOnlyPattern);
        if (yearOnlyMatch && yearOnlyMatch[1]) {
          year = parseInt(yearOnlyMatch[1], 10);
          month = 0; // No specific month for yearly files
          fileType = 'yearly';
        } else {
          this.logger.warn(
            { fileName, url },
            'Could not parse year/month from filename'
          );
          return null;
        }
      }

      // Validate extracted data
      if (year < 2000 || year > new Date().getFullYear() + 1) {
        this.logger.warn(
          { fileName, year },
          'Invalid year extracted from filename'
        );
        return null;
      }

      if (fileType === 'monthly' && (month < 1 || month > 12)) {
        this.logger.warn(
          { fileName, month },
          'Invalid month extracted from filename'
        );
        return null;
      }

      // Ensure URL is absolute
      const absoluteUrl = url.startsWith('http')
        ? url
        : `https://www.insee.fr${url}`;

      return {
        fileName,
        url: absoluteUrl,
        year,
        month,
        fileType,
      };
    } catch (error: unknown) {
      this.logger.error({ error, url }, 'Failed to parse file metadata');
      return null;
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
