// Shared utility types and constants

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

// Domain types
export const OpportunityType = {
  SUCCESSION: 'succession',
  LIQUIDATION: 'liquidation',
  PASSOIRE_THERMIQUE: 'passoire_thermique',
  ANNONCE_IMMO: 'annonce_immo',
  ENCHERE: 'enchere',
  DIVORCE: 'divorce',
} as const;

export type OpportunityType = typeof OpportunityType[keyof typeof OpportunityType];

// Add more shared types here as needed
