// Property types for auctions
export const AUCTION_PROPERTY_TYPE_OPTIONS = [
  { value: 'house', label: 'Maison' },
  { value: 'apartment', label: 'Appartement' },
  { value: 'land', label: 'Terrain' },
  { value: 'commercial', label: 'Local commercial' },
  { value: 'industrial', label: 'Industriel' },
  { value: 'garage', label: 'Garage/Parking' },
] as const;

// Property types for listings
export const LISTING_PROPERTY_TYPE_OPTIONS = [
  { value: 'APP', label: 'Appartement' },
  { value: 'MAI', label: 'Maison' },
  { value: 'TER', label: 'Terrain' },
  { value: 'LOC', label: 'Local commercial' },
  { value: 'IMM', label: 'Immeuble' },
  { value: 'GAR', label: 'Garage/Parking' },
  { value: 'CAV', label: 'Cave' },
  { value: 'BOX', label: 'Box' },
] as const;