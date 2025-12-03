import { Test, TestingModule } from '@nestjs/testing';
import { ListingsRepository } from './listings.repository';
import { DATABASE_CONNECTION } from '~/database';
import { EnergyClass, ListingInput, PropertyType } from '@linkinvests/shared';

describe('ListingsRepository (Integration)', () => {
  let repository: ListingsRepository;
  let mockDb: any;

  // Mock listing data for testing
  const mockListing: ListingInput = {
    lastChangeDate: '2024-01-15',
    label: 'Appartement 3 pièces',
    address: '123 Rue de la Paix',
    zipCode: '75001',
    department: '75',
    latitude: 48.8566,
    longitude: 2.3522,
    opportunityDate: '2024-01-15',
    externalId: 'moteurimmo-123',
    url: 'https://moteurimmo.fr/listing/123',
    source: 'seloger',
    propertyType: PropertyType.FLAT,
    description: 'Bel appartement en centre ville',
    squareFootage: 75,
    isSoldRented: false,
    sellerType: 'individual',
    rooms: 3,
    bedrooms: 2,
    energyClass: EnergyClass.C,
    price: 500000,
    pictures: ['image1.jpg', 'image2.jpg'],
    mainPicture: 'image1.jpg',
  };

  beforeEach(async () => {
    // Create a comprehensive mock for the database connection

    mockDb = {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      onConflictDoNothing: jest.fn().mockResolvedValue({ rowCount: 1 }),
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      }),
      delete: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue({ rowCount: 0 }),
      }),
      sql: jest.fn().mockImplementation((strings, ...values) => ({
        sql: strings.join('?'),
        values,
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingsRepository,
        {
          provide: DATABASE_CONNECTION,
          useValue: mockDb,
        },
      ],
    }).compile();

    repository = module.get<ListingsRepository>(ListingsRepository);

    // Suppress logger output during tests
    jest.spyOn(repository['logger'], 'log').mockImplementation();
    jest.spyOn(repository['logger'], 'debug').mockImplementation();
    jest.spyOn(repository['logger'], 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('insertListings', () => {
    it('should return 0 for empty array', async () => {
      const result = await repository.insertListings([]);

      expect(result).toBe(0);
      expect(mockDb.insert).not.toHaveBeenCalled();
      expect(repository['logger']['log']).toHaveBeenCalledWith(
        'No listings to insert'
      );
    });

    it('should insert single listing successfully', async () => {
      // Mock successful insertion
      mockDb.onConflictDoNothing.mockResolvedValue({ rowCount: 1 });

      const result = await repository.insertListings([mockListing]);

      expect(result).toBe(1);
      expect(mockDb.insert).toHaveBeenCalledTimes(1);
      expect(mockDb.values).toHaveBeenCalledWith([mockListing]);
      expect(mockDb.onConflictDoNothing).toHaveBeenCalledWith({
        target: [expect.any(Object)], // domainSchema.opportunityListings.externalId
      });
    });

    it('should handle batch processing correctly', async () => {
      // Create array with more listings than batch size
      const listings = Array.from({ length: 1200 }, (_, i) => ({
        ...mockListing,
        externalId: `moteurimmo-${i}`,
        label: `Property ${i}`,
      }));

      // Mock successful insertion for each batch
      mockDb.onConflictDoNothing.mockResolvedValue({ rowCount: 500 });

      const result = await repository.insertListings(listings, 500);

      expect(result).toBe(1200); // All listings inserted
      expect(mockDb.insert).toHaveBeenCalledTimes(3); // 3 batches (500 + 500 + 200)
      expect(mockDb.values).toHaveBeenCalledTimes(3);

      // Check that batches were correct sizes
      const valueCalls = (mockDb.values as jest.Mock).mock.calls;
      expect(valueCalls[0][0]).toHaveLength(500); // First batch
      expect(valueCalls[1][0]).toHaveLength(500); // Second batch
      expect(valueCalls[2][0]).toHaveLength(200); // Third batch (remainder)
    });

    it('should handle partial insertion (duplicates)', async () => {
      const listings = [
        mockListing,
        { ...mockListing, externalId: 'moteurimmo-456' },
        { ...mockListing, externalId: 'moteurimmo-789' },
      ];

      // Mock partial insertion (1 duplicate skipped)
      mockDb.onConflictDoNothing.mockResolvedValue({ rowCount: 2 });

      const result = await repository.insertListings(listings);

      expect(result).toBe(2); // Only 2 inserted (1 duplicate)
    });

    it('should handle insertion without rowCount', async () => {
      const listings = [mockListing];

      // Mock response without rowCount (fallback to batch length)
      mockDb.onConflictDoNothing.mockResolvedValue({});

      const result = await repository.insertListings(listings);

      expect(result).toBe(1); // Should fallback to batch length
    });

    it('should log batch progress correctly', async () => {
      const listings = Array.from({ length: 250 }, (_, i) => ({
        ...mockListing,
        externalId: `moteurimmo-${i}`,
      }));

      mockDb.onConflictDoNothing.mockResolvedValue({ rowCount: 100 });

      await repository.insertListings(listings, 100);

      // Should log batch progress
      expect(repository['logger']['log']).toHaveBeenCalledWith(
        expect.stringContaining('Starting batch insert of 250 listings')
      );

      expect(repository['logger']['log']).toHaveBeenCalledWith(
        expect.stringContaining('Processed batch 1/3: 100 inserted, 0 skipped')
      );

      expect(repository['logger']['log']).toHaveBeenCalledWith(
        expect.stringContaining('Batch insert completed: 300 listings inserted')
      );
    });

    it('should throw error on database failure', async () => {
      const listings = [mockListing];
      const dbError = new Error('Database connection failed');

      mockDb.onConflictDoNothing.mockRejectedValue(dbError);

      await expect(repository.insertListings(listings)).rejects.toThrow(
        'Database connection failed'
      );

      expect(repository['logger']['error']).toHaveBeenCalledWith(
        expect.stringContaining('Failed to insert batch starting at index 0')
      );
    });

    it('should debug log first record structure', async () => {
      const listings = [
        mockListing,
        { ...mockListing, externalId: 'moteurimmo-456' },
      ];

      mockDb.onConflictDoNothing.mockResolvedValue({ rowCount: 2 });

      await repository.insertListings(listings);

      expect(repository['logger']['debug']).toHaveBeenCalledWith(
        expect.stringContaining('First DB record to insert:')
      );
    });
  });

  describe('getListingsCountBySource', () => {
    it('should return count of listings for specific source', async () => {
      // Mock database response
      const mockResult = Array.from({ length: 42 }, () => ({ id: 'uuid' }));

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockResult),
        }),
      });

      const result = await repository.getListingsCountBySource('moteurimmo');

      expect(result).toBe(42);
      expect(mockDb.select).toHaveBeenCalledWith({ count: expect.any(Object) });
    });

    it('should return 0 for source with no listings', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const result =
        await repository.getListingsCountBySource('unknown-source');

      expect(result).toBe(0);
    });

    it('should throw error on database failure', async () => {
      const dbError = new Error('Database query failed');

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockRejectedValue(dbError),
        }),
      });

      await expect(
        repository.getListingsCountBySource('moteurimmo')
      ).rejects.toThrow('Database query failed');

      expect(repository['logger']['error']).toHaveBeenCalledWith(
        expect.stringContaining(
          'Failed to get listings count for source moteurimmo'
        )
      );
    });
  });

  describe('getRecentListingsBySource', () => {
    it('should return recent listings for specific source', async () => {
      const mockListings = [
        { id: '1', externalId: 'moteurimmo-123', source: 'moteurimmo' },
        { id: '2', externalId: 'moteurimmo-456', source: 'moteurimmo' },
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockListings),
            }),
          }),
        }),
      });

      const result = await repository.getRecentListingsBySource(
        'moteurimmo',
        5
      );

      expect(result).toEqual(mockListings);
      expect(mockDb.select).toHaveBeenCalledWith();
    });

    it('should use default limit of 10', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      await repository.getRecentListingsBySource('moteurimmo');

      // Should call limit with default value
      const limitCall = mockDb.select().from().where().orderBy().limit;
      expect(limitCall).toHaveBeenCalledWith(10);
    });

    it('should throw error on database failure', async () => {
      const dbError = new Error('Database query failed');

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockRejectedValue(dbError),
            }),
          }),
        }),
      });

      await expect(
        repository.getRecentListingsBySource('moteurimmo')
      ).rejects.toThrow('Database query failed');

      expect(repository['logger']['error']).toHaveBeenCalledWith(
        expect.stringContaining(
          'Failed to get recent listings for source moteurimmo'
        )
      );
    });
  });

  describe('deleteOldListings', () => {
    it('should delete listings before specific date', async () => {
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue({ rowCount: 5 }),
      });

      const result = await repository.deleteOldListings('2023-12-31');

      expect(result).toBe(5);
      expect(mockDb.delete).toHaveBeenCalled();
      expect(repository['logger']['log']).toHaveBeenCalledWith(
        expect.stringContaining('Deleted 5 listings created before 2023-12-31')
      );
    });

    it('should delete listings for specific source', async () => {
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue({ rowCount: 3 }),
      });

      const result = await repository.deleteOldListings(
        '2023-12-31',
        'moteurimmo'
      );

      expect(result).toBe(3);
      expect(repository['logger']['log']).toHaveBeenCalledWith(
        expect.stringContaining(
          'Deleted 3 listings from source moteurimmo created before 2023-12-31'
        )
      );
    });

    it('should return 0 when no listings deleted', async () => {
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue({ rowCount: 0 }),
      });

      const result = await repository.deleteOldListings('2023-12-31');

      expect(result).toBe(0);
    });

    it('should handle missing rowCount', async () => {
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue({}),
      });

      const result = await repository.deleteOldListings('2023-12-31');

      expect(result).toBe(0);
    });

    it('should throw error on database failure', async () => {
      const dbError = new Error('Database delete failed');

      mockDb.delete.mockReturnValue({
        where: jest.fn().mockRejectedValue(dbError),
      });

      await expect(repository.deleteOldListings('2023-12-31')).rejects.toThrow(
        'Database delete failed'
      );

      expect(repository['logger']['error']).toHaveBeenCalledWith(
        expect.stringContaining('Failed to delete old listings')
      );
    });
  });
});
