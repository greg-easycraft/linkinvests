export interface AuctionListing {
  url: string;
  auctionDate?: string;
}

export interface AuctionExtraData {
  price?: number;
  propertyType?: string;
  description?: string;
  squareFootage?: number;
  auctionVenue?: string;
}

export interface AuctionOpportunity {
  label: string;
  address: string;
  zipCode: number;
  department: number;
  latitude: number;
  longitude: number;
  auctionDate: string;
  extraData?: AuctionExtraData;
  images?: string[];
}

export interface ScraperResult {
  success: boolean;
  totalFound: number;
  totalProcessed: number;
  totalInserted: number;
  errors: string[];
}
