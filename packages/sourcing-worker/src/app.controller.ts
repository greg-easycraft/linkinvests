import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  SOURCE_COMPANY_BUILDINGS_QUEUE,
  SOURCE_DECEASES_QUEUE,
  SOURCE_ENERGY_SIEVES_QUEUE,
  SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE,
} from '@linkinvests/shared';

@Controller()
export class AppController {
  constructor(
    @InjectQueue(SOURCE_COMPANY_BUILDINGS_QUEUE)
    private readonly companyBuildingsQueue: Queue,
    @InjectQueue(SOURCE_DECEASES_QUEUE)
    private readonly deceasesQueue: Queue,
    @InjectQueue(SOURCE_ENERGY_SIEVES_QUEUE)
    private readonly energySievesQueue: Queue,
    @InjectQueue(SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE)
    private readonly failingCompaniesQueue: Queue,
  ) {}

  @Post('jobs/failing-companies')
  @HttpCode(HttpStatus.ACCEPTED)
  async enqueueFailingCompanies(
    @Body('departmentId') departmentId: number,
    @Body('sinceDate') sinceDate: string,
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
        },
        {
          removeOnComplete: 100,
          removeOnFail: 100,
        },
      );

      return {
        success: true,
        jobId,
        message: 'Job enqueued successfully',
      };
    } catch (error) {
      const err = error as Error;
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

      return {
        success: true,
        jobId,
        message: 'Job enqueued successfully',
      };
    } catch (error) {
      const err = error as Error;
      return {
        success: false,
        error: err.message,
      };
    }
  }

  @Post('jobs/deceases')
  @HttpCode(HttpStatus.ACCEPTED)
  async enqueueDeceases(
    @Body('sinceDate') sinceDate: string,
    @Body('untilDate') untilDate?: string,
  ) {
    try {
      if (!sinceDate) {
        return {
          success: false,
          error: 'sinceDate is required (format: YYYY-MM-DD)',
        };
      }

      const { id: jobId } = await this.deceasesQueue.add(
        'import-deceases',
        {
          sinceDate,
          untilDate,
        },
        {
          removeOnComplete: 100,
          removeOnFail: 100,
        },
      );

      return {
        success: true,
        jobId,
        message: 'Job enqueued successfully',
      };
    } catch (error) {
      const err = error as Error;
      return {
        success: false,
        error: err.message,
      };
    }
  }

  @Post('jobs/energy-sieves')
  @HttpCode(HttpStatus.ACCEPTED)
  async enqueueEnergySieves(
    @Body('departmentId') departmentId: number,
    @Body('sinceDate') sinceDate: string,
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
          energyClasses: energyClasses || ['F', 'G'],
        },
        {
          removeOnComplete: 100,
          removeOnFail: 100,
        },
      );

      return {
        success: true,
        jobId,
        message: 'Job enqueued successfully',
      };
    } catch (error) {
      const err = error as Error;
      return {
        success: false,
        error: err.message,
      };
    }
  }

  // @Post('cron/test-failing-companies')
  // @HttpCode(HttpStatus.ACCEPTED)
  // async testFailingCompaniesCron() {
  //   try {
  //     await this.failingCompaniesCron.handleDailyFailingCompanies();
  //     return {
  //       success: true,
  //       message: 'Cron job triggered manually',
  //     };
  //   } catch (error) {
  //     const err = error as Error;
  //     return {
  //       success: false,
  //       error: err.message,
  //     };
  //   }
  // }
}
