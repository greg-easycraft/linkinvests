// Base types
export * from './base-opportunity.types.js';

// Specific opportunity types
export * from './auction.types.js';
export * from './succession.types.js';
export * from './liquidation.types.js';
export * from './energy-diagnostic.types.js';

import { Auction } from './auction.types.js';
import { Succession } from './succession.types.js';
import { Liquidation } from './liquidation.types.js';
import { EnergyDiagnostic } from './energy-diagnostic.types.js';

export type Opportunity = Auction | Succession | Liquidation | EnergyDiagnostic;