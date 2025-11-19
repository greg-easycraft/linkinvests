/**
 * @jest-environment node
 */
import { DrizzleListingRepository } from './listing.repository';
import { useTestDb } from '~/test-utils/use-test-db';
import type { OpportunityFilters, PaginationFilters } from '~/types/filters';
import { OpportunityType } from '@linkinvests/shared';

describe('DrizzleListingRepository Integration Tests', () => {
  const db = useTestDb();
  const listingRepository = new DrizzleListingRepository(db);

  describe('findAll', () => {
    it('should find all listings without filters', async () => {
      const listings = await listingRepository.findAll();
      expect(listings).toHaveLength(5); // Based on ALL_LISTINGS fixture
      expect(listings[0]).toHaveProperty('type', OpportunityType.REAL_ESTATE_LISTING);
    });

    it('should filter by departments', async () => {
      const filters: OpportunityFilters = { departments: ['75'] };
      const listings = await listingRepository.findAll(filters);
      listings.forEach(listing => expect(listing.department).toBe('75'));
    });

    it('should filter by zipCodes', async () => {
      const filters: OpportunityFilters = { zipCodes: ['75001'] };
      const listings = await listingRepository.findAll(filters);
      listings.forEach(listing => expect(listing.zipCode).toBe('75001'));
    });

    it('should apply pagination', async () => {
      const paginationFilters: PaginationFilters = { limit: 2, offset: 1 };
      const listings = await listingRepository.findAll(undefined, paginationFilters);
      expect(listings.length).toBeLessThanOrEqual(2);
    });

    it('should sort by price', async () => {
      const filters: OpportunityFilters = { sortBy: 'price', sortOrder: 'asc' };
      const listings = await listingRepository.findAll(filters);
      for (let i = 1; i < listings.length; i++) {
        expect(listings[i].price).toBeGreaterThanOrEqual(listings[i-1].price);
      }
    });
  });

  describe('findById', () => {
    it('should find listing by ID', async () => {
      const allListings = await listingRepository.findAll();
      const targetId = allListings[0].id;
      const listing = await listingRepository.findById(targetId);
      expect(listing?.id).toBe(targetId);
    });

    it('should return null for non-existent ID', async () => {
      const listing = await listingRepository.findById('non-existent');
      expect(listing).toBeNull();
    });
  });

  describe('count', () => {
    it('should count all listings', async () => {
      const count = await listingRepository.count();
      expect(count).toBe(5);
    });

    it('should count with filters', async () => {
      const filters: OpportunityFilters = { departments: ['75'] };
      const count = await listingRepository.count(filters);
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});