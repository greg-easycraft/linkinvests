export interface RealEstateListing {
  // Basic information
  title: string;
  price: string;
  location: string;
  description: string;
  publicationDate: string;
  url: string;

  // Property details
  surfaceArea?: string;
  rooms?: string;
  propertyType?: string;
  energyRating?: string;

  // Seller information
  sellerName?: string;
  sellerType?: string;
}

export interface ScraperConfig {
  department: string;
  daysBack: number;
  headless: boolean;
  outputFile: string;
}
