// Base types
export * from './base-opportunity.types.js';

// Specific opportunity types
export * from './auction-opportunity.types.js';
export * from './succession-opportunity.types.js';
export * from './liquidation-opportunity.types.js';
export * from './energy-sieve-opportunity.types.js';

// Legacy types that don't conflict (OpportunityType enum and union types)
export { OpportunityType, Opportunity } from './opportunity.types.js';