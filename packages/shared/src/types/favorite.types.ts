import type { OpportunityType } from '../constants/opportunity.js';
import type { Auction } from './auction.types.js';
import type { EnergyDiagnostic } from './energy-diagnostic.types.js';
import type { Liquidation } from './liquidation.types.js';
import type { Listing } from './listing.types.js';
import type { Succession } from './succession.types.js';

export interface Favorite {
  id: string;
  userId: string;
  opportunityId: string;
  opportunityType: OpportunityType;
  createdAt: Date;
}

export interface GroupedFavorites {
  auctions: Auction[];
  listings: Listing[];
  successions: Succession[];
  liquidations: Liquidation[];
  energySieves: EnergyDiagnostic[];
}
