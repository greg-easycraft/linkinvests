import type { EnergyClass, EnergyDiagnostic } from "@linkinvests/shared";

export const MAX_NUMBER_OF_RESULTS = 50;
export const MAX_DIAGNOSTIC_LINKS = 5;

export type DiagnosticQueryInput = {
  zipCode: string;
  energyClass: EnergyClass;
  squareFootageMin: number;
  squareFootageMax: number;
  address?: string;
  city?: string;
}

export type DiagnosticLinkInput = {
  opportunityId: string;
  energyDiagnosticId: string;
  matchScore: number;
}

export type DiagnosticLink = {
  id: string;
  energyDiagnosticId: string;
  matchScore: number;
  energyDiagnostic: {
    id: string;
    address: string;
    zipCode: string;
    energyClass: string;
    squareFootage: number;
    opportunityDate: string;
    externalId: string;
  };
}

export interface IAddressSearchRepository {
  findAllForAddressSearch(input: DiagnosticQueryInput): Promise<EnergyDiagnostic[]>;
  findById(id: string): Promise<EnergyDiagnostic | null>;
}

export interface IAddressLinksRepository {
  saveAuctionDiagnosticLinks(links: DiagnosticLinkInput[]): Promise<void>;
  saveListingDiagnosticLinks(links: DiagnosticLinkInput[]): Promise<void>;
  getAuctionDiagnosticLinks(auctionId: string): Promise<DiagnosticLink[]>;
  getListingDiagnosticLinks(listingId: string): Promise<DiagnosticLink[]>;
}