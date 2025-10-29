export interface AuctionListing {
  url: string;
  auctionDate?: string;
}

export interface AuctionOpportunity {
  label: string;
  address: string;
  zipCode: number;
  department: number;
  latitude: number;
  longitude: number;
  price?: number;
  auctionDate: string;
  propertyType?: string;
  description?: string;
}

export interface ScraperResult {
  success: boolean;
  totalFound: number;
  totalProcessed: number;
  totalInserted: number;
  errors: string[];
}
