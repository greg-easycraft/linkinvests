import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  SOURCE_COMPANY_BUILDINGS_QUEUE,
  INGEST_DECEASES_CSV_QUEUE,
  SOURCE_ENERGY_SIEVES_QUEUE,
  SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE,
  SOURCE_LISTINGS_QUEUE,
} from '@linkinvests/shared';

@Controller('sourcing')
export class SourcingController {
  private readonly logger = new Logger(SourcingController.name);

  constructor(
    @InjectQueue(SOURCE_COMPANY_BUILDINGS_QUEUE)
    private readonly companyBuildingsQueue: Queue,
    @InjectQueue(INGEST_DECEASES_CSV_QUEUE)
    private readonly deceasesQueue: Queue,
    @InjectQueue(SOURCE_ENERGY_SIEVES_QUEUE)
    private readonly energySievesQueue: Queue,
    @InjectQueue(SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE)
    private readonly failingCompaniesQueue: Queue,
    @InjectQueue(SOURCE_LISTINGS_QUEUE)
    private readonly listingsQueue: Queue,
  ) {}

  @Post('jobs/failing-companies')
  @HttpCode(HttpStatus.ACCEPTED)
  async enqueueFailingCompanies(
    @Body('departmentId') departmentId: number,
    @Body('sinceDate') sinceDate: string,
    @Body('beforeDate') beforeDate?: string,
  ) {
    try {
      if (!departmentId) {
        return {
          success: false,
          error: 'departmentId is required',
        };
      }

      if (!sinceDate) {
        return {
          success: false,
          error: 'sinceDate is required (format: YYYY-MM-DD)',
        };
      }

      const { id: jobId } = await this.failingCompaniesQueue.add(
        'source-failing-companies',
        {
          departmentId,
          sinceDate,
          beforeDate,
        },
        {
          removeOnComplete: 100,
          removeOnFail: 100,
        },
      );

      this.logger.log({
        jobId,
        departmentId,
        sinceDate,
        beforeDate,
        message: 'Failing companies job enqueued',
      });

      return {
        success: true,
        jobId,
        message: 'Job enqueued successfully',
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error({
        error: err.message,
        message: 'Failed to enqueue failing companies job',
      });

      return {
        success: false,
        error: err.message,
      };
    }
  }

  @Post('jobs/company-buildings')
  @HttpCode(HttpStatus.ACCEPTED)
  async enqueueCompanyBuildings(@Body('sourceFile') sourceFile: string) {
    try {
      if (!sourceFile) {
        return {
          success: false,
          error: 'sourceFile is required',
        };
      }

      const { id: jobId } = await this.companyBuildingsQueue.add(
        'source-company-buildings',
        {
          sourceFile,
        },
        {
          removeOnComplete: 100,
          removeOnFail: 100,
        },
      );

      this.logger.log({
        jobId,
        sourceFile,
        message: 'Company buildings job enqueued',
      });

      return {
        success: true,
        jobId,
        message: 'Job enqueued successfully',
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error({
        error: err.message,
        message: 'Failed to enqueue company buildings job',
      });

      return {
        success: false,
        error: err.message,
      };
    }
  }

  @Post('jobs/ingest-deceases-csv')
  @HttpCode(HttpStatus.ACCEPTED)
  async enqueueIngestDeceasesCsv(@Body('fileName') fileName: string) {
    try {
      if (!fileName) {
        return {
          success: false,
          error: 'fileName is required',
        };
      }

      const { id: jobId } = await this.deceasesQueue.add(
        'ingest-deceases-csv',
        {
          fileName,
        },
        {
          removeOnComplete: 100,
          removeOnFail: 100,
        },
      );

      this.logger.log({
        jobId,
        fileName,
        message: 'Deceases CSV ingestion job enqueued',
      });

      return {
        success: true,
        jobId,
        message: 'Job enqueued successfully',
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error({
        error: err.message,
        message: 'Failed to enqueue deceases CSV ingestion job',
      });

      return {
        success: false,
        error: err.message,
      };
    }
  }

  @Post('jobs/energy-sieves')
  @HttpCode(HttpStatus.ACCEPTED)
  async enqueueEnergyDiagnostics(
    @Body('departmentId') departmentId: number,
    @Body('sinceDate') sinceDate: string,
    @Body('beforeDate') beforeDate?: string,
    @Body('energyClasses') energyClasses?: string[],
  ) {
    try {
      if (!departmentId) {
        return {
          success: false,
          error: 'departmentId is required',
        };
      }

      if (!sinceDate) {
        return {
          success: false,
          error: 'sinceDate is required (format: YYYY-MM-DD)',
        };
      }

      const { id: jobId } = await this.energySievesQueue.add(
        'source-energy-sieves',
        {
          departmentId,
          sinceDate,
          beforeDate,
          energyClasses: energyClasses || ['F', 'G'],
        },
        {
          removeOnComplete: 100,
          removeOnFail: 100,
        },
      );

      this.logger.log({
        jobId,
        departmentId,
        sinceDate,
        beforeDate,
        energyClasses: energyClasses || ['F', 'G'],
        message: 'Energy sieves job enqueued',
      });

      return {
        success: true,
        jobId,
        message: 'Job enqueued successfully',
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error({
        error: err.message,
        message: 'Failed to enqueue energy sieves job',
      });

      return {
        success: false,
        error: err.message,
      };
    }
  }

  @Post('jobs/listings')
  @HttpCode(HttpStatus.ACCEPTED)
  async enqueueListings(
    @Body('source') source?: string,
    @Body('afterDate') afterDate?: string,
    @Body('beforeDate') beforeDate?: string,
    @Body('energyGradesMax') energyGradesMax?: string,
    @Body('propertyTypes') propertyTypes?: string[],
    @Body('departmentCode') departmentCode?: string,
  ) {
    try {
      const { id: jobId } = await this.listingsQueue.add(
        'source-listings',
        {
          source,
          filters: {
            afterDate,
            beforeDate,
            energyGradesMax,
            propertyTypes,
            departmentCode,
          },
        },
        {
          removeOnComplete: 100,
          removeOnFail: 100,
        },
      );

      this.logger.log({
        jobId,
        source,
        filters: {
          afterDate,
          beforeDate,
          energyGradesMax,
          propertyTypes,
          departmentCode,
        },
        message: 'Listings sourcing job enqueued',
      });

      return {
        success: true,
        jobId,
        message: 'Listings sourcing job enqueued successfully',
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error({
        error: err.message,
        message: 'Failed to enqueue listings sourcing job',
      });

      return {
        success: false,
        error: err.message,
      };
    }
  }
}
