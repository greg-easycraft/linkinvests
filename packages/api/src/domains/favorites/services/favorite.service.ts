import { Injectable, Logger } from '@nestjs/common';

import { OpportunityType, type GroupedFavorites } from '@linkinvests/shared';

import {
  type OperationResult,
  refuse,
  succeed,
} from '~/common/utils/operation-result';

import {
  FavoriteAuctionRepository,
  FavoriteEnergyDiagnosticsRepository,
  FavoriteLiquidationRepository,
  FavoriteListingRepository,
  FavoriteRepository,
  FavoriteSuccessionRepository,
} from '../lib.types';

export enum FavoriteServiceErrorReason {
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

@Injectable()
export class FavoriteService {
  private readonly logger = new Logger(FavoriteService.name);

  constructor(
    private readonly favoriteRepository: FavoriteRepository,
    private readonly auctionRepository: FavoriteAuctionRepository,
    private readonly listingRepository: FavoriteListingRepository,
    private readonly successionRepository: FavoriteSuccessionRepository,
    private readonly liquidationRepository: FavoriteLiquidationRepository,
    private readonly energyDiagnosticsRepository: FavoriteEnergyDiagnosticsRepository,
  ) {}

  async addFavorite(
    userId: string,
    opportunityId: string,
    opportunityType: OpportunityType,
  ): Promise<OperationResult<void, FavoriteServiceErrorReason>> {
    try {
      // Check if already exists
      const exists = await this.favoriteRepository.exists(
        userId,
        opportunityId,
        opportunityType,
      );

      if (exists) {
        return refuse(FavoriteServiceErrorReason.ALREADY_EXISTS);
      }

      await this.favoriteRepository.add(userId, opportunityId, opportunityType);
      return succeed(undefined);
    } catch (error) {
      this.logger.error('Failed to add favorite', error);
      return refuse(FavoriteServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  async removeFavorite(
    userId: string,
    opportunityId: string,
    opportunityType: OpportunityType,
  ): Promise<OperationResult<void, FavoriteServiceErrorReason>> {
    try {
      const removed = await this.favoriteRepository.remove(
        userId,
        opportunityId,
        opportunityType,
      );

      if (!removed) {
        return refuse(FavoriteServiceErrorReason.NOT_FOUND);
      }

      return succeed(undefined);
    } catch (error) {
      this.logger.error('Failed to remove favorite', error);
      return refuse(FavoriteServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  async checkFavorite(
    userId: string,
    opportunityId: string,
    opportunityType: OpportunityType,
  ): Promise<OperationResult<boolean, FavoriteServiceErrorReason>> {
    try {
      const exists = await this.favoriteRepository.exists(
        userId,
        opportunityId,
        opportunityType,
      );
      return succeed(exists);
    } catch (error) {
      this.logger.error('Failed to check favorite', error);
      return refuse(FavoriteServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  async checkMultipleFavorites(
    userId: string,
    opportunityIds: string[],
    opportunityType: OpportunityType,
  ): Promise<OperationResult<string[], FavoriteServiceErrorReason>> {
    try {
      const favoriteIds = await this.favoriteRepository.checkMultiple(
        userId,
        opportunityIds,
        opportunityType,
      );
      return succeed(Array.from(favoriteIds));
    } catch (error) {
      this.logger.error('Failed to check multiple favorites', error);
      return refuse(FavoriteServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  async getUserFavoritesGrouped(
    userId: string,
  ): Promise<OperationResult<GroupedFavorites, FavoriteServiceErrorReason>> {
    try {
      const allFavorites = await this.favoriteRepository.findByUser(userId);

      // Group favorites by type
      const groupedIds = {
        auctions: [] as string[],
        listings: [] as string[],
        successions: [] as string[],
        liquidations: [] as string[],
        energySieves: [] as string[],
      };

      for (const fav of allFavorites) {
        switch (fav.opportunityType) {
          case OpportunityType.AUCTION:
            groupedIds.auctions.push(fav.opportunityId);
            break;
          case OpportunityType.REAL_ESTATE_LISTING:
            groupedIds.listings.push(fav.opportunityId);
            break;
          case OpportunityType.SUCCESSION:
            groupedIds.successions.push(fav.opportunityId);
            break;
          case OpportunityType.LIQUIDATION:
            groupedIds.liquidations.push(fav.opportunityId);
            break;
          case OpportunityType.ENERGY_SIEVE:
            groupedIds.energySieves.push(fav.opportunityId);
            break;
        }
      }

      // Fetch full opportunity data in parallel
      const [auctions, listings, successions, liquidations, energySieves] =
        await Promise.all([
          this.fetchAuctions(groupedIds.auctions),
          this.fetchListings(groupedIds.listings),
          this.fetchSuccessions(groupedIds.successions),
          this.fetchLiquidations(groupedIds.liquidations),
          this.fetchEnergySieves(groupedIds.energySieves),
        ]);

      return succeed({
        auctions,
        listings,
        successions,
        liquidations,
        energySieves,
      });
    } catch (error) {
      this.logger.error('Failed to get user favorites grouped', error);
      return refuse(FavoriteServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  private async fetchAuctions(ids: Array<string>) {
    if (ids.length === 0) return [];
    return this.auctionRepository.findByIds(ids);
  }

  private async fetchListings(ids: Array<string>) {
    if (ids.length === 0) return [];
    return this.listingRepository.findByIds(ids);
  }

  private async fetchSuccessions(ids: Array<string>) {
    if (ids.length === 0) return [];
    return this.successionRepository.findByIds(ids);
  }

  private async fetchLiquidations(ids: Array<string>) {
    if (ids.length === 0) return [];
    return this.liquidationRepository.findByIds(ids);
  }

  private async fetchEnergySieves(ids: Array<string>) {
    if (ids.length === 0) return [];
    return this.energyDiagnosticsRepository.findByIds(ids);
  }
}
