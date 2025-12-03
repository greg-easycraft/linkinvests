import { AuctionOccupationStatus } from '@linkinvests/shared'

/**
 * Occupation status options with French labels
 */
export interface OccupationStatusOption {
  value: AuctionOccupationStatus
  label: string
}

export const OCCUPATION_STATUS_OPTIONS: Array<OccupationStatusOption> = [
  { value: AuctionOccupationStatus.FREE, label: 'Libre' },
  {
    value: AuctionOccupationStatus.OCCUPIED_BY_OWNER,
    label: 'Occupé par le propriétaire',
  },
  { value: AuctionOccupationStatus.RENTED, label: 'Loué' },
  { value: AuctionOccupationStatus.UNKNOWN, label: 'Inconnu' },
]

/**
 * Get occupation status label
 */
export function getOccupationStatusLabel(
  value: AuctionOccupationStatus,
): string {
  const option = OCCUPATION_STATUS_OPTIONS.find((opt) => opt.value === value)
  return option?.label ?? value
}
