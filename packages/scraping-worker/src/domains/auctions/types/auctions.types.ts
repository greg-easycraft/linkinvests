export interface AuctionListing {
  url: string;
  auctionDate?: string;
}

// Local type for scraping worker - includes URL and uses auctionDate
export interface AuctionOpportunity {
  url: string; // URL of the auction listing (for externalId)
  label: string;
  address: string;
  zipCode: number;
  department: number;
  latitude: number;
  longitude: number;
  auctionDate: string; // Will be mapped to opportunityDate in repository
  extraData?: {
    price?: number;
    propertyType?: string;
    description?: string;
    squareFootage?: number;
    auctionVenue?: string; // Will be used for contactData
  };
  images?: string[];
}

export interface ScraperResult {
  success: boolean;
  totalFound: number;
  totalProcessed: number;
  totalInserted: number;
  errors: string[];
}
