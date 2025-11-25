import { PropertyType } from "@linkinvests/shared";

// Property types for auctions
export const PROPERTY_TYPE_OPTIONS = [
  { value: PropertyType.HOUSE, label: 'Maison' },
  { value: PropertyType.FLAT, label: 'Appartement' },
  { value: PropertyType.LAND, label: 'Terrain' },
  { value: PropertyType.COMMERCIAL, label: 'Local Commercial' },
  { value: PropertyType.OTHER, label: 'Autre' },
] as const;
