import { ListingSource, PropertyType } from '@linkinvests/shared';

// Raw listing opportunity (before geocoding)
export interface RawListingOpportunity {
  url: string;
  source: ListingSource;
  label: string;
  address?: string;
  city: string;
  zipCode: string;
  department: string; // e.g., "75", "92"
  latitude?: number;
  longitude?: number;
  opportunityDate: Date; // ISO date string
  externalId: string; // Generated from notary listing ID
  // Listing-specific fields
  transactionType: string; // "VENTE", "VNI", "VAE"
  propertyType: PropertyType;
  price?: number;
  priceType?: string; // e.g., "FAI", "CC", etc.
  description?: string;
  squareFootage?: number;
  landArea?: number;
  rooms?: number;
  bedrooms?: number;
  dpe?: string; // Energy performance diagnosis
  constructionYear?: number;
  floor?: number;
  totalFloors?: number;
  balcony?: boolean;
  terrace?: boolean;
  garden?: boolean;
  garage?: boolean;
  parking?: boolean;
  elevator?: boolean;
  // Images
  images?: string[];
  // Notary contact information
  notaryOffice?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    contact?: string;
  };
  // Additional data that might be extracted
  extraData?: Record<string, any>;
}

// Listing opportunity after geocoding
export interface ListingOpportunity extends RawListingOpportunity {
  zipCode: string; // Required after geocoding
  latitude: number; // Required after geocoding
  longitude: number; // Required after geocoding
  images: string[]; // Required (empty array if none)
}

// Pagination and extraction types
export interface ListingPageInfo {
  currentPage: number;
  totalPages?: number;
  hasNextPage: boolean;
  nextPageUrl?: string;
  totalListings?: number;
}

export interface ListingExtractionResult {
  urls: string[];
  pageInfo: ListingPageInfo;
  extractedAt: Date;
}

// Configuration for listing scraping
export interface ListingScrapingConfig {
  baseUrl: string;
  maxPages?: number;
  delayBetweenPages?: number;
  delayBetweenListings?: number;
  maxRetries?: number;
  screenshots?: boolean;
}

// Scraping statistics
export interface ListingScrapingStats {
  totalListingsFound: number;
  totalListingsProcessed: number;
  successfulListings: number;
  failedListings: number;
  geocodedListings: number;
  listingsWithImages: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  pagesProcessed: number;
  errors: string[];
}
