import { BaseOpportunity } from './base-opportunity.types.js';
import { AuctionSource, EnergyClass, PropertyType } from '../constants/opportunity.js';

export interface Auction extends BaseOpportunity {
  // Auction-specific fields
  url: string;
  propertyType?: PropertyType;
  description?: string;
  squareFootage?: number;
  rooms?: number;
  energyClass?: EnergyClass;
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
}

export type AuctionInput = Omit<Auction, 'id' | 'createdAt' | 'updatedAt'> ;



