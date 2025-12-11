import { BaseOpportunity } from './base-opportunity.types';
import {
  AuctionOccupationStatus,
  AuctionSource,
  EnergyClassType,
  GazClassType,
  PropertyType,
} from '../constants/opportunity';

export interface Auction extends BaseOpportunity {
  // Auction-specific fields
  url: string;
  propertyType?: PropertyType;
  description?: string;
  squareFootage?: number;
  rooms?: number;
  energyClass: EnergyClassType;
  gazClass: GazClassType;
  auctionVenue?: string;
  // Price fields (normalized from extraData)
  currentPrice?: number;
  reservePrice?: number;
  lowerEstimate?: number;
  upperEstimate?: number;
  // Picture fields (normalized from images)
  mainPicture?: string;
  pictures?: string[];
  // Auction house contact info as JSONB
  auctionHouseContact?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    auctioneer?: string;
    registrationRequired?: boolean;
    depositAmount?: number;
  };
  source: AuctionSource;
  occupationStatus: AuctionOccupationStatus;
}

export type AuctionInput = Omit<Auction, 'id' | 'createdAt' | 'updatedAt'>;
