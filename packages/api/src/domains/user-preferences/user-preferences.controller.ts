import {
  Controller,
  Get,
  Put,
  Body,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { Session, AuthGuard } from '@thallesp/nestjs-better-auth';
import type { AuthSession } from '~/common/auth/auth.types';
import { UserPreferencesService } from './services/user-preferences.service';
import {
  updateQuickActionsRequestSchema,
  type UpdateQuickActionsRequest,
} from '@linkinvests/shared';
import { isRefusal } from '~/common/utils/operation-result';

@Controller('user-preferences')
@UseGuards(AuthGuard)
export class UserPreferencesController {
  constructor(
    private readonly userPreferencesService: UserPreferencesService,
  ) {}

  @Get('quick-actions')
  async getQuickActions(@Session() session: AuthSession) {
    const result = await this.userPreferencesService.getQuickActions(
      session.user.id,
    );
    if (isRefusal(result)) {
      throw new InternalServerErrorException();
    }
    return { actions: result.data };
  }

  @Put('quick-actions')
  async updateQuickActions(
    @Session() session: AuthSession,
    @Body(new ZodValidationPipe(updateQuickActionsRequestSchema))
    body: UpdateQuickActionsRequest,
  ) {
    const result = await this.userPreferencesService.updateQuickActions(
      session.user.id,
      body.actions,
    );
    if (isRefusal(result)) {
      throw new InternalServerErrorException();
    }
    return { actions: result.data };
  }
}
