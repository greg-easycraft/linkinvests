export const DEFAULT_PAGE_SIZE = 25;

export const RENTAL_STATUS_OPTIONS = [
  { value: false, label: 'Libre' },
  { value: true, label: 'Occupé' },
] as const;

export const SELLER_TYPE_OPTIONS = [
  { value: undefined, label: 'Tous' },
  { value: 'individual', label: 'Particulier' },
  { value: 'professional', label: 'Professionnel' },
] as const;