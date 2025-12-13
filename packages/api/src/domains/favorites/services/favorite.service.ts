import { Injectable, Logger } from '@nestjs/common';

import {
  OpportunityType,
  SuccessionFavoriteStatus,
  type GroupedFavorites,
} from '@linkinvests/shared';

import {
  type OperationResult,
  refuse,
  succeed,
} from '~/common/utils/operation-result';

import {
  FavoriteAuctionRepository,
  FavoriteEnergyDiagnosticsRepository,
  FavoriteEventRepository,
  FavoriteLiquidationRepository,
  FavoriteListingRepository,
  FavoriteRepository,
  FavoriteSuccessionRepository,
} from '../lib.types';

export enum FavoriteServiceErrorReason {
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  NOT_FOUND = 'NOT_FOUND',
  EMAIL_ALREADY_SENT = 'EMAIL_ALREADY_SENT',
  NOT_SUCCESSION_TYPE = 'NOT_SUCCESSION_TYPE',
  NO_MAIRIE_EMAIL = 'NO_MAIRIE_EMAIL',
  EMAIL_SEND_FAILED = 'EMAIL_SEND_FAILED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

@Injectable()
export class FavoriteService {
  private readonly logger = new Logger(FavoriteService.name);

  constructor(
    private readonly favoriteRepository: FavoriteRepository,
    private readonly favoriteEventRepository: FavoriteEventRepository,
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

      const favorite = await this.favoriteRepository.add(
        userId,
        opportunityId,
        opportunityType,
      );

      // Create initial event for audit log
      await this.favoriteEventRepository.create(
        favorite.id,
        'added_to_favorites',
        userId,
      );

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

  async markEmailSent(
    userId: string,
    favoriteId: string,
  ): Promise<OperationResult<void, FavoriteServiceErrorReason>> {
    try {
      // 1. Fetch the favorite
      const favorite = await this.favoriteRepository.findById(favoriteId);
      if (!favorite) {
        return refuse(FavoriteServiceErrorReason.NOT_FOUND);
      }

      // 2. Verify ownership
      if (favorite.userId !== userId) {
        return refuse(FavoriteServiceErrorReason.NOT_FOUND);
      }

      // 3. Verify it's a succession type
      if (favorite.opportunityType !== OpportunityType.SUCCESSION) {
        return refuse(FavoriteServiceErrorReason.NOT_SUCCESSION_TYPE);
      }

      // 4. Check if email already sent
      if (favorite.status === SuccessionFavoriteStatus.EMAIL_SENT) {
        return refuse(FavoriteServiceErrorReason.EMAIL_ALREADY_SENT);
      }

      // 5. Update favorite status
      await this.favoriteRepository.updateStatus(
        favoriteId,
        SuccessionFavoriteStatus.EMAIL_SENT,
      );

      // 6. Create event for audit log
      await this.favoriteEventRepository.create(favoriteId, 'email_sent', userId);

      return succeed(undefined);
    } catch (error) {
      this.logger.error('Failed to mark email as sent', error);
      return refuse(FavoriteServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  async getUserFavoritesGrouped(
    userId: string,
  ): Promise<OperationResult<GroupedFavorites, FavoriteServiceErrorReason>> {
    try {
      const allFavorites = await this.favoriteRepository.findByUser(userId);

      // Create a map from opportunityId to favorite info
      const favoriteMap = new Map(
        allFavorites.map((fav) => [
          fav.opportunityId,
          { favoriteId: fav.id, status: fav.status },
        ]),
      );

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

      // Merge favorite info with opportunity data
      const mergeWithFavoriteInfo = <T extends { id: string }>(
        items: T[],
      ): (T & { favoriteId: string; status: string })[] =>
        items.map((item) => {
          const favInfo = favoriteMap.get(item.id);
          return {
            ...item,
            favoriteId: favInfo?.favoriteId ?? '',
            status: favInfo?.status ?? 'added_to_favorites',
          };
        });

      return succeed({
        auctions: mergeWithFavoriteInfo(auctions),
        listings: mergeWithFavoriteInfo(listings),
        successions: mergeWithFavoriteInfo(successions),
        liquidations: mergeWithFavoriteInfo(liquidations),
        energySieves: mergeWithFavoriteInfo(energySieves),
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
