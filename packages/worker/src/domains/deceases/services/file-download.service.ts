import { Injectable, Logger } from '@nestjs/common';
import AdmZip from 'adm-zip';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

interface DownloadResult {
  fileName: string;
  csvBuffer: Buffer;
  tempPaths: string[]; // Paths to clean up
}

@Injectable()
export class FileDownloadService {
  private readonly logger = new Logger(FileDownloadService.name);

  // Rate limiting and retry settings
  private lastRequestTime = 0;
  private readonly minRequestInterval = 1000; // 1 second between downloads
  private readonly maxRetries = 3;
  private readonly retryDelay = 5000; // 5 seconds
  private readonly downloadTimeout = 300000; // 5 minutes

  /**
   * Download and extract CSV from a ZIP file
   * @param url - The URL of the ZIP file
   * @param fileName - Expected file name for logging
   * @returns Download result with CSV buffer and cleanup paths
   */
  async downloadAndExtract(
    url: string,
    fileName: string
  ): Promise<DownloadResult> {
    const tempPaths: string[] = [];

    try {
      this.logger.log({ url, fileName }, 'Starting download and extraction');

      // Download ZIP file
      const zipBuffer = await this.downloadZipFile(url);

      // Extract CSV from ZIP
      const csvData = this.extractCsvFromZip(zipBuffer, fileName);

      this.logger.log(
        { fileName, csvSize: csvData.length },
        'Successfully downloaded and extracted CSV'
      );

      return {
        fileName,
        csvBuffer: csvData,
        tempPaths,
      };
    } catch (error: unknown) {
      // Clean up any temporary files on error
      await this.cleanupTempFiles(tempPaths);
      this.logger.error(
        { error, url, fileName },
        'Failed to download and extract file'
      );
      throw error;
    }
  }

  /**
   * Download a ZIP file from the given URL
   * @param url - The URL to download from
   * @returns Buffer containing the ZIP file
   */
  private async downloadZipFile(url: string): Promise<Buffer> {
    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      await this.sleep(this.minRequestInterval - timeSinceLastRequest);
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.lastRequestTime = Date.now();

        this.logger.log(
          { url, attempt },
          `Downloading ZIP file (attempt ${attempt})`
        );

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (compatible; LinkInvestsBot/1.0; +https://linkinvests.com)',
            Accept: 'application/zip, application/octet-stream, */*',
          },
          signal: AbortSignal.timeout(this.downloadTimeout),
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

        // Verify content type
        const contentType = response.headers.get('content-type') || '';
        if (
          !contentType.includes('application/zip') &&
          !contentType.includes('application/octet-stream')
        ) {
          this.logger.warn(
            { contentType },
            'Unexpected content type for ZIP file'
          );
        }

        const arrayBuffer = await response.arrayBuffer();
        const zipBuffer = Buffer.from(arrayBuffer);

        if (zipBuffer.length === 0) {
          throw new Error('Empty ZIP file received');
        }

        this.logger.log(
          { zipSize: zipBuffer.length },
          'Successfully downloaded ZIP file'
        );

        return zipBuffer;
      } catch (error: unknown) {
        lastError = error as Error;
        if (attempt < this.maxRetries) {
          this.logger.warn(
            { attempt, maxRetries: this.maxRetries, error },
            `Download attempt ${attempt}/${this.maxRetries} failed. Retrying...`
          );
          await this.sleep(this.retryDelay * attempt);
        }
      }
    }

    throw lastError || new Error('Failed to download ZIP file');
  }

  /**
   * Extract CSV file from ZIP archive
   * @param zipBuffer - Buffer containing ZIP file data
   * @param expectedFileName - Expected file name for validation
   * @returns Buffer containing CSV data
   */
  private extractCsvFromZip(
    zipBuffer: Buffer,
    expectedFileName: string
  ): Buffer {
    try {
      this.logger.log({ expectedFileName }, 'Extracting CSV from ZIP archive');

      const zip = new AdmZip(zipBuffer);
      const entries = zip.getEntries();

      this.logger.log(
        {
          entryCount: entries.length,
          entries: entries.map((e) => e.entryName),
        },
        'ZIP entries found'
      );

      // Look for CSV files in the archive
      const csvEntries = entries.filter(
        (entry) =>
          entry.entryName.toLowerCase().endsWith('.csv') && !entry.isDirectory
      );

      if (csvEntries.length === 0) {
        throw new Error('No CSV files found in ZIP archive');
      }

      // If multiple CSV files, try to find the best match
      let selectedEntry = csvEntries[0];

      if (csvEntries.length > 1) {
        // Try to find entry matching expected filename pattern
        const baseFileName = expectedFileName.replace(/\.zip$/i, '');
        const matchingEntry = csvEntries.find(
          (entry) =>
            entry.entryName
              .toLowerCase()
              .includes(baseFileName.toLowerCase()) ||
            entry.entryName.toLowerCase().includes('deces')
        );

        if (matchingEntry) {
          selectedEntry = matchingEntry;
        }

        this.logger.log(
          {
            csvCount: csvEntries.length,
            selected: selectedEntry.entryName,
            allCsvs: csvEntries.map((e) => e.entryName),
          },
          'Multiple CSV files found, selected best match'
        );
      }

      const csvData = selectedEntry.getData();

      if (!csvData || csvData.length === 0) {
        throw new Error(`Empty CSV file: ${selectedEntry.entryName}`);
      }

      // Validate CSV content (basic check)
      const csvText = csvData.toString('utf-8');
      if (!csvText.includes('\n') && csvText.length < 100) {
        throw new Error('CSV file appears to be invalid or too small');
      }

      this.logger.log(
        {
          csvFileName: selectedEntry.entryName,
          csvSize: csvData.length,
          lineCount: csvText.split('\n').length,
        },
        'Successfully extracted CSV from ZIP'
      );

      return csvData;
    } catch (error: unknown) {
      this.logger.error(
        { error, expectedFileName },
        'Failed to extract CSV from ZIP'
      );
      throw error;
    }
  }

  /**
   * Clean up temporary files
   * @param tempPaths - Array of paths to clean up
   */
  async cleanupTempFiles(tempPaths: string[]): Promise<void> {
    if (tempPaths.length === 0) {
      return;
    }

    this.logger.log({ tempPaths }, 'Cleaning up temporary files');

    const cleanupPromises = tempPaths.map(async (path) => {
      try {
        await fs.unlink(path);
        this.logger.log({ path }, 'Cleaned up temporary file');
      } catch (error: unknown) {
        // Don't fail the whole process if cleanup fails
        this.logger.warn({ error, path }, 'Failed to clean up temporary file');
      }
    });

    await Promise.allSettled(cleanupPromises);
  }

  /**
   * Generate a unique temporary file path
   * @param extension - File extension
   * @returns Temporary file path
   */
  private generateTempPath(extension: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const fileName = `linkinvests-${timestamp}-${random}.${extension}`;
    return join(tmpdir(), fileName);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
