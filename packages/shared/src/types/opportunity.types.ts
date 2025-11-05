import { OpportunityType } from "../constants/opportunity";


interface BaseOpportunity {
  externalId?: string; // Made optional to match nullable database column
  type: OpportunityType;
  label: string;
  address: string;
  zipCode: number;
  department: number;
  latitude: number;
  longitude: number;
  opportunityDate: string;
  extraData?: unknown;
  images?: string[];
  contactData?: unknown;
}

// Contact Data Types
export interface MairieContactData {
  type: 'mairie';
  name: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  openingHours?: string;
}

export interface CompanyContactData {
  type: 'company_headquarters';
  companyName: string;
  siret: string;
  address: string;
  phone?: string;
  email?: string;
  legalRepresentative?: string;
  administrateur?: string;
}

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

export interface SuccessionOpportunity extends BaseOpportunity {
  type: OpportunityType.SUCCESSION;
  contactData?: MairieContactData;
}

export interface LiquidationOpportunity extends BaseOpportunity {
  type: OpportunityType.LIQUIDATION;
  contactData?: CompanyContactData;
}

export interface AuctionExtraData {
  price?: number;
  propertyType?: string;
  description?: string;
  squareFootage?: number;
  auctionVenue?: string;
  url: string;
}

export interface AuctionOpportunity extends BaseOpportunity {
  type: OpportunityType.AUCTION;
  extraData: AuctionExtraData;
  contactData?: AuctionHouseContactData;
}

export interface EnergySieveExtraData {
  energyClass?: string;
}

export interface EnergySieveOpportunity extends BaseOpportunity {
  extraData: EnergySieveExtraData;
  type: OpportunityType.ENERGY_SIEVE;
}

export interface RealEstateListingOpportunity extends BaseOpportunity {
  type: OpportunityType.REAL_ESTATE_LISTING;
}

export interface DivorceOpportunity extends BaseOpportunity {
  type: OpportunityType.DIVORCE;
}

export type Opportunity = SuccessionOpportunity | LiquidationOpportunity | AuctionOpportunity | EnergySieveOpportunity | RealEstateListingOpportunity | DivorceOpportunity;