import { Test, TestingModule } from '@nestjs/testing';
import { AuctionsOpportunityRepository } from './auctions-opportunity.repository';
import { DATABASE_CONNECTION } from '../../../database/database.module';
import type { AuctionOpportunity } from '../types';
import { AuctionSource } from '@linkinvests/shared';

describe('AuctionsOpportunityRepository', () => {
  let repository: AuctionsOpportunityRepository;
  let mockDb: any;

  const mockOpportunities: AuctionOpportunity[] = [
    {
      source: AuctionSource.ENCHERES_PUBLIQUES,
      url: 'https://encheres-publiques.fr/lot/test-1',
      label: 'Test Property 1',
      address: '1 Rue de la Paix, 75001 Paris, France',
      department: '75',
      zipCode: '75001',
      latitude: 48.8566,
      longitude: 2.3522,
      auctionDate: '2025-01-15T14:00:00.000Z',
      extraData: {
        url: 'https://encheres-publiques.fr/lot/test-1',
        id: '12345',
        auctionVenue: 'Tribunal de Paris',
      },
    },
    {
      source: AuctionSource.ENCHERES_PUBLIQUES,
      url: 'https://encheres-publiques.fr/lot/test-2',
      label: 'Test Property 2',
      address: '2 Avenue des Champs-Élysées, 75008 Paris, France',
      department: '75',
      zipCode: '75008',
      latitude: 48.8698,
      longitude: 2.3075,
      auctionDate: '2025-01-20T15:30:00.000Z',
      extraData: {
        url: 'https://encheres-publiques.fr/lot/test-2',
        id: '12346',
        auctionVenue: 'Tribunal de Paris',
      },
    },
  ];

  beforeEach(async () => {
    // Create mock database connection
    mockDb = {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      onConflictDoUpdate: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuctionsOpportunityRepository,
        { provide: DATABASE_CONNECTION, useValue: mockDb },
      ],
    }).compile();

    repository = module.get<AuctionsOpportunityRepository>(
      AuctionsOpportunityRepository
    );

    // Suppress logger
    jest.spyOn(repository['logger'], 'log').mockImplementation();
    jest.spyOn(repository['logger'], 'warn').mockImplementation();
    jest.spyOn(repository['logger'], 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('insertOpportunities', () => {
    it('should insert opportunities successfully', async () => {
      mockDb.returning.mockResolvedValue([
        { id: 1, externalId: 'encheres-publiques-12345' },
        { id: 2, externalId: 'encheres-publiques-12346' },
      ]);

      await repository.insertOpportunities(mockOpportunities);

      expect(mockDb.insert).toHaveBeenCalledTimes(1);
      expect(mockDb.values).toHaveBeenCalledWith([
        {
          label: 'Test Property 1',
          siret: null,
          address: '1 Rue de la Paix, 75001 Paris, France',
          zipCode: '75001',
          department: '75',
          latitude: 48.8566,
          longitude: 2.3522,
          type: 'auction',
          status: 'pending_review',
          opportunityDate: '2025-01-15T14:00:00.000Z',
          externalId: 'encheres-publiques-12345',
          contactData: {
            type: 'auction_house',
            name: 'Tribunal de Paris',
            address: '',
          },
          extraData: {
            url: 'https://encheres-publiques.fr/lot/test-1',
            id: '12345',
            auctionVenue: 'Tribunal de Paris',
          },
          images: null,
        },
        {
          label: 'Test Property 2',
          siret: null,
          address: '2 Avenue des Champs-Élysées, 75008 Paris, France',
          zipCode: '75008',
          department: '75',
          latitude: 48.8698,
          longitude: 2.3075,
          type: 'auction',
          status: 'pending_review',
          opportunityDate: '2025-01-20T15:30:00.000Z',
          externalId: 'encheres-publiques-12346',
          contactData: {
            type: 'auction_house',
            name: 'Tribunal de Paris',
            address: '',
          },
          extraData: {
            url: 'https://encheres-publiques.fr/lot/test-2',
            id: '12346',
            auctionVenue: 'Tribunal de Paris',
          },
          images: null,
        },
      ]);

      expect(mockDb.onConflictDoUpdate).toHaveBeenCalled();
      expect(repository['logger'].log).toHaveBeenCalledWith(
        { inserted: 2, total: 2 },
        'Successfully inserted 2 opportunities'
      );
    });

    it('should handle batch processing with custom batch size', async () => {
      const largeOpportunitiesArray = Array(1200)
        .fill(null)
        .map((_, index) => ({
          ...mockOpportunities[0],
          url: `https://encheres-publiques.fr/lot/test-${index}`,
          extraData: {
            ...mockOpportunities[0].extraData,
            id: `1234${index}`,
          },
        }));

      mockDb.onConflictDoUpdate.mockResolvedValue(undefined);

      await repository.insertOpportunities(largeOpportunitiesArray, 300);

      // Should process in batches of 300: 4 batches (300, 300, 300, 300)
      expect(mockDb.insert).toHaveBeenCalledTimes(4);
      expect(mockDb.values).toHaveBeenCalledTimes(4);

      // Verify first batch has 300 items
      const firstBatchCall = mockDb.values.mock.calls[0][0];
      expect(firstBatchCall).toHaveLength(300);

      // Verify last batch has remaining items
      const lastBatchCall = mockDb.values.mock.calls[3][0];
      expect(lastBatchCall).toHaveLength(300);
    });

    it('should handle partial batch (less than batch size)', async () => {
      const smallOpportunitiesArray = mockOpportunities.slice(0, 1);
      mockDb.onConflictDoUpdate.mockResolvedValue(undefined);

      await repository.insertOpportunities(smallOpportunitiesArray, 500);

      expect(mockDb.insert).toHaveBeenCalledTimes(1);
      expect(mockDb.values).toHaveBeenCalledTimes(1);

      const batchCall = mockDb.values.mock.calls[0][0];
      expect(batchCall).toHaveLength(1);
    });

    it('should handle empty opportunities array', async () => {
      const result = await repository.insertOpportunities([]);

      expect(result).toBe(0);
      expect(mockDb.insert).not.toHaveBeenCalled();
      expect(mockDb.values).not.toHaveBeenCalled();
      expect(repository['logger'].warn).toHaveBeenCalledWith(
        'No opportunities to insert'
      );
    });

    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      mockDb.onConflictDoUpdate.mockRejectedValue(dbError);

      await expect(
        repository.insertOpportunities(mockOpportunities)
      ).rejects.toThrow('Database connection failed');

      expect(repository['logger'].error).toHaveBeenCalledWith(
        { error: 'Database connection failed', batchStart: 0 },
        'Failed to insert batch'
      );
    });

    it('should handle opportunities without extraData', async () => {
      const opportunitiesWithoutExtraData: AuctionOpportunity[] = [
        {
          ...mockOpportunities[0],
          extraData: undefined,
        },
      ];

      mockDb.onConflictDoUpdate.mockResolvedValue(undefined);

      await repository.insertOpportunities(opportunitiesWithoutExtraData);

      const insertedData = mockDb.values.mock.calls[0][0][0];
      expect(insertedData.extraData).toBeUndefined();
      expect(insertedData.contactData).toEqual({
        venue: undefined,
      });
    });

    it('should handle opportunities without auctionVenue', async () => {
      const opportunitiesWithoutVenue: AuctionOpportunity[] = [
        {
          ...mockOpportunities[0],
          extraData: {
            url: 'https://test.com',
            id: '12345',
            // No auctionVenue
          },
        },
      ];

      mockDb.onConflictDoUpdate.mockResolvedValue(undefined);

      await repository.insertOpportunities(opportunitiesWithoutVenue);

      const insertedData = mockDb.values.mock.calls[0][0][0];
      expect(insertedData.contactData).toEqual({
        venue: undefined,
      });
    });

    it('should create correct external IDs', async () => {
      const opportunitiesWithDifferentIds: AuctionOpportunity[] = [
        {
          ...mockOpportunities[0],
          extraData: {
            ...mockOpportunities[0].extraData,
            id: 'ABC123',
          },
        },
        {
          ...mockOpportunities[1],
          extraData: {
            ...mockOpportunities[1].extraData,
            id: '999888',
          },
        },
      ];

      mockDb.onConflictDoUpdate.mockResolvedValue(undefined);

      await repository.insertOpportunities(opportunitiesWithDifferentIds);

      const insertedData = mockDb.values.mock.calls[0][0];
      expect(insertedData[0].externalId).toBe('encheres-publiques-ABC123');
      expect(insertedData[1].externalId).toBe('encheres-publiques-999888');
    });

    it('should handle numeric auction IDs', async () => {
      const opportunitiesWithNumericIds: AuctionOpportunity[] = [
        {
          ...mockOpportunities[0],
          extraData: {
            ...mockOpportunities[0].extraData,
            id: '123456',
          },
        },
      ];

      mockDb.onConflictDoUpdate.mockResolvedValue(undefined);

      await repository.insertOpportunities(opportunitiesWithNumericIds);

      const insertedData = mockDb.values.mock.calls[0][0][0];
      expect(insertedData.externalId).toBe('encheres-publiques-123456');
    });

    it('should map all fields correctly', async () => {
      mockDb.onConflictDoUpdate.mockResolvedValue(undefined);

      await repository.insertOpportunities([mockOpportunities[0]]);

      const insertedData = mockDb.values.mock.calls[0][0][0];

      expect(insertedData).toEqual({
        externalId: 'encheres-publiques-12345',
        type: 'auction',
        label: 'Test Property 1',
        address: '1 Rue de la Paix, 75001 Paris, France',
        city: 'Paris',
        department: '75',
        zipCode: '75001',
        latitude: 48.8566,
        longitude: 2.3522,
        opportunityDate: '2025-01-15T14:00:00.000Z', // Mapped from auctionDate
        contactData: {
          venue: 'Tribunal de Paris',
        },
        extraData: {
          url: 'https://encheres-publiques.fr/lot/test-1',
          auctionId: '12345',
          auctionVenue: 'Tribunal de Paris',
        },
      });
    });

    it('should configure upsert correctly', async () => {
      mockDb.onConflictDoUpdate.mockResolvedValue(undefined);

      await repository.insertOpportunities(mockOpportunities);

      expect(mockDb.onConflictDoUpdate).toHaveBeenCalledWith({
        target: expect.anything(), // Should target externalId and type
        set: expect.objectContaining({
          label: expect.anything(),
          address: expect.anything(),
          city: expect.anything(),
          department: expect.anything(),
          zipCode: expect.anything(),
          latitude: expect.anything(),
          longitude: expect.anything(),
          opportunityDate: expect.anything(),
          contactData: expect.anything(),
          extraData: expect.anything(),
        }),
      });
    });

    it('should log progress for large batches', async () => {
      const largeOpportunitiesArray = Array(1000)
        .fill(null)
        .map((_, index) => ({
          ...mockOpportunities[0],
          url: `https://test.com/${index}`,
          extraData: {
            ...mockOpportunities[0].extraData,
            id: `id-${index}`,
          },
        }));

      mockDb.onConflictDoUpdate.mockResolvedValue(undefined);

      await repository.insertOpportunities(largeOpportunitiesArray);

      // Should log progress for batch processing
      expect(repository['logger'].log).toHaveBeenCalledWith(
        expect.stringContaining('Processing batch')
      );
    });
  });

  describe('createExternalId', () => {
    it('should create external ID with string auction ID', () => {
      const result = repository['createExternalId']('ABC123');

      expect(result).toBe('encheres-publiques-ABC123');
    });

    it('should create external ID with numeric auction ID', () => {
      const result = repository['createExternalId']('123456');

      expect(result).toBe('encheres-publiques-123456');
    });

    it('should handle null auction ID', () => {
      const result = repository['createExternalId']('null');

      expect(result).toBe('encheres-publiques-null');
    });

    it('should handle undefined auction ID', () => {
      const result = repository['createExternalId']('undefined');

      expect(result).toBe('encheres-publiques-undefined');
    });

    it('should handle empty string auction ID', () => {
      const result = repository['createExternalId']('');

      expect(result).toBe('encheres-publiques-');
    });

    it('should handle special characters in auction ID', () => {
      const result = repository['createExternalId']('ABC-123_test');

      expect(result).toBe('encheres-publiques-ABC-123_test');
    });
  });

  describe('createContactData', () => {
    it('should create contact data with venue', () => {
      const result = repository['createContactData']('Tribunal de Paris');

      expect(result).toEqual({
        venue: 'Tribunal de Paris',
      });
    });

    it('should handle null venue', () => {
      const result = repository['createContactData'](null);

      expect(result).toEqual({
        venue: null,
      });
    });

    it('should handle undefined venue', () => {
      const result = repository['createContactData'](undefined);

      expect(result).toEqual({
        venue: undefined,
      });
    });

    it('should handle empty string venue', () => {
      const result = repository['createContactData']('');

      expect(result).toEqual({
        venue: '',
      });
    });

    it('should handle special characters in venue', () => {
      const venue =
        'Tribunal de Grande Instance - Section Commerciale (1er étage)';
      const result = repository['createContactData'](venue);

      expect(result).toEqual({
        venue: 'Tribunal de Grande Instance - Section Commerciale (1er étage)',
      });
    });
  });

  describe('database integration scenarios', () => {
    it('should handle constraint violations gracefully', async () => {
      const constraintError = new Error('UNIQUE constraint failed');
      constraintError.name = 'SqliteError';
      (constraintError as any).code = 'SQLITE_CONSTRAINT_UNIQUE';

      mockDb.returning.mockRejectedValue(constraintError);

      await expect(
        repository.insertOpportunities(mockOpportunities)
      ).rejects.toThrow('UNIQUE constraint failed');

      expect(repository['logger'].error).toHaveBeenCalledWith(
        'Failed to insert opportunities:',
        constraintError
      );
    });

    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Connection timeout');
      timeoutError.name = 'TimeoutError';

      mockDb.returning.mockRejectedValue(timeoutError);

      await expect(
        repository.insertOpportunities(mockOpportunities)
      ).rejects.toThrow('Connection timeout');
    });

    it('should handle partial batch failures', async () => {
      // Mock first batch success, second batch failure
      mockDb.returning
        .mockResolvedValueOnce([{ id: 1 }])
        .mockRejectedValueOnce(new Error('Database error'));

      const largeOpportunitiesArray = Array(1000)
        .fill(null)
        .map((_, index) => ({
          ...mockOpportunities[0],
          url: `https://test.com/${index}`,
          extraData: {
            ...mockOpportunities[0].extraData,
            id: `id-${index}`,
          },
        }));

      await expect(
        repository.insertOpportunities(largeOpportunitiesArray)
      ).rejects.toThrow('Database error');

      // Should have attempted both batches
      expect(mockDb.insert).toHaveBeenCalledTimes(2);
    });
  });

  describe('data validation edge cases', () => {
    it('should handle opportunities with null coordinates', async () => {
      const opportunitiesWithNullCoords: AuctionOpportunity[] = [
        {
          ...mockOpportunities[0],
          latitude: null as any,
          longitude: null as any,
        },
      ];

      mockDb.onConflictDoUpdate.mockResolvedValue(undefined);

      await repository.insertOpportunities(opportunitiesWithNullCoords);

      const insertedData = mockDb.values.mock.calls[0][0][0];
      expect(insertedData.latitude).toBeNull();
      expect(insertedData.longitude).toBeNull();
    });

    it('should handle opportunities with invalid zip codes', async () => {
      const opportunitiesWithInvalidZip: AuctionOpportunity[] = [
        {
          ...mockOpportunities[0],
          zipCode: 'INVALID' as any,
        },
      ];

      mockDb.onConflictDoUpdate.mockResolvedValue(undefined);

      await repository.insertOpportunities(opportunitiesWithInvalidZip);

      const insertedData = mockDb.values.mock.calls[0][0][0];
      expect(insertedData.zipCode).toBe('INVALID');
    });

    it('should handle very long addresses', async () => {
      const longAddress = 'A'.repeat(1000);
      const opportunitiesWithLongAddress: AuctionOpportunity[] = [
        {
          ...mockOpportunities[0],
          address: longAddress,
        },
      ];

      mockDb.onConflictDoUpdate.mockResolvedValue(undefined);

      await repository.insertOpportunities(opportunitiesWithLongAddress);

      const insertedData = mockDb.values.mock.calls[0][0][0];
      expect(insertedData.address).toBe(longAddress);
    });

    it('should handle special characters in all string fields', async () => {
      const opportunitiesWithSpecialChars: AuctionOpportunity[] = [
        {
          ...mockOpportunities[0],
          label: 'Propriété avec caractères spéciaux: ñáéíóú & <>&"',
          address: 'Rue de l\'Église, 75001 Paris "France"',
        },
      ];

      mockDb.onConflictDoUpdate.mockResolvedValue(undefined);

      await repository.insertOpportunities(opportunitiesWithSpecialChars);

      const insertedData = mockDb.values.mock.calls[0][0][0];
      expect(insertedData.label).toBe(
        'Propriété avec caractères spéciaux: ñáéíóú & <>&"'
      );
      expect(insertedData.address).toBe(
        'Rue de l\'Église, 75001 Paris "France"'
      );
      expect(insertedData.city).toBe('Saint-Étienne-du-Rouvray');
    });
  });
});
