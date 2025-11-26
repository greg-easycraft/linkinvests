import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";
import type { DomainDbType } from "~/types/db";
import { energyDiagnostics, auctionEnergyDiagnosticLinks, listingEnergyDiagnosticLinks } from "@linkinvests/db";
import { MAX_NUMBER_OF_RESULTS, type IAddressSearchRepository, type DiagnosticLinkInput, type DiagnosticLink } from "../lib.types";
import type { DiagnosticQueryInput } from "../lib.types";
import type { EnergyDiagnostic } from "@linkinvests/shared";

export class DrizzleAddressSearchRepository implements IAddressSearchRepository {
  constructor(private readonly db: DomainDbType) {}

  async findAllForAddressSearch(input: DiagnosticQueryInput): Promise<EnergyDiagnostic[]> {
    const query = this.db
      .select()
      .from(energyDiagnostics)
      .where(and(
        eq(energyDiagnostics.zipCode, input.zipCode),
        eq(energyDiagnostics.energyClass, input.energyClass),
        gte(energyDiagnostics.squareFootage, input.squareFootageMin),
        lte(energyDiagnostics.squareFootage, input.squareFootageMax),
      ))
      .limit(MAX_NUMBER_OF_RESULTS);
    const results = await query;
    return results;
  }

  async findById(id: string): Promise<EnergyDiagnostic | null> {
    const result = await this.db
      .select()
      .from(energyDiagnostics)
      .where(and(
        eq(energyDiagnostics.id, id),
        // Even when fetching by ID, maintain F/G filter as per requirement
        inArray(energyDiagnostics.energyClass, ['F', 'G'])
      ))
      .limit(1);

    return result[0] ?? null;
  }

  async saveAuctionDiagnosticLinks(links: DiagnosticLinkInput[]): Promise<void> {
    if (links.length === 0) return;

    await this.db
      .insert(auctionEnergyDiagnosticLinks)
      .values(links.map(link => ({
        auctionId: link.opportunityId,
        energyDiagnosticId: link.energyDiagnosticId,
        matchScore: link.matchScore,
      })))
      .onConflictDoNothing();
  }

  async saveListingDiagnosticLinks(links: DiagnosticLinkInput[]): Promise<void> {
    if (links.length === 0) return;

    await this.db
      .insert(listingEnergyDiagnosticLinks)
      .values(links.map(link => ({
        listingId: link.opportunityId,
        energyDiagnosticId: link.energyDiagnosticId,
        matchScore: link.matchScore,
      })))
      .onConflictDoNothing();
  }

  async getAuctionDiagnosticLinks(auctionId: string): Promise<DiagnosticLink[]> {
    const results = await this.db
      .select({
        id: auctionEnergyDiagnosticLinks.id,
        energyDiagnosticId: auctionEnergyDiagnosticLinks.energyDiagnosticId,
        matchScore: auctionEnergyDiagnosticLinks.matchScore,
        energyDiagnostic: {
          id: energyDiagnostics.id,
          address: energyDiagnostics.address,
          zipCode: energyDiagnostics.zipCode,
          energyClass: energyDiagnostics.energyClass,
          squareFootage: energyDiagnostics.squareFootage,
          opportunityDate: energyDiagnostics.opportunityDate,
          externalId: energyDiagnostics.externalId,
        },
      })
      .from(auctionEnergyDiagnosticLinks)
      .innerJoin(energyDiagnostics, eq(auctionEnergyDiagnosticLinks.energyDiagnosticId, energyDiagnostics.id))
      .where(eq(auctionEnergyDiagnosticLinks.auctionId, auctionId))
      .orderBy(desc(auctionEnergyDiagnosticLinks.matchScore));

    return results;
  }

  async getListingDiagnosticLinks(listingId: string): Promise<DiagnosticLink[]> {
    const results = await this.db
      .select({
        id: listingEnergyDiagnosticLinks.id,
        energyDiagnosticId: listingEnergyDiagnosticLinks.energyDiagnosticId,
        matchScore: listingEnergyDiagnosticLinks.matchScore,
        energyDiagnostic: {
          id: energyDiagnostics.id,
          address: energyDiagnostics.address,
          zipCode: energyDiagnostics.zipCode,
          energyClass: energyDiagnostics.energyClass,
          squareFootage: energyDiagnostics.squareFootage,
          opportunityDate: energyDiagnostics.opportunityDate,
          externalId: energyDiagnostics.externalId,
        },
      })
      .from(listingEnergyDiagnosticLinks)
      .innerJoin(energyDiagnostics, eq(listingEnergyDiagnosticLinks.energyDiagnosticId, energyDiagnostics.id))
      .where(eq(listingEnergyDiagnosticLinks.listingId, listingId))
      .orderBy(desc(listingEnergyDiagnosticLinks.matchScore));

    return results;
  }
}