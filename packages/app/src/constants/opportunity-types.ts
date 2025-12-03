import { OpportunityType } from '@linkinvests/shared'

/**
 * Display labels for opportunity types (French)
 */
export const TYPE_LABELS: Record<OpportunityType, string> = {
  [OpportunityType.SUCCESSION]: 'Succession',
  [OpportunityType.LIQUIDATION]: 'Liquidation',
  [OpportunityType.ENERGY_SIEVE]: 'Passoire énergétique',
  [OpportunityType.REAL_ESTATE_LISTING]: 'Annonce immobilière',
  [OpportunityType.AUCTION]: 'Vente aux enchères',
  [OpportunityType.DIVORCE]: 'Divorce',
}

/**
 * Color scheme for opportunity types
 * These colors are used consistently across map markers, badges, and other UI elements
 */
export const TYPE_COLORS: Record<OpportunityType, string> = {
  [OpportunityType.SUCCESSION]: '#3b82f6',
  [OpportunityType.LIQUIDATION]: '#ef4444',
  [OpportunityType.ENERGY_SIEVE]: '#10b981',
  [OpportunityType.REAL_ESTATE_LISTING]: '#f59e0b',
  [OpportunityType.AUCTION]: '#8b5cf6',
  [OpportunityType.DIVORCE]: '#ec4899',
}

/**
 * URL paths for each opportunity type
 */
export const OPPORTUNITY_TYPE_PATHS: Record<OpportunityType, string> = {
  [OpportunityType.AUCTION]: '/search/auctions',
  [OpportunityType.REAL_ESTATE_LISTING]: '/search/listings',
  [OpportunityType.SUCCESSION]: '/search/successions',
  [OpportunityType.LIQUIDATION]: '/search/liquidations',
  [OpportunityType.ENERGY_SIEVE]: '/search/energy-sieves',
  [OpportunityType.DIVORCE]: '/search/divorces',
}
