import { EnergyClassType, PropertyType } from '../constants/opportunity.js';
import { BaseOpportunity } from './base-opportunity.types.js';

export interface Listing extends BaseOpportunity {
  // Listing-specific fields
  url: string;
  source: string;
  propertyType: PropertyType;
  lastChangeDate: string;
  description?: string;
  squareFootage?: number;
  landArea?: number;
  rooms?: number;
  bedrooms?: number;
  energyClass: EnergyClassType;
  constructionYear?: number;
  floor?: number;
  totalFloors?: number;
  options?: string[];
  keywords?: string[];
  isSoldRented: boolean;

  // Price fields
  price?: number;
  priceType?: string; // "FAI" (fees included), "CC" (charges comprises), etc.
  fees?: number;
  charges?: number;

  // Picture fields (normalized from images)
  mainPicture?: string;
  pictures?: string[];
  sellerType: 'individual' | 'professional';
  // Seller contact info as JSONB
  sellerContact?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    contact?: string;
    siret?: string;
  };
}

export type ListingInput = Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>;
