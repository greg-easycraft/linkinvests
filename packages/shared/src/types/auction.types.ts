import { BaseOpportunity, BaseOpportunityInput } from './base-opportunity.types.js';
import { AuctionSource, PropertyType } from '../constants/opportunity.js';

export interface Auction extends BaseOpportunity {
  // Auction-specific fields
  url: string;
  auctionType?: string;
  propertyType?: PropertyType;
  description?: string;
  squareFootage?: number;
  rooms?: number;
  dpe?: string;
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

export interface AuctionInput extends BaseOpportunityInput {
  // Auction-specific fields
  url: string;
  auctionType?: string;
  propertyType?: string;
  description?: string;
  squareFootage?: number;
  rooms?: number;
  dpe?: string;
  auctionVenue?: string;
  // Price fields
  currentPrice?: number;
  reservePrice?: number;
  lowerEstimate?: number;
  upperEstimate?: number;
  // Picture fields
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
}

// Legacy interface for backward compatibility during migration
export interface AuctionHouseContactData {
  type: 'auction_house';
  name: string;
  address: string;
  phone?: string;
  email?: string;
  auctioneer?: string;
  registrationRequired?: boolean;
  depositAmount?: number;
}
