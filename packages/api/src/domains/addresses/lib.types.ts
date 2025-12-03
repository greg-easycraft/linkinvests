import type { EnergyClass, EnergyDiagnostic } from '@linkinvests/shared';

export const MAX_NUMBER_OF_RESULTS = 50;
export const MAX_DIAGNOSTIC_LINKS = 5;

export type DiagnosticQueryInput = {
  zipCode: string;
  energyClass: EnergyClass;
  squareFootageMin: number;
  squareFootageMax: number;
  address?: string;
  city?: string;
};

export type DiagnosticLinkInput = {
  opportunityId: string;
  energyDiagnosticId: string;
  matchScore: number;
};

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
};

export abstract class AddressSearchRepository {
  abstract findAllForAddressSearch(
    input: DiagnosticQueryInput,
  ): Promise<EnergyDiagnostic[]>;
  abstract findById(id: string): Promise<EnergyDiagnostic | null>;
}

export abstract class AddressLinksRepository {
  abstract saveAuctionDiagnosticLinks(
    links: DiagnosticLinkInput[],
  ): Promise<void>;
  abstract saveListingDiagnosticLinks(
    links: DiagnosticLinkInput[],
  ): Promise<void>;
  abstract getAuctionDiagnosticLinks(
    auctionId: string,
  ): Promise<DiagnosticLink[]>;
  abstract getListingDiagnosticLinks(
    listingId: string,
  ): Promise<DiagnosticLink[]>;
}
