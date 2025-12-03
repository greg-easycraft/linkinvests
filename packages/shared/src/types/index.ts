// Base types
export * from './base-opportunity.types';

// Specific opportunity types
export * from './auction.types';
export * from './succession.types';
export * from './liquidation.types';
export * from './energy-diagnostic.types';
export * from './listing.types';

// Address search types
export * from './address-search.types';

import { Auction } from './auction.types';
import { Succession } from './succession.types';
import { Liquidation } from './liquidation.types';
import { EnergyDiagnostic } from './energy-diagnostic.types';
import { Listing } from './listing.types';

export type Opportunity =
  | Auction
  | Succession
  | Liquidation
  | EnergyDiagnostic
  | Listing;
