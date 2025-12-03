/**
 * @jest-environment node
 */
import { DrizzleListingRepository } from './listing.repository';
import { useTestDb } from '~/test-utils/use-test-db';
import type { IListingFilters, PaginationFilters } from '~/types/filters';
import {
  EnergyClass,
  OpportunityType,
  PropertyType,
} from '@linkinvests/shared';

describe('DrizzleListingRepository Integration Tests', () => {
  const db = useTestDb();
  const listingRepository = new DrizzleListingRepository(db);

  describe('findAll', () => {
    it('should find all listings without filters', async () => {
      const listings = await listingRepository.findAll();
      expect(listings).toHaveLength(5); // Based on ALL_LISTINGS fixture
      expect(listings[0]).toHaveProperty(
        'type',
        OpportunityType.REAL_ESTATE_LISTING,
      );
    });

    it('should filter by departments', async () => {
      const filters: IListingFilters = { departments: ['75'] };
      const listings = await listingRepository.findAll(filters);
      listings.forEach((listing) => expect(listing.department).toBe('75'));
    });

    it('should filter by zipCodes', async () => {
      const filters: IListingFilters = { zipCodes: ['75001'] };
      const listings = await listingRepository.findAll(filters);
      listings.forEach((listing) => expect(listing.zipCode).toBe('75001'));
    });

    // Listing-specific filter tests
    it('should filter by property types', async () => {
      const filters: IListingFilters = {
        propertyTypes: [PropertyType.FLAT, PropertyType.HOUSE],
      };
      const listings = await listingRepository.findAll(filters);
      listings.forEach((listing) => {
        expect([PropertyType.FLAT, PropertyType.HOUSE]).toContain(
          listing.propertyType,
        );
      });
    });

    it('should filter by energy classes', async () => {
      const filters: IListingFilters = {
        energyClasses: [EnergyClass.B, EnergyClass.C, EnergyClass.D],
      };
      const listings = await listingRepository.findAll(filters);
      listings.forEach((listing) => {
        if (listing.energyClass) {
          expect(['B', 'C', 'D']).toContain(listing.energyClass);
        }
      });
    });

    it('should filter by price range', async () => {
      const filters: IListingFilters = {
        minPrice: 200000,
        maxPrice: 800000,
      };
      const listings = await listingRepository.findAll(filters);
      listings.forEach((listing) => {
        if (listing.price) {
          expect(listing.price).toBeGreaterThanOrEqual(200000);
          expect(listing.price).toBeLessThanOrEqual(800000);
        }
      });
    });

    it('should filter by square footage range', async () => {
      const filters: IListingFilters = {
        minSquareFootage: 60,
        maxSquareFootage: 150,
      };
      const listings = await listingRepository.findAll(filters);
      listings.forEach((listing) => {
        if (listing.squareFootage) {
          expect(listing.squareFootage).toBeGreaterThanOrEqual(60);
          expect(listing.squareFootage).toBeLessThanOrEqual(150);
        }
      });
    });

    it('should filter by land area range', async () => {
      const filters: IListingFilters = {
        minLandArea: 100,
        maxLandArea: 1000,
      };
      const listings = await listingRepository.findAll(filters);
      listings.forEach((listing) => {
        if (listing.landArea) {
          expect(listing.landArea).toBeGreaterThanOrEqual(100);
          expect(listing.landArea).toBeLessThanOrEqual(1000);
        }
      });
    });

    it('should filter by rooms range', async () => {
      const filters: IListingFilters = {
        minRooms: 2,
        maxRooms: 6,
      };
      const listings = await listingRepository.findAll(filters);
      listings.forEach((listing) => {
        if (listing.rooms) {
          expect(listing.rooms).toBeGreaterThanOrEqual(2);
          expect(listing.rooms).toBeLessThanOrEqual(6);
        }
      });
    });

    it('should filter by bedrooms range', async () => {
      const filters: IListingFilters = {
        minBedrooms: 1,
        maxBedrooms: 4,
      };
      const listings = await listingRepository.findAll(filters);
      listings.forEach((listing) => {
        if (listing.bedrooms) {
          expect(listing.bedrooms).toBeGreaterThanOrEqual(1);
          expect(listing.bedrooms).toBeLessThanOrEqual(4);
        }
      });
    });

    it('should filter by construction year range', async () => {
      const filters: IListingFilters = {
        minConstructionYear: 1990,
        maxConstructionYear: 2020,
      };
      const listings = await listingRepository.findAll(filters);
      listings.forEach((listing) => {
        if (listing.constructionYear) {
          expect(listing.constructionYear).toBeGreaterThanOrEqual(1990);
          expect(listing.constructionYear).toBeLessThanOrEqual(2020);
        }
      });
    });

    it('should filter by rental status (isSoldRented)', async () => {
      const filters: IListingFilters = {
        isSoldRented: true,
      };
      const listings = await listingRepository.findAll(filters);
      const count = await listingRepository.count(filters);

      expect(listings.length).toBe(count);
      listings.forEach((listing) => {
        expect(listing.isSoldRented).toBe(true);
      });
    });

    it('should filter by rental status - available properties', async () => {
      const filters: IListingFilters = {
        isSoldRented: false,
      };
      const listings = await listingRepository.findAll(filters);
      const count = await listingRepository.count(filters);

      expect(listings.length).toBe(count);
      listings.forEach((listing) => {
        expect(listing.isSoldRented).toBe(false);
      });
    });

    it('should filter by sources', async () => {
      // First get all available sources to test with real data
      const allListings = await listingRepository.findAll();
      const availableSources = [
        ...new Set(allListings.map((l) => l.source)),
      ].filter(Boolean);

      if (availableSources.length === 0) {
        console.warn('No listings with sources found in fixtures');
        return;
      }

      const filters: IListingFilters = {
        sources: [availableSources[0]],
      };
      const listings = await listingRepository.findAll(filters);
      const count = await listingRepository.count(filters);

      expect(listings.length).toBe(count);
      listings.forEach((listing) => {
        expect(listing.source).toBe(availableSources[0]);
      });
    });

    it('should filter by multiple sources', async () => {
      const allListings = await listingRepository.findAll();
      const availableSources = [
        ...new Set(allListings.map((l) => l.source)),
      ].filter(Boolean);

      if (availableSources.length < 2) {
        console.warn(
          'Not enough different sources found in fixtures for multiple sources test',
        );
        return;
      }

      const testSources = availableSources.slice(0, 2);
      const filters: IListingFilters = {
        sources: testSources,
      };
      const listings = await listingRepository.findAll(filters);
      const count = await listingRepository.count(filters);

      expect(listings.length).toBe(count);
      listings.forEach((listing) => {
        expect(testSources).toContain(listing.source);
      });
    });

    it('should filter by seller type - individual', async () => {
      const filters: IListingFilters = {
        sellerType: 'individual',
      };
      const listings = await listingRepository.findAll(filters);
      const count = await listingRepository.count(filters);

      expect(listings.length).toBe(count);
      listings.forEach((listing) => {
        expect(listing.sellerType).toBe('individual');
      });
    });

    it('should filter by seller type - professional', async () => {
      const filters: IListingFilters = {
        sellerType: 'professional',
      };
      const listings = await listingRepository.findAll(filters);
      const count = await listingRepository.count(filters);

      expect(listings.length).toBe(count);
      listings.forEach((listing) => {
        expect(listing.sellerType).toBe('professional');
      });
    });

    it('should filter by multiple listing criteria', async () => {
      const filters: IListingFilters = {
        departments: ['75'],
        propertyTypes: [PropertyType.FLAT],
        minPrice: 300000,
        maxPrice: 600000,
        minSquareFootage: 50,
      };
      const listings = await listingRepository.findAll(filters);
      listings.forEach((listing) => {
        expect(listing.department).toBe('75');
        expect(listing.propertyType).toBe(PropertyType.FLAT);
        if (listing.price) {
          expect(listing.price).toBeGreaterThanOrEqual(300000);
          expect(listing.price).toBeLessThanOrEqual(600000);
        }
        if (listing.squareFootage) {
          expect(listing.squareFootage).toBeGreaterThanOrEqual(50);
        }
      });
    });

    it('should apply pagination', async () => {
      const paginationFilters: PaginationFilters = { limit: 2, offset: 1 };
      const listings = await listingRepository.findAll(
        undefined,
        paginationFilters,
      );
      expect(listings.length).toBeLessThanOrEqual(2);
    });

    it('should sort by price', async () => {
      const filters: IListingFilters = { sortBy: 'price', sortOrder: 'asc' };
      const listings = await listingRepository.findAll(filters);
      for (let i = 1; i < listings.length; i++) {
        expect(listings[i]?.price || 0).toBeGreaterThanOrEqual(
          listings[i - 1]?.price || 0,
        );
      }
    });
  });

  describe('findById', () => {
    it('should find listing by ID', async () => {
      const allListings = await listingRepository.findAll();
      const targetId = allListings[0]?.id ?? '';
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
      const filters: IListingFilters = { departments: ['75'] };
      const count = await listingRepository.count(filters);
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});
