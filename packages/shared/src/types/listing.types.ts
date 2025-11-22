import { PropertyType } from '../constants/opportunity.js';
import { BaseOpportunity } from './base-opportunity.types.js';


export interface Listing extends BaseOpportunity {
  // Listing-specific fields
  url: string;
  source: string;
  transactionType: string; // "VENTE", "VENTE_EN_L_ETAT_FUTUR_D_ACHEVEMENT", "VENTE_AUX_ENCHERES", etc.
  propertyType: PropertyType;
  description?: string;
  squareFootage?: number;
  landArea?: number;
  rooms?: number;
  bedrooms?: number;
  energyClass?: string; // Energy performance diagnosis (A-G)
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

export type ListingInput = Omit<Listing, 'id' | 'createdAt' | 'updatedAt'> ;
