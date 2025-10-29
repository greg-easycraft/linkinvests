import { Test, TestingModule } from '@nestjs/testing';
import { OpportunityType } from '@linkinvests/shared';

import { DATABASE_CONNECTION } from '~/database';

import { DeceasesOpportunityRepository } from './deceases-opportunity.repository';
import type { DeceasesOpportunity } from '../types/deceases.types';

describe('DeceasesOpportunityRepository', () => {
  let repository: DeceasesOpportunityRepository;
  let mockDb: jest.Mocked<{
    insert: jest.Mock;
    values: jest.Mock;
    onConflictDoNothing: jest.Mock;
  }>;

  beforeEach(async () => {
    mockDb = {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      onConflictDoNothing: jest.fn().mockResolvedValue(undefined),
    } as unknown as typeof mockDb;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeceasesOpportunityRepository,
        {
          provide: DATABASE_CONNECTION,
          useValue: mockDb,
        },
      ],
    }).compile();

    repository = module.get<DeceasesOpportunityRepository>(
      DeceasesOpportunityRepository,
    );

    // Suppress logger output during tests
    jest.spyOn(repository['logger'], 'log').mockImplementation();
    jest.spyOn(repository['logger'], 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('insertOpportunities', () => {
    it('should return 0 for empty array', async () => {
      const result = await repository.insertOpportunities([]);

      expect(result).toBe(0);
      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('should insert single opportunity successfully', async () => {
      const opportunities: DeceasesOpportunity[] = [
        {
          label: 'DUPONT Jean',
          siret: null,
          address: 'Mairie de Paris',
          zipCode: '75001',
          department: '75',
          latitude: 48.8566,
          longitude: 2.3522,
          opportunityDate: '2024-01-15',
        },
      ];

      const result = await repository.insertOpportunities(opportunities);

      expect(result).toBe(1);
      expect(mockDb.insert).toHaveBeenCalledTimes(1);
      expect(mockDb.values).toHaveBeenCalledWith([
        {
          label: 'DUPONT Jean',
          siret: null,
          address: 'Mairie de Paris',
          zipCode: 75001,
          department: 75,
          latitude: 48.8566,
          longitude: 2.3522,
          type: OpportunityType.SUCCESSION,
          status: 'pending_review',
          opportunityDate: '2024-01-15',
        },
      ]);
      expect(mockDb.onConflictDoNothing).toHaveBeenCalledTimes(1);
    });

    it('should batch records (500 per batch by default)', async () => {
      const opportunities: DeceasesOpportunity[] = Array.from(
        { length: 1500 },
        (_, i) => ({
          label: `PERSON ${i}`,
          siret: null,
          address: `${i} Rue de Test`,
          zipCode: '75001',
          department: '75',
          latitude: 48.8566,
          longitude: 2.3522,
          opportunityDate: '2024-01-15',
        }),
      );

      const result = await repository.insertOpportunities(opportunities);

      expect(result).toBe(1500);
      // Should insert 3 batches (500, 500, 500)
      expect(mockDb.insert).toHaveBeenCalledTimes(3);
      expect(mockDb.values).toHaveBeenCalledTimes(3);
      expect(mockDb.onConflictDoNothing).toHaveBeenCalledTimes(3);
    });

    it('should respect custom batch size', async () => {
      const opportunities: DeceasesOpportunity[] = Array.from(
        { length: 1000 },
        (_, i) => ({
          label: `PERSON ${i}`,
          siret: null,
          address: `${i} Rue de Test`,
          zipCode: '75001',
          department: '75',
          latitude: 48.8566,
          longitude: 2.3522,
          opportunityDate: '2024-01-15',
        }),
      );

      const result = await repository.insertOpportunities(opportunities, 250);

      expect(result).toBe(1000);
      // Should insert 4 batches (250, 250, 250, 250)
      expect(mockDb.insert).toHaveBeenCalledTimes(4);
    });

    it('should convert string zipCode and department to integers', async () => {
      const opportunities: DeceasesOpportunity[] = [
        {
          label: 'TEST',
          siret: null,
          address: 'Test Address',
          zipCode: '75001',
          department: '75',
          latitude: 48.8566,
          longitude: 2.3522,
          opportunityDate: '2024-01-15',
        },
      ];

      await repository.insertOpportunities(opportunities);

      expect(mockDb.values).toHaveBeenCalledWith([
        expect.objectContaining({
          zipCode: 75001,
          department: 75,
        }),
      ]);
    });

    it('should use OpportunityType.SUCCESSION for all records', async () => {
      const opportunities: DeceasesOpportunity[] = [
        {
          label: 'TEST 1',
          siret: null,
          address: 'Address 1',
          zipCode: '75001',
          department: '75',
          latitude: 48.8566,
          longitude: 2.3522,
          opportunityDate: '2024-01-15',
        },
        {
          label: 'TEST 2',
          siret: null,
          address: 'Address 2',
          zipCode: '75002',
          department: '75',
          latitude: 48.8566,
          longitude: 2.3522,
          opportunityDate: '2024-01-16',
        },
      ];

      await repository.insertOpportunities(opportunities);

      expect(mockDb.values).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ type: OpportunityType.SUCCESSION }),
          expect.objectContaining({ type: OpportunityType.SUCCESSION }),
        ]),
      );
    });

    it('should set status to pending_review for all records', async () => {
      const opportunities: DeceasesOpportunity[] = [
        {
          label: 'TEST',
          siret: null,
          address: 'Test Address',
          zipCode: '75001',
          department: '75',
          latitude: 48.8566,
          longitude: 2.3522,
          opportunityDate: '2024-01-15',
        },
      ];

      await repository.insertOpportunities(opportunities);

      expect(mockDb.values).toHaveBeenCalledWith([
        expect.objectContaining({ status: 'pending_review' }),
      ]);
    });

    it('should log progress for each batch', async () => {
      const opportunities: DeceasesOpportunity[] = Array.from(
        { length: 1000 },
        (_, i) => ({
          label: `PERSON ${i}`,
          siret: null,
          address: `${i} Rue de Test`,
          zipCode: '75001',
          department: '75',
          latitude: 48.8566,
          longitude: 2.3522,
          opportunityDate: '2024-01-15',
        }),
      );

      await repository.insertOpportunities(opportunities);

      expect(repository['logger'].log).toHaveBeenCalledWith(
        'Batch 1: Inserted 500/1000 opportunities',
      );
      expect(repository['logger'].log).toHaveBeenCalledWith(
        'Batch 2: Inserted 1000/1000 opportunities',
      );
    });

    it('should log final success message', async () => {
      const opportunities: DeceasesOpportunity[] = [
        {
          label: 'TEST',
          siret: null,
          address: 'Test Address',
          zipCode: '75001',
          department: '75',
          latitude: 48.8566,
          longitude: 2.3522,
          opportunityDate: '2024-01-15',
        },
      ];

      await repository.insertOpportunities(opportunities);

      expect(repository['logger'].log).toHaveBeenCalledWith(
        'Successfully inserted 1 opportunities',
      );
    });

    it('should handle database errors and rethrow', async () => {
      const dbError = new Error('Database connection failed');
      mockDb.onConflictDoNothing.mockRejectedValue(dbError);

      const opportunities: DeceasesOpportunity[] = [
        {
          label: 'TEST',
          siret: null,
          address: 'Test Address',
          zipCode: '75001',
          department: '75',
          latitude: 48.8566,
          longitude: 2.3522,
          opportunityDate: '2024-01-15',
        },
      ];

      await expect(
        repository.insertOpportunities(opportunities),
      ).rejects.toThrow('Database connection failed');

      expect(repository['logger'].error).toHaveBeenCalledWith(
        expect.objectContaining({
          error: dbError,
          batchStart: 0,
          batchSize: 1,
        }),
        'Failed to insert batch',
      );
    });

    it('should preserve all opportunity fields', async () => {
      const opportunity: DeceasesOpportunity = {
        label: 'MARTIN Marie Louise',
        siret: null,
        address: 'Mairie de Lyon',
        zipCode: '69001',
        department: '69',
        latitude: 45.7578,
        longitude: 4.832,
        opportunityDate: '2024-03-20',
      };

      await repository.insertOpportunities([opportunity]);

      expect(mockDb.values).toHaveBeenCalledWith([
        {
          label: 'MARTIN Marie Louise',
          siret: null,
          address: 'Mairie de Lyon',
          zipCode: 69001,
          department: 69,
          latitude: 45.7578,
          longitude: 4.832,
          type: OpportunityType.SUCCESSION,
          status: 'pending_review',
          opportunityDate: '2024-03-20',
        },
      ]);
    });
  });
});
