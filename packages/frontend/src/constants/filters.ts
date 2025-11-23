export const DEFAULT_PAGE_SIZE = 25;

export const RENTAL_STATUS_OPTIONS = [
  { value: undefined, label: 'Tous' },
  { value: true, label: 'Occupé' },
  { value: false, label: 'Libre' },
] as const;

export const SELLER_TYPE_OPTIONS = [
  { value: undefined, label: 'Tous' },
  { value: 'individual', label: 'Particulier' },
  { value: 'professional', label: 'Professionnel' },
] as const;