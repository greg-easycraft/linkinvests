import { ListingSource, PropertyType } from '../constants/opportunity.js';
import { BaseOpportunity, BaseOpportunityInput } from './base-opportunity.types.js';


export interface Listing extends BaseOpportunity {
  // Listing-specific fields
  url: string;
  source: ListingSource;
  transactionType: string; // "VENTE", "VENTE_EN_L_ETAT_FUTUR_D_ACHEVEMENT", "VENTE_AUX_ENCHERES", etc.
  propertyType: PropertyType;
  description?: string;
  squareFootage?: number;
  landArea?: number;
  rooms?: number;
  bedrooms?: number;
  dpe?: string; // Energy performance diagnosis (A-G)
  constructionYear?: number;
  floor?: number;
  totalFloors?: number;
  balcony?: boolean;
  terrace?: boolean;
  garden?: boolean;
  garage?: boolean;
  parking?: boolean;
  elevator?: boolean;

  // Price fields
  price?: number;
  priceType?: string; // "FAI" (fees included), "CC" (charges comprises), etc.
  fees?: number;
  charges?: number;

  // Picture fields (normalized from images)
  mainPicture?: string;
  pictures?: string[];

  // Notary office contact info as JSONB
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

export interface ListingInput extends BaseOpportunityInput {
  // Listing-specific fields
  url: string;
  transactionType: string;
  propertyType: string;
  description?: string;
  squareFootage?: number;
  landArea?: number;
  rooms?: number;
  bedrooms?: number;
  dpe?: string;
  constructionYear?: number;
  floor?: number;
  totalFloors?: number;
  balcony?: boolean;
  terrace?: boolean;
  garden?: boolean;
  garage?: boolean;
  parking?: boolean;
  elevator?: boolean;

  // Price fields
  price?: number;
  priceType?: string;
  fees?: number;
  charges?: number;

  // Picture fields
  mainPicture?: string;
  pictures?: string[];

  // Notary office contact info as JSONB
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

// Legacy interface for backward compatibility during migration
export interface sellerContactData {
  type: 'notary';
  name: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  contact?: string;
  siret?: string;
}