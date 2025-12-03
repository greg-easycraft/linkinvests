import { Test, TestingModule } from '@nestjs/testing';
import { CompanyBuildingsProcessor } from './company-buildings.processor';
import { S3Service } from '~/storage';
import {
  CsvParserService,
  GeocodingApiService,
  RechercheEntreprisesApiService,
} from './services';
import { FailingCompaniesOpportunityRepository } from './repositories';
import type { Etablissement } from './types/recherche-entreprises.types';
import type { FailingCompanyCsvRow } from './types/failing-companies.types';

describe('CompanyBuildingsProcessor', () => {
  let processor: CompanyBuildingsProcessor;
  let mockS3Service: jest.Mocked<S3Service>;
  let mockCsvParser: jest.Mocked<CsvParserService>;
  let mockRechercheApi: jest.Mocked<RechercheEntreprisesApiService>;
  let mockGeocodingApi: jest.Mocked<GeocodingApiService>;
  let mockRepository: jest.Mocked<FailingCompaniesOpportunityRepository>;

  beforeEach(async () => {
    mockS3Service = {
      downloadFile: jest.fn(),
      uploadFile: jest.fn(),
      deleteFile: jest.fn(),
    } as any;

    mockCsvParser = {
      parseCsv: jest.fn(),
      extractSirensFromRows: jest.fn(),
    } as any;

    mockRechercheApi = {
      getEstablishmentsBySiren: jest.fn(),
    } as any;

    mockGeocodingApi = {
      geocodeAddress: jest.fn(),
    } as any;

    mockRepository = {
      insertOpportunities: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyBuildingsProcessor,
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
        {
          provide: CsvParserService,
          useValue: mockCsvParser,
        },
        {
          provide: RechercheEntreprisesApiService,
          useValue: mockRechercheApi,
        },
        {
          provide: GeocodingApiService,
          useValue: mockGeocodingApi,
        },
        {
          provide: FailingCompaniesOpportunityRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    processor = module.get<CompanyBuildingsProcessor>(
      CompanyBuildingsProcessor
    );

    // Suppress logger output during tests
    jest.spyOn(processor['logger'], 'log').mockImplementation();
    jest.spyOn(processor['logger'], 'warn').mockImplementation();
    jest.spyOn(processor['logger'], 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('transformEstablishment', () => {
    const stats = {
      totalSirens: 0,
      establishmentsFound: 0,
      geocodingAttempts: 0,
      geocodingSuccesses: 0,
      geocodingFailures: 0,
      opportunitiesInserted: 0,
      errors: 0,
    };

    it('should successfully transform with existing coordinates', async () => {
      const etablissement: Etablissement = {
        siret: '12345678901234',
        adresse: '123 Rue de Test',
        code_postal: '75001',
        commune: 'Test Company',
        libelle_commune: 'Paris',
        latitude: 48.8566,
        longitude: 2.3522,
      };

      const result = await processor['transformEstablishment'](
        etablissement,
        '2024-01-15',
        stats
      );

      expect(result).toEqual({
        siret: '12345678901234',
        companyName: 'Test Company',
        address: '123 Rue de Test',
        zipCode: '75001',
        city: 'Paris',
        department: 75,
        latitude: 48.8566,
        longitude: 2.3522,
        opportunityDate: '2024-01-15',
      });
      expect(stats.geocodingAttempts).toBe(0);
    });

    it('should geocode when coordinates are missing', async () => {
      const etablissement: Etablissement = {
        siret: '12345678901234',
        adresse: '123 Rue de Test',
        code_postal: '75001',
        commune: 'Test Company',
        libelle_commune: 'Paris',
      };

      mockGeocodingApi.geocodeAddress.mockResolvedValue({
        latitude: 48.8566,
        longitude: 2.3522,
      });

      const result = await processor['transformEstablishment'](
        etablissement,
        '2024-01-15',
        stats
      );

      expect(mockGeocodingApi.geocodeAddress).toHaveBeenCalledWith(
        '123 Rue de Test 75001 Paris'
      );
      expect(result?.latitude).toBe(48.8566);
      expect(result?.longitude).toBe(2.3522);
      expect(stats.geocodingAttempts).toBe(1);
      expect(stats.geocodingSuccesses).toBe(1);
    });

    it('should return null when geocoding fails', async () => {
      const etablissement: Etablissement = {
        siret: '12345678901234',
        adresse: '123 Rue de Test',
        code_postal: '75001',
        commune: 'Test Company',
        libelle_commune: 'Paris',
      };

      mockGeocodingApi.geocodeAddress.mockResolvedValue(null);

      const freshStats = {
        totalSirens: 0,
        establishmentsFound: 0,
        geocodingAttempts: 0,
        geocodingSuccesses: 0,
        geocodingFailures: 0,
        opportunitiesInserted: 0,
        errors: 0,
      };

      const result = await processor['transformEstablishment'](
        etablissement,
        '2024-01-15',
        freshStats
      );

      expect(result).toBeNull();
      expect(freshStats.geocodingAttempts).toBe(1);
      expect(freshStats.geocodingFailures).toBe(1);
    });

    it('should extract department from postal code (first 2 digits)', async () => {
      const etablissement: Etablissement = {
        siret: '12345678901234',
        adresse: '123 Rue de Test',
        code_postal: '93000',
        commune: 'Test Company',
        libelle_commune: 'Bobigny',
        latitude: 48.9074,
        longitude: 2.4382,
      };

      const result = await processor['transformEstablishment'](
        etablissement,
        '2024-01-15',
        stats
      );

      expect(result?.department).toBe(93);
    });

    it('should use commune as companyName (fallback to "Unknown Company")', async () => {
      const etablissementWithCommune: Etablissement = {
        siret: '12345678901234',
        adresse: '123 Rue de Test',
        code_postal: '75001',
        commune: 'My Company',
        libelle_commune: 'Paris',
        latitude: 48.8566,
        longitude: 2.3522,
      };

      const result = await processor['transformEstablishment'](
        etablissementWithCommune,
        '2024-01-15',
        stats
      );

      expect(result?.companyName).toBe('My Company');

      // Test fallback
      const etablissementWithoutCommune: Etablissement = {
        ...etablissementWithCommune,
        commune: '',
      };

      const resultFallback = await processor['transformEstablishment'](
        etablissementWithoutCommune,
        '2024-01-15',
        stats
      );

      expect(resultFallback?.companyName).toBe('Unknown Company');
    });

    it('should update geocoding stats correctly', async () => {
      const etablissement: Etablissement = {
        siret: '12345678901234',
        adresse: '123 Rue de Test',
        code_postal: '75001',
        commune: 'Test Company',
        libelle_commune: 'Paris',
      };

      mockGeocodingApi.geocodeAddress.mockResolvedValue({
        latitude: 48.8566,
        longitude: 2.3522,
      });

      const statsTracker = {
        totalSirens: 0,
        establishmentsFound: 0,
        geocodingAttempts: 5,
        geocodingSuccesses: 3,
        geocodingFailures: 2,
        opportunitiesInserted: 0,
        errors: 0,
      };

      await processor['transformEstablishment'](
        etablissement,
        '2024-01-15',
        statsTracker
      );

      expect(statsTracker.geocodingAttempts).toBe(6);
      expect(statsTracker.geocodingSuccesses).toBe(4);
      expect(statsTracker.geocodingFailures).toBe(2);
    });

    it('should handle transformation errors gracefully', async () => {
      const etablissement: Etablissement = {
        siret: '12345678901234',
        adresse: '123 Rue de Test',
        code_postal: '75001',
        commune: 'Test Company',
        libelle_commune: 'Paris',
      };

      mockGeocodingApi.geocodeAddress.mockRejectedValue(
        new Error('Geocoding API error')
      );

      const result = await processor['transformEstablishment'](
        etablissement,
        '2024-01-15',
        stats
      );

      expect(result).toBeNull();
      expect(processor['logger'].error).toHaveBeenCalled();
    });
  });

  describe('uploadFailedRows', () => {
    it('should convert failed rows to CSV format', async () => {
      const failedRows: any[] = [
        { siren: '123456789', error_reason: 'No establishments found' },
        { siren: '987654321', error_reason: 'Geocoding failed' },
      ];

      mockS3Service.uploadFile.mockResolvedValue('s3://bucket/failed.csv');

      await processor['uploadFailedRows']('s3://bucket/source.csv', failedRows);

      expect(mockS3Service.uploadFile).toHaveBeenCalledWith(
        expect.any(Buffer),
        'source_failed.csv'
      );

      const buffer = mockS3Service.uploadFile.mock.calls[0]?.[0];
      const csvContent = buffer.toString('utf-8');
      expect(csvContent).toContain('siren;error_reason');
      expect(csvContent).toContain('123456789;No establishments found');
    });

    it('should extract S3 key from s3:// path', async () => {
      const failedRows: any[] = [
        { siren: '123456789', error_reason: 'No establishments found' },
      ];

      await processor['uploadFailedRows'](
        's3://my-bucket/path/to/source.csv',
        failedRows
      );

      expect(mockS3Service.uploadFile).toHaveBeenCalledWith(
        expect.any(Buffer),
        'path/to/source_failed.csv'
      );
    });

    it('should handle invalid S3 path format', async () => {
      const failedRows: any[] = [
        { siren: '123456789', error_reason: 'No establishments found' },
      ];

      await processor['uploadFailedRows']('invalid-path.csv', failedRows);

      // Should not throw, just log error
      expect(mockS3Service.uploadFile).not.toHaveBeenCalled();
    });

    it('should return early if no failed rows', async () => {
      await processor['uploadFailedRows']('s3://bucket/source.csv', []);

      expect(mockS3Service.uploadFile).not.toHaveBeenCalled();
    });

    it('should not throw on upload failure (logs error)', async () => {
      const failedRows: any[] = [
        { siren: '123456789', error_reason: 'No establishments found' },
      ];

      mockS3Service.uploadFile.mockRejectedValue(new Error('Upload failed'));

      await expect(
        processor['uploadFailedRows']('s3://bucket/source.csv', failedRows)
      ).resolves.not.toThrow();

      expect(processor['logger'].error).toHaveBeenCalled();
    });
  });

  describe('process', () => {
    const mockJob = {
      data: {
        sourceFile: 's3://bucket/source.csv',
      },
    } as any;

    const mockCsvRows: FailingCompanyCsvRow[] = [
      {
        numerodepartement: '75',
        departement_nom_officiel: 'Paris',
        familleavis_lib: 'Collective',
        typeavis_lib: 'Liquidation',
        dateparution: '2024-01-15',
        commercant: 'Company A',
        ville: 'Paris',
        cp: '75001',
        listepersonnes: '{"siren":"123456789"}',
        jugement: 'Tribunal',
      },
    ];

    it('should download CSV from S3', async () => {
      const csvBuffer = Buffer.from('csv,data', 'utf-8');
      mockS3Service.downloadFile.mockResolvedValue(csvBuffer);
      mockCsvParser.parseCsv.mockReturnValue(mockCsvRows);
      mockCsvParser.extractSirensFromRows.mockReturnValue([]);
      mockRepository.insertOpportunities.mockResolvedValue(0);
      mockS3Service.deleteFile.mockResolvedValue();

      await processor.process(mockJob);

      expect(mockS3Service.downloadFile).toHaveBeenCalledWith(
        's3://bucket/source.csv'
      );
    });

    it('should parse CSV and extract SIRENs', async () => {
      const csvBuffer = Buffer.from('csv,data', 'utf-8');
      mockS3Service.downloadFile.mockResolvedValue(csvBuffer);
      mockCsvParser.parseCsv.mockReturnValue(mockCsvRows);
      mockCsvParser.extractSirensFromRows.mockReturnValue([
        { siren: '123456789', row: mockCsvRows[0] },
      ]);
      mockRechercheApi.getEstablishmentsBySiren.mockResolvedValue([]);
      mockRepository.insertOpportunities.mockResolvedValue(0);
      mockS3Service.deleteFile.mockResolvedValue();

      await processor.process(mockJob);

      expect(mockCsvParser.parseCsv).toHaveBeenCalledWith(csvBuffer);
      expect(mockCsvParser.extractSirensFromRows).toHaveBeenCalledWith(
        mockCsvRows
      );
    });

    it('should fetch establishments for each SIREN', async () => {
      const csvBuffer = Buffer.from('csv,data', 'utf-8');
      mockS3Service.downloadFile.mockResolvedValue(csvBuffer);
      mockCsvParser.parseCsv.mockReturnValue(mockCsvRows);
      mockCsvParser.extractSirensFromRows.mockReturnValue([
        { siren: '123456789', row: mockCsvRows[0] },
      ]);
      mockRechercheApi.getEstablishmentsBySiren.mockResolvedValue([
        {
          siret: '12345678901234',
          adresse: '123 Rue de Test',
          code_postal: '75001',
          commune: 'Test Company',
          libelle_commune: 'Paris',
          latitude: 48.8566,
          longitude: 2.3522,
        },
      ]);
      mockRepository.insertOpportunities.mockResolvedValue(1);
      mockS3Service.deleteFile.mockResolvedValue();

      await processor.process(mockJob);

      expect(mockRechercheApi.getEstablishmentsBySiren).toHaveBeenCalledWith(
        '123456789'
      );
    });

    it('should handle "no establishments found" scenario', async () => {
      const csvBuffer = Buffer.from('csv,data', 'utf-8');
      mockS3Service.downloadFile.mockResolvedValue(csvBuffer);
      mockCsvParser.parseCsv.mockReturnValue(mockCsvRows);
      mockCsvParser.extractSirensFromRows.mockReturnValue([
        { siren: '123456789', row: mockCsvRows[0] },
      ]);
      mockRechercheApi.getEstablishmentsBySiren.mockResolvedValue([]);
      mockRepository.insertOpportunities.mockResolvedValue(0);
      mockS3Service.uploadFile.mockResolvedValue('s3://bucket/failed.csv');
      mockS3Service.deleteFile.mockResolvedValue();

      await processor.process(mockJob);

      expect(processor['logger'].warn).toHaveBeenCalledWith(
        'No establishments found for SIREN 123456789'
      );
      expect(mockS3Service.uploadFile).toHaveBeenCalled();
    });

    it('should delete source file after successful processing', async () => {
      const csvBuffer = Buffer.from('csv,data', 'utf-8');
      mockS3Service.downloadFile.mockResolvedValue(csvBuffer);
      mockCsvParser.parseCsv.mockReturnValue(mockCsvRows);
      mockCsvParser.extractSirensFromRows.mockReturnValue([]);
      mockRepository.insertOpportunities.mockResolvedValue(0);
      mockS3Service.deleteFile.mockResolvedValue();

      await processor.process(mockJob);

      expect(mockS3Service.deleteFile).toHaveBeenCalledWith(
        's3://bucket/source.csv'
      );
    });

    it('should upload failed rows if any errors occurred', async () => {
      const csvBuffer = Buffer.from('csv,data', 'utf-8');
      mockS3Service.downloadFile.mockResolvedValue(csvBuffer);
      mockCsvParser.parseCsv.mockReturnValue(mockCsvRows);
      mockCsvParser.extractSirensFromRows.mockReturnValue([
        { siren: '123456789', row: mockCsvRows[0] },
      ]);
      mockRechercheApi.getEstablishmentsBySiren.mockResolvedValue([]);
      mockRepository.insertOpportunities.mockResolvedValue(0);
      mockS3Service.uploadFile.mockResolvedValue('s3://bucket/failed.csv');
      mockS3Service.deleteFile.mockResolvedValue();

      await processor.process(mockJob);

      expect(mockS3Service.uploadFile).toHaveBeenCalled();
      expect(processor['logger'].warn).toHaveBeenCalledWith(
        expect.stringContaining('failed row(s)')
      );
    });
  });
});
