import { Injectable, Logger } from '@nestjs/common';
import { UserQuickActionsRepository } from '../lib.types';
import {
  type QuickActionId,
  DEFAULT_QUICK_ACTIONS,
} from '@linkinvests/shared';
import {
  type OperationResult,
  succeed,
  refuse,
} from '~/common/utils/operation-result';

export enum UserPreferencesServiceErrorReason {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

@Injectable()
export class UserPreferencesService {
  private readonly logger = new Logger(UserPreferencesService.name);

  constructor(
    private readonly userQuickActionsRepository: UserQuickActionsRepository,
  ) {}

  async getQuickActions(
    userId: string,
  ): Promise<OperationResult<QuickActionId[], UserPreferencesServiceErrorReason>> {
    try {
      const result = await this.userQuickActionsRepository.findByUserId(userId);
      if (!result) {
        // Return defaults if user has no saved preferences
        return succeed([...DEFAULT_QUICK_ACTIONS]);
      }
      return succeed(result.actions);
    } catch (error) {
      this.logger.error('Failed to get quick actions', error);
      return refuse(UserPreferencesServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  async updateQuickActions(
    userId: string,
    actions: QuickActionId[],
  ): Promise<OperationResult<QuickActionId[], UserPreferencesServiceErrorReason>> {
    try {
      const result = await this.userQuickActionsRepository.upsert(userId, actions);
      return succeed(result.actions);
    } catch (error) {
      this.logger.error('Failed to update quick actions', error);
      return refuse(UserPreferencesServiceErrorReason.UNKNOWN_ERROR);
    }
  }
}
