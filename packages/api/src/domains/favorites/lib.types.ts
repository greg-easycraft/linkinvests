import type {
  Auction,
  EnergyDiagnostic,
  Favorite,
  Liquidation,
  Listing,
  OpportunityType,
  Succession,
} from '@linkinvests/shared';

export abstract class FavoriteRepository {
  abstract add(
    userId: string,
    opportunityId: string,
    opportunityType: OpportunityType,
  ): Promise<Favorite>;

  abstract remove(
    userId: string,
    opportunityId: string,
    opportunityType: OpportunityType,
  ): Promise<boolean>;

  abstract exists(
    userId: string,
    opportunityId: string,
    opportunityType: OpportunityType,
  ): Promise<boolean>;

  abstract findByUser(userId: string): Promise<Favorite[]>;

  abstract findByUserAndType(
    userId: string,
    opportunityType: OpportunityType,
  ): Promise<Favorite[]>;

  abstract checkMultiple(
    userId: string,
    opportunityIds: string[],
    opportunityType: OpportunityType,
  ): Promise<Set<string>>;
}

// Opportunity repository abstractions for favorites domain
// These allow the favorites domain to query opportunity tables without importing other domains

export abstract class FavoriteAuctionRepository {
  abstract findByIds(ids: Array<string>): Promise<Array<Auction>>;
}

export abstract class FavoriteListingRepository {
  abstract findByIds(ids: Array<string>): Promise<Array<Listing>>;
}

export abstract class FavoriteSuccessionRepository {
  abstract findByIds(ids: Array<string>): Promise<Array<Succession>>;
}

export abstract class FavoriteLiquidationRepository {
  abstract findByIds(ids: Array<string>): Promise<Array<Liquidation>>;
}

export abstract class FavoriteEnergyDiagnosticsRepository {
  abstract findByIds(ids: Array<string>): Promise<Array<EnergyDiagnostic>>;
}
