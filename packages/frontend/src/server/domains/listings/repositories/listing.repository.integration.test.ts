/**
 * @jest-environment node
 */
import { DrizzleListingRepository } from './listing.repository';
import { useTestDb } from '~/test-utils/use-test-db';
import type { ListingFilters, PaginationFilters } from '~/types/filters';
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
      const filters: ListingFilters = { departments: ['75'] };
      const listings = await listingRepository.findAll(filters);
      listings.forEach(listing => expect(listing.department).toBe('75'));
    });

    it('should filter by zipCodes', async () => {
      const filters: ListingFilters = { zipCodes: ['75001'] };
      const listings = await listingRepository.findAll(filters);
      listings.forEach(listing => expect(listing.zipCode).toBe('75001'));
    });

    // Listing-specific filter tests
    it('should filter by transaction types', async () => {
      const filters: ListingFilters = {
        transactionTypes: ['VENTE', 'LOCATION']
      };
      const listings = await listingRepository.findAll(filters);
      listings.forEach(listing => {
        expect(['VENTE', 'LOCATION']).toContain(listing.transactionType);
      });
    });

    it('should filter by property types', async () => {
      const filters: ListingFilters = {
        propertyTypes: ['APP', 'MAI']
      };
      const listings = await listingRepository.findAll(filters);
      listings.forEach(listing => {
        expect(['APP', 'MAI']).toContain(listing.propertyType);
      });
    });

    it('should filter by energy classes', async () => {
      const filters: ListingFilters = {
        energyClasses: ['B', 'C', 'D']
      };
      const listings = await listingRepository.findAll(filters);
      listings.forEach(listing => {
        if (listing.energyClass) {
          expect(['B', 'C', 'D']).toContain(listing.energyClass);
        }
      });
    });

    it('should filter by price range', async () => {
      const filters: ListingFilters = {
        priceRange: { min: 200000, max: 800000 }
      };
      const listings = await listingRepository.findAll(filters);
      listings.forEach(listing => {
        if (listing.price) {
          expect(listing.price).toBeGreaterThanOrEqual(200000);
          expect(listing.price).toBeLessThanOrEqual(800000);
        }
      });
    });

    it('should filter by square footage range', async () => {
      const filters: ListingFilters = {
        squareFootageRange: { min: 60, max: 150 }
      };
      const listings = await listingRepository.findAll(filters);
      listings.forEach(listing => {
        if (listing.squareFootage) {
          expect(listing.squareFootage).toBeGreaterThanOrEqual(60);
          expect(listing.squareFootage).toBeLessThanOrEqual(150);
        }
      });
    });

    it('should filter by land area range', async () => {
      const filters: ListingFilters = {
        landAreaRange: { min: 100, max: 1000 }
      };
      const listings = await listingRepository.findAll(filters);
      listings.forEach(listing => {
        if (listing.landArea) {
          expect(listing.landArea).toBeGreaterThanOrEqual(100);
          expect(listing.landArea).toBeLessThanOrEqual(1000);
        }
      });
    });

    it('should filter by rooms range', async () => {
      const filters: ListingFilters = {
        roomsRange: { min: 2, max: 6 }
      };
      const listings = await listingRepository.findAll(filters);
      listings.forEach(listing => {
        if (listing.rooms) {
          expect(listing.rooms).toBeGreaterThanOrEqual(2);
          expect(listing.rooms).toBeLessThanOrEqual(6);
        }
      });
    });

    it('should filter by bedrooms range', async () => {
      const filters: ListingFilters = {
        bedroomsRange: { min: 1, max: 4 }
      };
      const listings = await listingRepository.findAll(filters);
      listings.forEach(listing => {
        if (listing.bedrooms) {
          expect(listing.bedrooms).toBeGreaterThanOrEqual(1);
          expect(listing.bedrooms).toBeLessThanOrEqual(4);
        }
      });
    });

    it('should filter by construction year range', async () => {
      const filters: ListingFilters = {
        constructionYearRange: { min: 1990, max: 2020 }
      };
      const listings = await listingRepository.findAll(filters);
      listings.forEach(listing => {
        if (listing.constructionYear) {
          expect(listing.constructionYear).toBeGreaterThanOrEqual(1990);
          expect(listing.constructionYear).toBeLessThanOrEqual(2020);
        }
      });
    });

    it('should filter by features - balcony', async () => {
      const filters: ListingFilters = {
        features: { balcony: true }
      };
      const listings = await listingRepository.findAll(filters);
      listings.forEach(listing => {
        expect(listing.balcony).toBe(true);
      });
    });

    it('should filter by features - multiple features', async () => {
      const filters: ListingFilters = {
        features: {
          garage: true,
          elevator: false,
          terrace: true
        }
      };
      const listings = await listingRepository.findAll(filters);
      listings.forEach(listing => {
        expect(listing.garage).toBe(true);
        expect(listing.elevator).toBe(false);
        expect(listing.terrace).toBe(true);
      });
    });

    it('should filter by multiple listing criteria', async () => {
      const filters: ListingFilters = {
        departments: ['75'],
        transactionTypes: ['VENTE'],
        propertyTypes: ['APP'],
        priceRange: { min: 300000, max: 600000 },
        squareFootageRange: { min: 50 },
        features: { elevator: true }
      };
      const listings = await listingRepository.findAll(filters);
      listings.forEach(listing => {
        expect(listing.department).toBe('75');
        expect(listing.transactionType).toBe('VENTE');
        expect(listing.propertyType).toBe('APP');
        if (listing.price) {
          expect(listing.price).toBeGreaterThanOrEqual(300000);
          expect(listing.price).toBeLessThanOrEqual(600000);
        }
        if (listing.squareFootage) {
          expect(listing.squareFootage).toBeGreaterThanOrEqual(50);
        }
        expect(listing.elevator).toBe(true);
      });
    });

    it('should apply pagination', async () => {
      const paginationFilters: PaginationFilters = { limit: 2, offset: 1 };
      const listings = await listingRepository.findAll(undefined, paginationFilters);
      expect(listings.length).toBeLessThanOrEqual(2);
    });

    it('should sort by price', async () => {
      const filters: ListingFilters = { sortBy: 'price', sortOrder: 'asc' };
      const listings = await listingRepository.findAll(filters);
      for (let i = 1; i < listings.length; i++) {
        expect(listings[i]?.price || 0).toBeGreaterThanOrEqual(listings[i-1]?.price || 0);
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
      const filters: ListingFilters = { departments: ['75'] };
      const count = await listingRepository.count(filters);
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});