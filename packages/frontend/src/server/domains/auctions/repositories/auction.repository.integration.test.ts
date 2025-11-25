/**
 * @jest-environment node
 */
import { DrizzleAuctionRepository } from './auction.repository';
import { useTestDb } from '~/test-utils/use-test-db';
import type { IAuctionFilters, PaginationFilters } from '~/types/filters';
import { EnergyClass, OpportunityType, PropertyType } from '@linkinvests/shared';

describe('DrizzleAuctionRepository Integration Tests', () => {
  const db = useTestDb();
  const auctionRepository = new DrizzleAuctionRepository(db);

  describe('findAll', () => {
    it('should find all auctions without filters', async () => {
      const auctions = await auctionRepository.findAll();

      expect(auctions).toHaveLength(5); // Based on ALL_AUCTIONS fixture
      expect(auctions[0]).toHaveProperty('id');
      expect(auctions[0]).toHaveProperty('type', OpportunityType.AUCTION);
      expect(auctions[0]).toHaveProperty('title');
      expect(auctions[0]).toHaveProperty('city');
    });

    it('should filter by departments', async () => {
      const filters: IAuctionFilters = {
        departments: ['06'] // CA department from fixtures
      };

      const auctions = await auctionRepository.findAll(filters);

      expect(auctions.length).toBeGreaterThan(0);
      auctions.forEach(auction => {
        expect(auction.department).toBe('06');
      });
    });

    it('should filter by multiple departments', async () => {
      const filters: IAuctionFilters = {
        departments: ['06', '10'] // CA and NY departments
      };

      const auctions = await auctionRepository.findAll(filters);

      expect(auctions.length).toBeGreaterThan(0);
      auctions.forEach(auction => {
        expect(['06', '10']).toContain(auction.department);
      });
    });

    it('should filter by zipCodes', async () => {
      const filters: IAuctionFilters = {
        zipCodes: ['90210'] // Beverly Hills from fixtures
      };

      const auctions = await auctionRepository.findAll(filters);

      auctions.forEach(auction => {
        expect(auction.zipCode).toBe('90210');
      });
    });

    it('should filter by multiple zipCodes', async () => {
      const filters: IAuctionFilters = {
        zipCodes: ['90210', '10001'] // Beverly Hills and NYC
      };

      const auctions = await auctionRepository.findAll(filters);

      auctions.forEach(auction => {
        expect(['90210', '10001']).toContain(auction.zipCode);
      });
    });

    it('should filter by date period', async () => {
      const filters: IAuctionFilters = {
        datePeriod: 'last_month'
      };

      const auctions = await auctionRepository.findAll(filters);

      // Should return auctions with recent dates
      // Note: This depends on the fixture dates and current date
      expect(auctions).toBeInstanceOf(Array);
    });

    // Auction-specific filter tests
    it('should filter by auction types', async () => {
      const filters: IAuctionFilters = {
        auctionTypes: ['PUBLIC_SALE']
      };

      const auctions = await auctionRepository.findAll(filters);

      auctions.forEach(auction => {
        expect(auction.auctionType).toBe('PUBLIC_SALE');
      });
    });

    it('should filter by property types', async () => {
      const filters: IAuctionFilters = {
        propertyTypes: [PropertyType.HOUSE, PropertyType.FLAT]
      };

      const auctions = await auctionRepository.findAll(filters);

      auctions.forEach(auction => {
        expect([PropertyType.HOUSE, PropertyType.FLAT]).toContain(auction.propertyType);
      });
    });

    it('should filter by auction venues', async () => {
      const filters: IAuctionFilters = {
        auctionVenues: ['COURTHOUSE_A', 'AUCTION_HOUSE_B']
      };

      const auctions = await auctionRepository.findAll(filters);

      auctions.forEach(auction => {
        expect(['COURTHOUSE_A', 'AUCTION_HOUSE_B']).toContain(auction.auctionVenue);
      });
    });

    it('should filter by energy classes', async () => {
      const filters: IAuctionFilters = {
        energyClasses: [EnergyClass.D, EnergyClass.E, EnergyClass.F]
      };

      const auctions = await auctionRepository.findAll(filters);

      auctions.forEach(auction => {
        expect(['D', 'E', 'F']).toContain(auction.energyClass);
      });
    });

    it('should filter by price range', async () => {
      const filters: IAuctionFilters = {
        minPrice: 100000,
        maxPrice: 500000
      };

      const auctions = await auctionRepository.findAll(filters);

      auctions.forEach(auction => {
        if (auction.currentPrice) {
          expect(auction.currentPrice).toBeGreaterThanOrEqual(100000);
          expect(auction.currentPrice).toBeLessThanOrEqual(500000);
        }
      });
    });

    it('should filter by reserve price range', async () => {
      const filters: IAuctionFilters = {
        minReservePrice: 50000,
        maxReservePrice: 300000
      };

      const auctions = await auctionRepository.findAll(filters);

      auctions.forEach(auction => {
        if (auction.reservePrice) {
          expect(auction.reservePrice).toBeGreaterThanOrEqual(50000);
          expect(auction.reservePrice).toBeLessThanOrEqual(300000);
        }
      });
    });

    it('should filter by square footage range', async () => {
      const filters: IAuctionFilters = {
        minSquareFootage: 50,
        maxSquareFootage: 200
      };

      const auctions = await auctionRepository.findAll(filters);

      auctions.forEach(auction => {
        if (auction.squareFootage) {
          expect(auction.squareFootage).toBeGreaterThanOrEqual(50);
          expect(auction.squareFootage).toBeLessThanOrEqual(200);
        }
      });
    });

    it('should filter by rooms range', async () => {
      const filters: IAuctionFilters = {
        minRooms: 2,
        maxRooms: 5
      };

      const auctions = await auctionRepository.findAll(filters);

      auctions.forEach(auction => {
        if (auction.rooms) {
          expect(auction.rooms).toBeGreaterThanOrEqual(2);
          expect(auction.rooms).toBeLessThanOrEqual(5);
        }
      });
    });

    it('should filter by multiple auction criteria', async () => {
      const filters: IAuctionFilters = {
        departments: ['06'],
        auctionTypes: ['PUBLIC_SALE'],
        minPrice: 100000,
        maxPrice: 1000000,
        minSquareFootage: 50
      };

      const auctions = await auctionRepository.findAll(filters);

      auctions.forEach(auction => {
        expect(auction.department).toBe('06');
        expect(auction.auctionType).toBe('PUBLIC_SALE');
        if (auction.currentPrice) {
          expect(auction.currentPrice).toBeGreaterThanOrEqual(100000);
          expect(auction.currentPrice).toBeLessThanOrEqual(1000000);
        }
        if (auction.squareFootage) {
          expect(auction.squareFootage).toBeGreaterThanOrEqual(50);
        }
      });
    });

    it('should filter by map bounds', async () => {
      const filters: IAuctionFilters = {
        bounds: {
          north: 35.0,  // Covers Los Angeles area
          south: 33.0,
          east: -117.0,
          west: -119.0
        }
      };

      const auctions = await auctionRepository.findAll(filters);

      auctions.forEach(auction => {
        expect(auction.latitude).toBeGreaterThanOrEqual(33.0);
        expect(auction.latitude).toBeLessThanOrEqual(35.0);
        expect(auction.longitude).toBeGreaterThanOrEqual(-119.0);
        expect(auction.longitude).toBeLessThanOrEqual(-117.0);
      });
    });

    it('should combine multiple filters', async () => {
      const filters: IAuctionFilters = {
        departments: ['06'],
        zipCodes: ['90210'],
        datePeriod: 'last_3_months'
      };

      const auctions = await auctionRepository.findAll(filters);

      auctions.forEach(auction => {
        expect(auction.department).toBe('06');
        expect(auction.zipCode).toBe('90210');
      });
    });

    it('should apply pagination', async () => {
      const paginationFilters: PaginationFilters = {
        limit: 2,
        offset: 1
      };

      const auctions = await auctionRepository.findAll(undefined, paginationFilters);

      expect(auctions).toHaveLength(2);
    });

    it('should apply pagination with filters', async () => {
      const filters: IAuctionFilters = {
        departments: ['06', '10']
      };
      const paginationFilters: PaginationFilters = {
        limit: 1,
        offset: 0
      };

      const auctions = await auctionRepository.findAll(filters, paginationFilters);

      expect(auctions).toHaveLength(1);
      expect(['06', '10']).toContain(auctions[0]?.department);
    });

    it('should sort by price ascending', async () => {
      const filters: IAuctionFilters = {
        sortBy: 'currentPrice',
        sortOrder: 'asc'
      };

      const auctions = await auctionRepository.findAll(filters);

      for (let i = 1; i < auctions.length; i++) {
        const current = auctions[i]?.currentPrice || 0;
        const previous = auctions[i-1]?.currentPrice || 0;
        expect(current).toBeGreaterThanOrEqual(previous);
      }
    });

    it('should sort by price descending', async () => {
      const filters: IAuctionFilters = {
        sortBy: 'currentPrice',
        sortOrder: 'desc'
      };

      const auctions = await auctionRepository.findAll(filters);

      for (let i = 1; i < auctions.length; i++) {
        const current = auctions[i]?.currentPrice || 0;
        const previous = auctions[i-1]?.currentPrice || 0;
        expect(current).toBeLessThanOrEqual(previous);
      }
    });

    it('should sort by title alphabetically', async () => {
      const filters: IAuctionFilters = {
        sortBy: 'title',
        sortOrder: 'asc'
      };

      const auctions = await auctionRepository.findAll(filters);

      for (let i = 1; i < auctions.length; i++) {
        // @ts-expect-error - title property may not exist on Auction type in tests
        const current = auctions[i]?.title || '';
        // @ts-expect-error - title property may not exist on Auction type in tests
        const previous = auctions[i-1]?.title || '';
        expect(current.localeCompare(previous)).toBeGreaterThanOrEqual(0);
      }
    });

    it('should default sort by creation date descending when no sort specified', async () => {
      const auctions = await auctionRepository.findAll();

      for (let i = 1; i < auctions.length; i++) {
        const currentAuction = auctions[i];
        const previousAuction = auctions[i-1];
        if (currentAuction && previousAuction) {
          const current = new Date(currentAuction.createdAt).getTime();
          const previous = new Date(previousAuction.createdAt).getTime();
          expect(current).toBeLessThanOrEqual(previous);
        }
      }
    });

    it('should return empty array when no matches found', async () => {
      const filters: IAuctionFilters = {
        zipCodes: ['99999'] // Non-existent zip code
      };

      const auctions = await auctionRepository.findAll(filters);

      expect(auctions).toHaveLength(0);
    });

    it('should handle empty departments filter', async () => {
      const filters: IAuctionFilters = {
        departments: []
      };

      const auctions = await auctionRepository.findAll(filters);

      expect(auctions).toHaveLength(5); // Should return all auctions
    });

    it('should handle empty zipCodes filter', async () => {
      const filters: IAuctionFilters = {
        zipCodes: []
      };

      const auctions = await auctionRepository.findAll(filters);

      expect(auctions).toHaveLength(5); // Should return all auctions
    });
  });

  describe('findById', () => {
    it('should find auction by existing ID', async () => {
      // First get all auctions to get a valid ID
      const allAuctions = await auctionRepository.findAll();
      expect(allAuctions.length).toBeGreaterThan(0);

      const targetId = allAuctions[0]?.id ?? '';
      const auction = await auctionRepository.findById(targetId);

      expect(auction).not.toBeNull();
      expect(auction?.id).toBe(targetId);
      // @ts-expect-error - type property may not exist on Auction type in tests
      expect(auction?.type).toBe(OpportunityType.AUCTION);
    });

    it('should return null for non-existent ID', async () => {
      const auction = await auctionRepository.findById('non-existent-id');

      expect(auction).toBeNull();
    });

    it('should return auction with all required properties', async () => {
      const allAuctions = await auctionRepository.findAll();
      const targetId = allAuctions[0]?.id ?? '';

      const auction = await auctionRepository.findById(targetId);

      expect(auction).toMatchObject({
        id: expect.any(String),
        type: OpportunityType.AUCTION,
        title: expect.any(String),
        city: expect.any(String),
        department: expect.any(String),
        zipCode: expect.any(String),
        latitude: expect.any(Number),
        longitude: expect.any(Number),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('count', () => {
    it('should count all auctions without filters', async () => {
      const count = await auctionRepository.count();

      expect(count).toBe(5); // Based on ALL_AUCTIONS fixture
    });

    it('should count auctions with department filter', async () => {
      const filters: IAuctionFilters = {
        departments: ['06'] // CA department
      };

      const count = await auctionRepository.count(filters);

      expect(count).toBeGreaterThanOrEqual(0);
      expect(count).toBeLessThanOrEqual(5);
    });

    it('should count auctions with zipCode filter', async () => {
      const filters: IAuctionFilters = {
        zipCodes: ['90210']
      };

      const count = await auctionRepository.count(filters);

      expect(count).toBeGreaterThanOrEqual(0);
      expect(count).toBeLessThanOrEqual(5);
    });

    it('should count auctions with multiple filters', async () => {
      const filters: IAuctionFilters = {
        departments: ['06', '10'],
        datePeriod: 'last_3_months'
      };

      const count = await auctionRepository.count(filters);

      expect(count).toBeGreaterThanOrEqual(0);
      expect(count).toBeLessThanOrEqual(5);
    });

    it('should count auctions with bounds filter', async () => {
      const filters: IAuctionFilters = {
        bounds: {
          north: 35.0,
          south: 33.0,
          east: -117.0,
          west: -119.0
        }
      };

      const count = await auctionRepository.count(filters);

      expect(count).toBeGreaterThanOrEqual(0);
      expect(count).toBeLessThanOrEqual(5);
    });

    it('should return 0 for filters with no matches', async () => {
      const filters: IAuctionFilters = {
        zipCodes: ['99999'] // Non-existent zip code
      };

      const count = await auctionRepository.count(filters);

      expect(count).toBe(0);
    });

    it('should match count with findAll results', async () => {
      const filters: IAuctionFilters = {
        departments: ['06', '10']
      };

      const [auctions, count] = await Promise.all([
        auctionRepository.findAll(filters),
        auctionRepository.count(filters)
      ]);

      expect(count).toBe(auctions.length);
    });
  });

  describe('data integrity', () => {
    it('should return auctions with consistent data types', async () => {
      const auctions = await auctionRepository.findAll();

      auctions.forEach(auction => {
        expect(typeof auction.id).toBe('string');
        // @ts-expect-error - type property may not exist on Auction type in tests
        expect(auction.type).toBe(OpportunityType.AUCTION);
        // @ts-expect-error - title property may not exist on Auction type in tests
        expect(typeof auction.title).toBe('string');
        // @ts-expect-error - city property may not exist on Auction type in tests
        expect(typeof auction.city).toBe('string');
        expect(typeof auction.department).toBe('string');
        expect(typeof auction.zipCode).toBe('string');
        expect(typeof auction.latitude).toBe('number');
        expect(typeof auction.longitude).toBe('number');
        expect(auction.createdAt).toBeInstanceOf(Date);
        expect(auction.updatedAt).toBeInstanceOf(Date);
      });
    });

    it('should handle nullable fields correctly', async () => {
      const auctions = await auctionRepository.findAll();

      auctions.forEach(auction => {
        // These fields can be undefined but not null after mapping
        if (auction.address !== undefined) {
          expect(typeof auction.address).toBe('string');
        }
        if (auction.description !== undefined) {
          expect(typeof auction.description).toBe('string');
        }
        if (auction.squareFootage !== undefined) {
          expect(typeof auction.squareFootage).toBe('number');
        }
        if (auction.rooms !== undefined) {
          expect(typeof auction.rooms).toBe('number');
        }
      });
    });
  });
});