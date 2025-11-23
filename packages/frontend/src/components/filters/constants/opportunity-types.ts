import { OpportunityType } from "@linkinvests/shared";

// @ts-expect-error - TODO: Add real estate listing and divorce types
export const OPPORTUNITY_TYPE_LABELS: Record<OpportunityType, string> = {
  [OpportunityType.SUCCESSION]: "Successions",
  [OpportunityType.LIQUIDATION]: "Liquidations",
  [OpportunityType.ENERGY_SIEVE]: "Passoires énergétiques",
  [OpportunityType.REAL_ESTATE_LISTING]: "Annonces immobilières",
  [OpportunityType.AUCTION]: "Ventes aux enchères",
  // [OpportunityType.DIVORCE]: "Divorces",
};

export const OPPORTUNITY_TYPE_TO_PATH: Record<OpportunityType, string> = {
  [OpportunityType.SUCCESSION]: "successions",
  [OpportunityType.LIQUIDATION]: "liquidations",
  [OpportunityType.ENERGY_SIEVE]: "energy-sieves",
  [OpportunityType.REAL_ESTATE_LISTING]: "listings",
  [OpportunityType.AUCTION]: "auctions",
  [OpportunityType.DIVORCE]: "divorces",
};

// Custom order for dropdown display - Succession last
export const OPPORTUNITY_TYPE_DISPLAY_ORDER: OpportunityType[] = [
  OpportunityType.LIQUIDATION,
  OpportunityType.ENERGY_SIEVE,
  OpportunityType.REAL_ESTATE_LISTING,
  OpportunityType.AUCTION,
  OpportunityType.SUCCESSION, // Last
];