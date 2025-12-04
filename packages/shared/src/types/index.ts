// Base types
export * from './base-opportunity.types.js';

// Specific opportunity types
export * from './auction.types.js';
export * from './succession.types.js';
export * from './liquidation.types.js';
export * from './energy-diagnostic.types.js';
export * from './listing.types.js';

// Address search types
export * from './address-search.types.js';

// Filter types
export * from './filters.types.js';

import { Auction } from './auction.types.js';
import { Succession } from './succession.types.js';
import { Liquidation } from './liquidation.types.js';
import { EnergyDiagnostic } from './energy-diagnostic.types.js';
import { Listing } from './listing.types.js';

export type Opportunity =
  | Auction
  | Succession
  | Liquidation
  | EnergyDiagnostic
  | Listing;
