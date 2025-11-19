import { Test, TestingModule } from '@nestjs/testing';
import { EnergyDiagnosticsRepository } from './energy-diagnostics.repository';
import { DATABASE_CONNECTION } from '~/database';
import { OpportunityType } from '@linkinvests/shared';
import { EnergyDiagnosticInput } from '@linkinvests/shared';

describe('EnergyDiagnosticsRepository', () => {
  let repository: EnergyDiagnosticsRepository;
  let mockDb: any;

  beforeEach(async () => {
    mockDb = {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      onConflictDoNothing: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnergyDiagnosticsRepository,
        {
          provide: DATABASE_CONNECTION,
          useValue: mockDb,
        },
      ],
    }).compile();

    repository = module.get<EnergyDiagnosticsRepository>(
      EnergyDiagnosticsRepository,
    );

    // Suppress logger output during tests
    jest.spyOn(repository['logger'], 'log').mockImplementation();
    jest.spyOn(repository['logger'], 'debug').mockImplementation();
    jest.spyOn(repository['logger'], 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('formatDateForDb', () => {
    it('should format Date to YYYY-MM-DD string', () => {
      const date = new Date('2024-03-15T10:30:00Z');
      const result = repository['formatDateForDb'](date);

      expect(result).toBe('2024-03-15');
    });

    it('should pad single-digit months with zero', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = repository['formatDateForDb'](date);

      expect(result).toBe('2024-01-15');
    });

    it('should pad single-digit days with zero', () => {
      const date = new Date('2024-03-05T10:30:00Z');
      const result = repository['formatDateForDb'](date);

      expect(result).toBe('2024-03-05');
    });

    it('should handle different years correctly', () => {
      const date2023 = new Date('2023-12-31T10:30:00Z');
      const date2025 = new Date('2025-01-01T10:30:00Z');

      expect(repository['formatDateForDb'](date2023)).toBe('2023-12-31');
      expect(repository['formatDateForDb'](date2025)).toBe('2025-01-01');
    });
  });

  describe('insertOpportunities', () => {
    it('should return 0 for empty array', async () => {
      const result = await repository.insertOpportunities([]);

      expect(result).toBe(0);
      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('should batch records (500 per batch by default)', async () => {
      const opportunities: EnergyDiagnosticInput[] = Array.from(
        { length: 1500 },
        (_, i) => ({
          dpeNumber: `DPE${i.toString().padStart(6, '0')}`,
          externalId: `DPE${i.toString().padStart(6, '0')}`,
          label: `Building ${i}`,
          address: `${i} Rue de Test`,
          zipCode: '75001',
          department: '75',
          latitude: 48.8566,
          longitude: 2.3522,
          opportunityDate: new Date('2024-01-15').toISOString().split('T')[0],
          squareFootage: 100,
          energyClass: 'A',
        }),
      );

      await repository.insertOpportunities(opportunities);

      // Should insert 3 batches (500, 500, 500)
      expect(mockDb.insert).toHaveBeenCalledTimes(3);
      expect(mockDb.values).toHaveBeenCalledTimes(3);
      expect(mockDb.onConflictDoNothing).toHaveBeenCalledTimes(3);
    });

    it('should allow custom batch size', async () => {
      const opportunities: EnergyDiagnosticInput[] = Array.from(
        { length: 300 },
        (_, i) => ({
          dpeNumber: `DPE${i.toString().padStart(6, '0')}`,
          externalId: `DPE${i.toString().padStart(6, '0')}`,
          label: `Building ${i}`,
          address: `${i} Rue de Test`,
          zipCode: '75001',
          department: '75',
          latitude: 48.8566,
          longitude: 2.3522,
          opportunityDate: new Date('2024-01-15').toISOString().split('T')[0],
          squareFootage: 100,
          energyClass: 'A',
        }),
      );

      await repository.insertOpportunities(opportunities, 100);

      // Should insert 3 batches (100, 100, 100)
      expect(mockDb.insert).toHaveBeenCalledTimes(3);
    });

    it('should call db.insert with correctly formatted data', async () => {
      const opportunities: EnergyDiagnosticInput[] = [
        {
          dpeNumber: 'DPE123456',
          externalId: 'DPE123456',
          label: 'Test Building',
          address: '123 Rue de Test',
          zipCode: '75001',
          department: '75',
          latitude: 48.8566,
          longitude: 2.3522,
          opportunityDate: new Date('2024-01-15T10:30:00Z')
            .toISOString()
            .split('T')[0],
          squareFootage: 100,
          energyClass: 'A',
        },
      ];

      await repository.insertOpportunities(opportunities);

      expect(mockDb.values).toHaveBeenCalledWith([
        {
          label: 'Test Building',
          siret: null,
          address: '123 Rue de Test',
          zipCode: '75001',
          department: '75',
          latitude: 48.8566,
          longitude: 2.3522,
          type: OpportunityType.ENERGY_SIEVE,
          status: 'pending_review',
          opportunityDate: '2024-01-15',
          externalId: 'DPE123456',
          contactData: null,
          extraData: null,
        },
      ]);
    });

    it('should set type to OpportunityType.ENERGY_SIEVE', async () => {
      const opportunities: EnergyDiagnosticInput[] = [
        {
          dpeNumber: 'DPE123456',
          externalId: 'DPE123456',
          label: 'Test Building',
          address: '123 Rue de Test',
          zipCode: '75001',
          department: '75',
          latitude: 48.8566,
          longitude: 2.3522,
          opportunityDate: new Date('2024-01-15').toISOString().split('T')[0],
          squareFootage: 100,
          energyClass: 'A',
        },
      ];

      await repository.insertOpportunities(opportunities);

      const callArgs = mockDb.values.mock.calls[0][0];
      expect(callArgs[0].type).toBe(OpportunityType.ENERGY_SIEVE);
    });

    it('should set siret to null (no SIRET for energy sieves)', async () => {
      const opportunities: EnergyDiagnosticInput[] = [
        {
          dpeNumber: 'DPE123456',
          externalId: 'DPE123456',
          label: 'Test Building',
          address: '123 Rue de Test',
          zipCode: '75001',
          department: '75',
          latitude: 48.8566,
          longitude: 2.3522,
          opportunityDate: new Date('2024-01-15').toISOString().split('T')[0],
          squareFootage: 100,
          energyClass: 'A',
        },
      ];

      await repository.insertOpportunities(opportunities);

      const callArgs = mockDb.values.mock.calls[0][0];
      expect(callArgs[0].siret).toBeNull();
    });

    it('should use onConflictDoNothing() for duplicates', async () => {
      const opportunities: EnergyDiagnosticInput[] = [
        {
          dpeNumber: 'DPE123456',
          externalId: 'DPE123456',
          label: 'Test Building',
          address: '123 Rue de Test',
          zipCode: '75001',
          department: '75',
          latitude: 48.8566,
          longitude: 2.3522,
          opportunityDate: new Date('2024-01-15').toISOString().split('T')[0],
          squareFootage: 100,
          energyClass: 'A',
        },
      ];

      await repository.insertOpportunities(opportunities);

      expect(mockDb.onConflictDoNothing).toHaveBeenCalled();
    });

    it('should throw error on database failure (rethrows)', async () => {
      const dbError = new Error('Database connection failed');
      mockDb.onConflictDoNothing.mockRejectedValue(dbError);

      const opportunities: EnergyDiagnosticInput[] = [
        {
          dpeNumber: 'DPE123456',
          externalId: 'DPE123456',
          squareFootage: 100,
          energyClass: 'A',
          label: 'Test Building',
          address: '123 Rue de Test',
          zipCode: '75001',
          department: '75',
          latitude: 48.8566,
          longitude: 2.3522,
          opportunityDate: new Date('2024-01-15').toISOString().split('T')[0],
        },
      ];

      await expect(
        repository.insertOpportunities(opportunities),
      ).rejects.toThrow('Database connection failed');
      expect(repository['logger'].error).toHaveBeenCalled();
    });
  });
});
