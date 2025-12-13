import type { OpportunityType } from '../constants/opportunity.js';
import type { Auction } from './auction.types.js';
import type { EnergyDiagnostic } from './energy-diagnostic.types.js';
import type { Liquidation } from './liquidation.types.js';
import type { Listing } from './listing.types.js';
import type { Succession } from './succession.types.js';

// Type-specific status enums
// Each opportunity type can have its own set of statuses

export enum SuccessionFavoriteStatus {
  ADDED_TO_FAVORITES = 'added_to_favorites',
  EMAIL_SENT = 'email_sent',
}

export enum AuctionFavoriteStatus {
  ADDED_TO_FAVORITES = 'added_to_favorites',
}

export enum ListingFavoriteStatus {
  ADDED_TO_FAVORITES = 'added_to_favorites',
}

export enum LiquidationFavoriteStatus {
  ADDED_TO_FAVORITES = 'added_to_favorites',
}

export enum EnergySieveFavoriteStatus {
  ADDED_TO_FAVORITES = 'added_to_favorites',
}

// Base status that all types share
export const BASE_FAVORITE_STATUS = 'added_to_favorites';

export interface Favorite {
  id: string;
  userId: string;
  opportunityId: string;
  opportunityType: OpportunityType;
  status: string;
  statusUpdatedAt: Date | null;
  createdAt: Date;
}

export interface FavoriteEvent {
  id: string;
  favoriteId: string;
  eventType: string;
  createdBy: string;
  createdAt: Date;
}

export interface GroupedFavorites {
  auctions: (Auction & { favoriteId: string; status: string })[];
  listings: (Listing & { favoriteId: string; status: string })[];
  successions: (Succession & { favoriteId: string; status: string })[];
  liquidations: (Liquidation & { favoriteId: string; status: string })[];
  energySieves: (EnergyDiagnostic & { favoriteId: string; status: string })[];
}
