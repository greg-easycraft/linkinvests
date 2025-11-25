import { AuctionOccupationStatus } from "@linkinvests/shared";

// Occupation status options for auctions
export const OCCUPATION_STATUS_OPTIONS = [
  { value: AuctionOccupationStatus.OCCUPIED_BY_OWNER, label: 'Occupé' },
  { value: AuctionOccupationStatus.RENTED, label: 'Loué' },
  { value: AuctionOccupationStatus.FREE, label: "Libre de toute occupation" },
  { value: AuctionOccupationStatus.UNKNOWN, label: 'NC' },
] as const;
