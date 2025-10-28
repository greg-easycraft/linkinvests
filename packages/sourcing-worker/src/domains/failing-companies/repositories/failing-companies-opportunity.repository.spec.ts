import { Test, TestingModule } from '@nestjs/testing';
import { FailingCompaniesOpportunityRepository } from './failing-companies-opportunity.repository';
import { DATABASE_CONNECTION } from '~/database';
import { OpportunityType } from '@linkinvest/shared';
import type { CompanyEstablishment } from '../types/failing-companies.types';

describe('FailingCompaniesOpportunityRepository', () => {
  let repository: FailingCompaniesOpportunityRepository;
  let mockDb: any;

  beforeEach(async () => {
    mockDb = {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      onConflictDoNothing: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FailingCompaniesOpportunityRepository,
        {
          provide: DATABASE_CONNECTION,
          useValue: mockDb,
        },
      ],
    }).compile();

    repository = module.get<FailingCompaniesOpportunityRepository>(
      FailingCompaniesOpportunityRepository,
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

    it('should transform establishments to opportunities correctly', async () => {
      const establishments: CompanyEstablishment[] = [
        {
          siret: '12345678901234',
          companyName: 'Test Company',
          address: '123 Rue de Test',
          zipCode: '75001',
          city: 'Paris',
          department: 75,
          latitude: 48.8566,
          longitude: 2.3522,
          opportunityDate: '2024-01-15',
        },
      ];

      await repository.insertOpportunities(establishments);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith([
        {
          label: 'Test Company',
          siret: '12345678901234',
          address: '123 Rue de Test',
          zipCode: 75001, // Parsed as integer
          department: 75,
          latitude: 48.8566,
          longitude: 2.3522,
          type: OpportunityType.LIQUIDATION,
          status: 'pending_review',
          opportunityDate: '2024-01-15',
        },
      ]);
      expect(mockDb.onConflictDoNothing).toHaveBeenCalled();
    });

    it('should set type to OpportunityType.LIQUIDATION', async () => {
      const establishments: CompanyEstablishment[] = [
        {
          siret: '12345678901234',
          companyName: 'Test Company',
          address: '123 Rue de Test',
          zipCode: '75001',
          city: 'Paris',
          department: 75,
          latitude: 48.8566,
          longitude: 2.3522,
          opportunityDate: '2024-01-15',
        },
      ];

      await repository.insertOpportunities(establishments);

      const callArgs = mockDb.values.mock.calls[0][0];
      expect(callArgs[0].type).toBe(OpportunityType.LIQUIDATION);
    });

    it('should parse zipCode string to integer', async () => {
      const establishments: CompanyEstablishment[] = [
        {
          siret: '12345678901234',
          companyName: 'Test Company',
          address: '123 Rue de Test',
          zipCode: '75001',
          city: 'Paris',
          department: 75,
          latitude: 48.8566,
          longitude: 2.3522,
          opportunityDate: '2024-01-15',
        },
      ];

      await repository.insertOpportunities(establishments);

      const callArgs = mockDb.values.mock.calls[0][0];
      expect(callArgs[0].zipCode).toBe(75001);
      expect(typeof callArgs[0].zipCode).toBe('number');
    });

    it('should use onConflictDoNothing() for duplicates', async () => {
      const establishments: CompanyEstablishment[] = [
        {
          siret: '12345678901234',
          companyName: 'Test Company',
          address: '123 Rue de Test',
          zipCode: '75001',
          city: 'Paris',
          department: 75,
          latitude: 48.8566,
          longitude: 2.3522,
          opportunityDate: '2024-01-15',
        },
      ];

      await repository.insertOpportunities(establishments);

      expect(mockDb.onConflictDoNothing).toHaveBeenCalled();
    });

    it('should return correct inserted count', async () => {
      const establishments: CompanyEstablishment[] = [
        {
          siret: '12345678901234',
          companyName: 'Company 1',
          address: '123 Rue de Test',
          zipCode: '75001',
          city: 'Paris',
          department: 75,
          latitude: 48.8566,
          longitude: 2.3522,
          opportunityDate: '2024-01-15',
        },
        {
          siret: '98765432109876',
          companyName: 'Company 2',
          address: '456 Avenue Test',
          zipCode: '93000',
          city: 'Bobigny',
          department: 93,
          latitude: 48.9074,
          longitude: 2.4382,
          opportunityDate: '2024-01-16',
        },
      ];

      const result = await repository.insertOpportunities(establishments);

      expect(result).toBe(2);
    });

    it('should throw error on database failure', async () => {
      const dbError = new Error('Database connection failed');
      mockDb.onConflictDoNothing.mockRejectedValue(dbError);

      const establishments: CompanyEstablishment[] = [
        {
          siret: '12345678901234',
          companyName: 'Test Company',
          address: '123 Rue de Test',
          zipCode: '75001',
          city: 'Paris',
          department: 75,
          latitude: 48.8566,
          longitude: 2.3522,
          opportunityDate: '2024-01-15',
        },
      ];

      await expect(
        repository.insertOpportunities(establishments),
      ).rejects.toThrow('Database connection failed');
      expect(repository['logger'].error).toHaveBeenCalled();
    });
  });
});
