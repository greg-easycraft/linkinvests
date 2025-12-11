import { Injectable, Logger } from '@nestjs/common';
import { SavedSearchRepository } from '../lib.types';
import type { SavedSearch } from '@linkinvests/shared';
import {
  type OperationResult,
  succeed,
  refuse,
} from '~/common/utils/operation-result';

export enum SavedSearchServiceErrorReason {
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  LIMIT_EXCEEDED = 'LIMIT_EXCEEDED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

const MAX_SAVED_SEARCHES_PER_USER = 50;

@Injectable()
export class SavedSearchService {
  private readonly logger = new Logger(SavedSearchService.name);

  constructor(private readonly savedSearchRepository: SavedSearchRepository) {}

  async getUserSavedSearches(
    userId: string,
  ): Promise<OperationResult<SavedSearch[], SavedSearchServiceErrorReason>> {
    console.log('getUserSavedSearches', userId);
    try {
      const searches =
        await this.savedSearchRepository.findAllByUserId(userId);
      return succeed(searches);
    } catch (error) {
      this.logger.error('Failed to get saved searches', error);
      return refuse(SavedSearchServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  async createSavedSearch(
    userId: string,
    data: { name: string; url: string },
  ): Promise<OperationResult<SavedSearch, SavedSearchServiceErrorReason>> {
    try {
      const count = await this.savedSearchRepository.countByUserId(userId);
      if (count >= MAX_SAVED_SEARCHES_PER_USER) {
        return refuse(SavedSearchServiceErrorReason.LIMIT_EXCEEDED);
      }

      const savedSearch = await this.savedSearchRepository.create({
        userId,
        name: data.name,
        url: data.url,
      });
      return succeed(savedSearch);
    } catch (error) {
      this.logger.error('Failed to create saved search', error);
      return refuse(SavedSearchServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  async deleteSavedSearch(
    userId: string,
    searchId: string,
  ): Promise<OperationResult<void, SavedSearchServiceErrorReason>> {
    try {
      const search = await this.savedSearchRepository.findById(searchId);
      if (!search) {
        return refuse(SavedSearchServiceErrorReason.NOT_FOUND);
      }
      if (search.userId !== userId) {
        return refuse(SavedSearchServiceErrorReason.UNAUTHORIZED);
      }

      await this.savedSearchRepository.delete(searchId);
      return succeed(undefined);
    } catch (error) {
      this.logger.error('Failed to delete saved search', error);
      return refuse(SavedSearchServiceErrorReason.UNKNOWN_ERROR);
    }
  }
}
