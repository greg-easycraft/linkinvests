import { Logger } from '@nestjs/common';
import { S3Service } from '~/storage';
import { Queue, Job } from 'bullmq';
import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import {
  SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE,
  SOURCE_COMPANY_BUILDINGS_QUEUE,
} from '@linkinvests/shared';

interface FailingCompaniesJobData {
  departmentId: number;
  sinceDate: string;
}

@Processor(SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE)
export class FailingCompaniesProcessor extends WorkerHost {
  private readonly logger = new Logger(FailingCompaniesProcessor.name);

  constructor(
    private readonly s3Service: S3Service,
    @InjectQueue(SOURCE_COMPANY_BUILDINGS_QUEUE)
    private readonly companyBuildingsQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<FailingCompaniesJobData>): Promise<void> {
    const { departmentId, sinceDate } = job.data;
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
      'https://bodacc-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/annonces-commerciales/exports/csv';

    const params = new URLSearchParams({
      where: `familleavis:"collective" AND numerodepartement:${departmentId} AND dateparution>="${sinceDate}"`,
      limit: '-1', // Get all records
      select:
        'numerodepartement,departement_nom_officiel,familleavis_lib,typeavis_lib,dateparution,commercant,ville,cp,listepersonnes,jugement',
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Fetch CSV data from the OpenDatasoft API
   */
  private async fetchCsvData(url: string): Promise<Buffer> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(60000), // 60 seconds timeout
      });

      if (response.status !== 200) {
        throw new Error(
          `Failed to fetch data from API. Status: ${response.status}`,
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to fetch CSV data: ${err.message}`, err.stack);
      throw error;
    }
  }
}
