import { Test, TestingModule } from '@nestjs/testing';
import { EnergySievesProcessor } from './energy-sieves.processor';
import { AdemeApiService } from './services';
import { EnergySievesOpportunityRepository } from './repositories';
import type { DpeRecord } from './types/energy-sieves.types';

describe('EnergySievesProcessor', () => {
  let processor: EnergySievesProcessor;
  let mockAdemeApi: jest.Mocked<AdemeApiService>;
  let mockRepository: jest.Mocked<EnergySievesOpportunityRepository>;

  beforeEach(async () => {
    mockAdemeApi = {
      fetchAllDpeRecords: jest.fn(),
    } as any;

    mockRepository = {
      insertOpportunities: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnergySievesProcessor,
        {
          provide: AdemeApiService,
          useValue: mockAdemeApi,
        },
        {
          provide: EnergySievesOpportunityRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    processor = module.get<EnergySievesProcessor>(EnergySievesProcessor);

    // Suppress logger output during tests
    jest.spyOn(processor['logger'], 'log').mockImplementation();
    jest.spyOn(processor['logger'], 'warn').mockImplementation();
    jest.spyOn(processor['logger'], 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('transformDpeRecord', () => {
    const validRecord: DpeRecord = {
      numero_dpe: 'DPE123',
      adresse_ban: '123 Rue de Test',
      code_postal_ban: '75001',
      nom_commune_ban: 'Paris',
      code_departement_ban: '75',
      etiquette_dpe: 'F',
      etiquette_ges: 'F',
      _geopoint: '48.8566,2.3522',
      date_etablissement_dpe: '2024-01-15',
      date_reception_dpe: '2024-01-16',
      type_batiment: 'Appartement',
      annee_construction: '1950',
      surface_habitable_logement: 50,
    };

    it('should successfully transform valid DPE record', () => {
      const result = processor['transformDpeRecord'](validRecord, 75);

      expect(result).toEqual({
        label: '123 Rue de Test',
        address: '123 Rue de Test',
        zipCode: 75001,
        department: 75,
        latitude: 48.8566,
        longitude: 2.3522,
        opportunityDate: new Date('2024-01-15'),
      });
    });

    it('should return null for missing adresse_ban', () => {
      const record = { ...validRecord, adresse_ban: '' };
      const result = processor['transformDpeRecord'](record, 75);

      expect(result).toBeNull();
    });

    it('should return null for missing code_postal_ban', () => {
      const record = { ...validRecord, code_postal_ban: '' };
      const result = processor['transformDpeRecord'](record, 75);

      expect(result).toBeNull();
    });

    it('should return null for missing _geopoint', () => {
      const record = { ...validRecord, _geopoint: '' };
      const result = processor['transformDpeRecord'](record, 75);

      expect(result).toBeNull();
    });

    it('should return null for invalid coordinates (NaN)', () => {
      const record = { ...validRecord, _geopoint: 'invalid,coordinates' };
      const result = processor['transformDpeRecord'](record, 75);

      expect(result).toBeNull();
    });

    it('should return null for invalid postal code (NaN)', () => {
      const record = { ...validRecord, code_postal_ban: 'INVALID' };
      const result = processor['transformDpeRecord'](record, 75);

      expect(result).toBeNull();
    });

    it('should return null for missing opportunity date', () => {
      const record = {
        ...validRecord,
        date_etablissement_dpe: '',
        date_reception_dpe: '',
      };
      const result = processor['transformDpeRecord'](record, 75);

      expect(result).toBeNull();
    });

    it('should use date_etablissement_dpe as primary date', () => {
      const result = processor['transformDpeRecord'](validRecord, 75);

      expect(result?.opportunityDate).toEqual(new Date('2024-01-15'));
    });

    it('should fall back to date_reception_dpe when etablissement missing', () => {
      const record = { ...validRecord, date_etablissement_dpe: '' };
      const result = processor['transformDpeRecord'](record, 75);

      expect(result?.opportunityDate).toEqual(new Date('2024-01-16'));
    });

    it('should parse _geopoint correctly (lat,lon format)', () => {
      const record = { ...validRecord, _geopoint: '45.7578,4.8320' };
      const result = processor['transformDpeRecord'](record, 75);

      expect(result?.latitude).toBe(45.7578);
      expect(result?.longitude).toBe(4.832);
    });

    it('should create label from address', () => {
      const result = processor['transformDpeRecord'](validRecord, 75);

      expect(result?.label).toBe('123 Rue de Test');
    });

    it('should fallback to commune when address is missing', () => {
      const record = {
        ...validRecord,
        adresse_ban: '',
        nom_commune_ban: 'Paris',
      };
      const result = processor['transformDpeRecord'](record, 75);

      expect(result).toBeNull(); // Will be null because adresse_ban is required
    });

    it('should convert date string to Date object', () => {
      const result = processor['transformDpeRecord'](validRecord, 75);

      expect(result?.opportunityDate).toBeInstanceOf(Date);
      expect(result?.opportunityDate.toISOString()).toContain('2024-01-15');
    });
  });

  describe('process', () => {
    const mockJob = {
      data: {
        departmentId: 75,
        sinceDate: '2024-01-01',
        energyClasses: ['F', 'G'],
      },
    } as any;

    const mockDpeRecords: DpeRecord[] = [
      {
        numero_dpe: 'DPE123',
        adresse_ban: '123 Rue de Test',
        code_postal_ban: '75001',
        nom_commune_ban: 'Paris',
        code_departement_ban: '75',
        etiquette_dpe: 'F',
        etiquette_ges: 'F',
        _geopoint: '48.8566,2.3522',
        date_etablissement_dpe: '2024-01-15',
        date_reception_dpe: '2024-01-16',
        type_batiment: 'Appartement',
        annee_construction: '1950',
        surface_habitable_logement: 50,
      },
      {
        numero_dpe: 'DPE456',
        adresse_ban: '456 Avenue Test',
        code_postal_ban: '75002',
        nom_commune_ban: 'Paris',
        code_departement_ban: '75',
        etiquette_dpe: 'G',
        etiquette_ges: 'G',
        _geopoint: '48.8700,2.3400',
        date_etablissement_dpe: '2024-01-16',
        date_reception_dpe: '2024-01-17',
        type_batiment: 'Maison',
        annee_construction: '1960',
        surface_habitable_logement: 100,
      },
    ];

    it('should orchestrate full flow with mocked dependencies', async () => {
      mockAdemeApi.fetchAllDpeRecords.mockResolvedValue(mockDpeRecords);
      mockRepository.insertOpportunities.mockResolvedValue(2);

      await processor.process(mockJob);

      expect(mockAdemeApi.fetchAllDpeRecords).toHaveBeenCalledWith(
        75,
        '2024-01-01',
        ['F', 'G'],
      );
      expect(mockRepository.insertOpportunities).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            address: '123 Rue de Test',
            zipCode: 75001,
          }),
          expect.objectContaining({
            address: '456 Avenue Test',
            zipCode: 75002,
          }),
        ]),
      );
    });

    it('should handle API errors gracefully (logs and rethrows)', async () => {
      const apiError = new Error('API connection failed');
      mockAdemeApi.fetchAllDpeRecords.mockRejectedValue(apiError);

      await expect(processor.process(mockJob)).rejects.toThrow(
        'API connection failed',
      );
      expect(processor['logger'].error).toHaveBeenCalled();
    });

    it('should handle repository insertion errors gracefully', async () => {
      mockAdemeApi.fetchAllDpeRecords.mockResolvedValue(mockDpeRecords);
      const dbError = new Error('Database error');
      mockRepository.insertOpportunities.mockRejectedValue(dbError);

      await processor.process(mockJob);

      // Should log error but not throw (error is caught and logged)
      expect(processor['logger'].error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to insert opportunities'),
      );
    });
  });
});
