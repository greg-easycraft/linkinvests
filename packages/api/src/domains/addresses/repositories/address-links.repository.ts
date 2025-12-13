import { Injectable, Inject } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import type { DomainDbType } from '~/types/db';
import {
  energyDiagnostics,
  auctionEnergyDiagnosticLinks,
  listingEnergyDiagnosticLinks,
} from '@linkinvests/db';
import {
  type DiagnosticLinkInput,
  type DiagnosticLink,
  AddressLinksRepository,
} from '../lib.types';
import { DATABASE_TOKEN } from '~/common/database';

@Injectable()
export class AddressLinksRepositoryImpl implements AddressLinksRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: DomainDbType) {}

  async saveAuctionDiagnosticLinks(
    links: DiagnosticLinkInput[],
  ): Promise<void> {
    if (links.length === 0) return;

    await this.db
      .insert(auctionEnergyDiagnosticLinks)
      .values(
        links.map((link) => ({
          auctionId: link.opportunityId,
          energyDiagnosticId: link.energyDiagnosticId,
          matchScore: link.matchScore,
        })),
      )
      .onConflictDoNothing();
  }

  async saveListingDiagnosticLinks(
    links: DiagnosticLinkInput[],
  ): Promise<void> {
    if (links.length === 0) return;

    await this.db
      .insert(listingEnergyDiagnosticLinks)
      .values(
        links.map((link) => ({
          listingId: link.opportunityId,
          energyDiagnosticId: link.energyDiagnosticId,
          matchScore: link.matchScore,
        })),
      )
      .onConflictDoNothing();
  }

  async getAuctionDiagnosticLinks(
    auctionId: string,
  ): Promise<DiagnosticLink[]> {
    const results = await this.db
      .select({
        id: auctionEnergyDiagnosticLinks.id,
        energyDiagnosticId: auctionEnergyDiagnosticLinks.energyDiagnosticId,
        matchScore: auctionEnergyDiagnosticLinks.matchScore,
        energyDiagnostic: {
          id: energyDiagnostics.id,
          streetAddress: energyDiagnostics.streetAddress,
          city: energyDiagnostics.city,
          zipCode: energyDiagnostics.zipCode,
          energyClass: energyDiagnostics.energyClass,
          squareFootage: energyDiagnostics.squareFootage,
          opportunityDate: energyDiagnostics.opportunityDate,
          externalId: energyDiagnostics.externalId,
        },
      })
      .from(auctionEnergyDiagnosticLinks)
      .innerJoin(
        energyDiagnostics,
        eq(
          auctionEnergyDiagnosticLinks.energyDiagnosticId,
          energyDiagnostics.id,
        ),
      )
      .where(eq(auctionEnergyDiagnosticLinks.auctionId, auctionId))
      .orderBy(desc(auctionEnergyDiagnosticLinks.matchScore));

    return results;
  }

  async getListingDiagnosticLinks(
    listingId: string,
  ): Promise<DiagnosticLink[]> {
    const results = await this.db
      .select({
        id: listingEnergyDiagnosticLinks.id,
        energyDiagnosticId: listingEnergyDiagnosticLinks.energyDiagnosticId,
        matchScore: listingEnergyDiagnosticLinks.matchScore,
        energyDiagnostic: {
          id: energyDiagnostics.id,
          streetAddress: energyDiagnostics.streetAddress,
          city: energyDiagnostics.city,
          zipCode: energyDiagnostics.zipCode,
          energyClass: energyDiagnostics.energyClass,
          squareFootage: energyDiagnostics.squareFootage,
          opportunityDate: energyDiagnostics.opportunityDate,
          externalId: energyDiagnostics.externalId,
        },
      })
      .from(listingEnergyDiagnosticLinks)
      .innerJoin(
        energyDiagnostics,
        eq(
          listingEnergyDiagnosticLinks.energyDiagnosticId,
          energyDiagnostics.id,
        ),
      )
      .where(eq(listingEnergyDiagnosticLinks.listingId, listingId))
      .orderBy(desc(listingEnergyDiagnosticLinks.matchScore));

    return results;
  }
}
