import { Inject, Injectable, Logger } from '@nestjs/common';
import { S3Service } from '~/storage';
import { SOURCE_COMPANY_BUILDINGS_QUEUE } from '../constants';
import { Queue } from 'bullmq';
import { request } from 'undici';

@Injectable()
export class FailingCompaniesProcessor {
  private readonly logger = new Logger(FailingCompaniesProcessor.name);

  constructor(
    private readonly s3Service: S3Service,
    @Inject(SOURCE_COMPANY_BUILDINGS_QUEUE)
    private readonly companyBuildingsQueue: Queue,
  ) {}

  async process(departmentId: number, sinceDate: string): Promise<void> {
    this.logger.log(
      `Starting to process failing companies for department ${departmentId} since ${sinceDate}`,
    );

    try {
      // 1. Build the OpenDatasoft API URL
      const apiUrl = this.buildApiUrl(departmentId, sinceDate);
      this.logger.log(`Fetching data from: ${apiUrl}`);

      // 2. Fetch CSV data from the API
      const csvData = await this.fetchCsvData(apiUrl);
      this.logger.log(
        `Fetched CSV data: ${csvData.length} bytes for department ${departmentId}`,
      );

      // 3. Upload CSV to S3
      const s3Key = this.s3Service.generateFailingCompaniesKey(
        departmentId,
        sinceDate,
      );
      const s3Path = await this.s3Service.uploadFile(csvData, s3Key);
      this.logger.log(`Uploaded CSV to S3: ${s3Path}`);

      // 4. Trigger the company buildings queue with the S3 path
      const job = await this.companyBuildingsQueue.add(
        'source-company-buildings',
        { sourceFile: s3Path },
        {
          removeOnComplete: 100,
          removeOnFail: 100,
        },
      );
      this.logger.log(
        `Enqueued company buildings job: ${job.id} for file: ${s3Path}`,
      );

      this.logger.log('Successfully processed failing companies');
    } catch (error) {
      this.logger.error(
        `Failed to process failing companies: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * Build the OpenDatasoft API URL with the required filters
   */
  private buildApiUrl(departmentId: number, sinceDate: string): string {
    const baseUrl =
      'https://bodacc-datadila.opendatasoft.com/api/records/1.0/export/';

    const params = new URLSearchParams({
      dataset: 'annonces-commerciales',
      q: `familleavis:collective AND numerodepartement:${departmentId} AND dateparution>=${sinceDate}`,
      rows: '-1', // Get all records
      format: 'csv',
      fields:
        'numerodepartement,departement_nom_officiel,familleavis_lib,typeavis_lib,dateparution,denomination,ville,cp,listepersonnes,jugement',
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Fetch CSV data from the OpenDatasoft API
   */
  private async fetchCsvData(url: string): Promise<Buffer> {
    try {
      const response = await request(url, {
        method: 'GET',
        headersTimeout: 60000, // 60 seconds timeout
      });

      if (response.statusCode !== 200) {
        throw new Error(
          `Failed to fetch data from API. Status: ${response.statusCode}`,
        );
      }

      const arrayBuffer = await response.body.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to fetch CSV data: ${err.message}`, err.stack);
      throw error;
    }
  }
}
