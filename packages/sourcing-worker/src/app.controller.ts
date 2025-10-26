import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { QueueService } from './bullmq/queue.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly queueService: QueueService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

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

      const jobId = await this.queueService.sourceFailingCompanies({
        departmentId,
        sinceDate,
      });
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

      const jobId = await this.queueService.sourceCompanyBuildings({
        sourceFile,
      });
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
}
