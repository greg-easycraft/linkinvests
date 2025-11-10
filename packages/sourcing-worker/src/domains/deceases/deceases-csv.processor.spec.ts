import { Test } from '@nestjs/testing';
import { Job } from 'bullmq';

import { S3Service } from '~/storage/s3.service';
import { DeceasesCsvProcessor } from './deceases-csv.processor';
import { CsvParsingService } from './services/csv-parsing.service';
import { InseeApiService } from './services/insee-api.service';
import { DeceasesOpportunityRepository } from './repositories/deceases-opportunity.repository';
import { DeceasesCsvProcessJobData, InseeCsvRow } from './types/deceases.types';

// Mock services
const mockS3Service = {
  downloadFile: jest.fn(),
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
  generateFailingCompaniesKey: jest.fn(),
} as unknown as jest.Mocked<S3Service>;

const mockCsvParsingService = {
  parseCsv: jest.fn(),
  convertToDeathRecord: jest.fn(),
  generateFailedRecordsCsv: jest.fn(),
} as unknown as jest.Mocked<CsvParsingService>;

const mockInseeApiService = {
  fetchMairieData: jest.fn(),
} as unknown as jest.Mocked<InseeApiService>;

const mockRepository = {
  insertOpportunities: jest.fn(),
} as unknown as jest.Mocked<DeceasesOpportunityRepository>;

const DUMMY_CSV_ROW: InseeCsvRow = {
  nomprenom: 'MARTIN*JEAN/',
  sexe: '1',
  datenaiss: '19400101',
  lieunaiss: '75001',
  commnaiss: 'PARIS',
  paysnaiss: '',
  datedeces: '20231201',
  lieudeces: '75001',
  actedeces: '001',
};

describe('DeceasesCsvProcessor', () => {
  let processor: DeceasesCsvProcessor;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DeceasesCsvProcessor,
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
        {
          provide: CsvParsingService,
          useValue: mockCsvParsingService,
        },
        {
          provide: InseeApiService,
          useValue: mockInseeApiService,
        },
        {
          provide: DeceasesOpportunityRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    processor = module.get<DeceasesCsvProcessor>(DeceasesCsvProcessor);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('process', () => {
    it('should process CSV successfully', async () => {
      const jobData: DeceasesCsvProcessJobData = {
        s3Path: 's3://test-bucket/deceases/raw/Deces_2025_M10.csv',
        fileName: 'Deces_2025_M10.csv',
      };

      const mockJob = {
        id: 'test-job-123',
        data: jobData,
      } as Job<DeceasesCsvProcessJobData>;

      // Mock CSV download
      const csvBuffer = Buffer.from('csv,content');
      mockS3Service.downloadFile.mockResolvedValueOnce(csvBuffer);
      // Mock download again for archiving
      mockS3Service.downloadFile.mockResolvedValueOnce(csvBuffer);

      // Mock CSV parsing
      mockCsvParsingService.parseCsv.mockResolvedValueOnce({
        rows: [DUMMY_CSV_ROW],
        stats: {
          totalRecords: 1,
          recordsProcessed: 1,
          recordsFiltered: 0,
        },
      });

      // Mock mairie data
      mockInseeApiService.fetchMairieData.mockResolvedValueOnce({
        contactInfo: {
          name: 'Mairie de Paris 1er',
          phone: '01.42.76.40.40',
          email: 'mairie01@paris.fr',
          address: {
            complement1: 'Hôtel de Ville',
            complement2: 'Place',
            numero_voie: '4',
            service_distribution: "Place de l'Hôtel de Ville",
            code_postal: '75001',
            nom_commune: 'Paris',
          },
        },
        coordinates: {
          latitude: 48.8566,
          longitude: 2.3522,
        },
        address: "4 Place de l'Hôtel de Ville 75001 Paris",
        zipCode: '75001',
      });

      // Mock repository insert
      mockRepository.insertOpportunities.mockResolvedValueOnce(1);

      // Mock file archiving
      mockS3Service.uploadFile.mockResolvedValueOnce('s3://archived/path');
      mockS3Service.deleteFile.mockResolvedValueOnce();

      await processor.process(mockJob);

      // Verify CSV was downloaded
      expect(mockS3Service.downloadFile).toHaveBeenCalledWith(
        's3://test-bucket/deceases/raw/Deces_2025_M10.csv',
      );

      // Verify CSV was parsed
      expect(mockCsvParsingService.parseCsv).toHaveBeenCalledWith(
        csvBuffer,
        50,
      );

      // Verify mairie data was fetched
      expect(mockInseeApiService.fetchMairieData).toHaveBeenCalledWith('75001');

      // Verify opportunities were inserted
      expect(mockRepository.insertOpportunities).toHaveBeenCalledWith([
        expect.objectContaining({
          inseeDeathId: '75001_20231201_001',
          label: 'Martin Jean',
          address: 'PARIS',
          zipCode: '75001',
          department: '75',
          latitude: 48.8566,
          longitude: 2.3522,
          opportunityDate: '2023-12-01',
        }),
      ]);

      // Verify file was archived
      expect(mockS3Service.uploadFile).toHaveBeenCalledWith(
        csvBuffer,
        'deceases/processed/Deces_2025_M10.csv',
      );
      expect(mockS3Service.deleteFile).toHaveBeenCalledWith(
        's3://test-bucket/deceases/raw/Deces_2025_M10.csv',
      );
    });

    it('should handle empty CSV', async () => {
      const jobData: DeceasesCsvProcessJobData = {
        s3Path: 's3://test-bucket/deceases/raw/empty.csv',
        fileName: 'empty.csv',
      };

      const mockJob = {
        id: 'test-job-123',
        data: jobData,
      } as Job<DeceasesCsvProcessJobData>;

      const csvBuffer = Buffer.from('');
      mockS3Service.downloadFile.mockResolvedValueOnce(csvBuffer);
      // Mock download again for archiving
      mockS3Service.downloadFile.mockResolvedValueOnce(csvBuffer);

      mockCsvParsingService.parseCsv.mockResolvedValueOnce({
        rows: [],
        stats: {
          totalRecords: 0,
          recordsProcessed: 0,
          recordsFiltered: 0,
        },
      });

      // Mock file archiving
      mockS3Service.uploadFile.mockResolvedValueOnce('s3://archived/path');
      mockS3Service.deleteFile.mockResolvedValueOnce();

      await processor.process(mockJob);

      expect(mockRepository.insertOpportunities).not.toHaveBeenCalled();
      expect(mockS3Service.uploadFile).toHaveBeenCalledWith(
        csvBuffer,
        'deceases/processed/empty.csv',
      );
    });

    it('should handle geocoding failures', async () => {
      const jobData: DeceasesCsvProcessJobData = {
        s3Path: 's3://test-bucket/deceases/raw/test.csv',
        fileName: 'test.csv',
      };

      const mockJob = {
        id: 'test-job-123',
        data: jobData,
      } as Job<DeceasesCsvProcessJobData>;

      const csvBuffer = Buffer.from('csv,content');
      mockS3Service.downloadFile.mockResolvedValueOnce(csvBuffer);
      // Mock download again for archiving
      mockS3Service.downloadFile.mockResolvedValueOnce(csvBuffer);

      mockCsvParsingService.parseCsv.mockResolvedValueOnce({
        rows: [DUMMY_CSV_ROW],
        stats: {
          totalRecords: 1,
          recordsProcessed: 1,
          recordsFiltered: 0,
        },
      });

      // Mock mairie data fetch failure
      mockInseeApiService.fetchMairieData.mockResolvedValueOnce(null);

      // Mock failed records CSV generation
      mockCsvParsingService.generateFailedRecordsCsv.mockReturnValueOnce(
        'failed,csv,content',
      );

      // Mock file operations
      mockS3Service.uploadFile.mockResolvedValue('s3://path');
      mockS3Service.deleteFile.mockResolvedValueOnce();

      await processor.process(mockJob);

      // Should not insert any opportunities due to geocoding failure
      expect(mockRepository.insertOpportunities).not.toHaveBeenCalled();

      // Should upload failed records
      expect(mockS3Service.uploadFile).toHaveBeenCalledWith(
        Buffer.from('failed,csv,content', 'utf-8'),
        'deceases/failed/test_failed.csv',
      );
    });

    it('should handle processing errors and continue', async () => {
      const jobData: DeceasesCsvProcessJobData = {
        s3Path: 's3://test-bucket/deceases/raw/test.csv',
        fileName: 'test.csv',
      };

      const mockJob = {
        id: 'test-job-123',
        data: jobData,
      } as Job<DeceasesCsvProcessJobData>;

      const csvBuffer = Buffer.from('csv,content');
      mockS3Service.downloadFile.mockResolvedValueOnce(csvBuffer);

      // Create multiple rows, some will fail
      const validRow = { ...DUMMY_CSV_ROW };
      const invalidRow = { ...DUMMY_CSV_ROW, lieudeces: '' }; // Missing required field

      mockCsvParsingService.parseCsv.mockResolvedValueOnce({
        rows: [validRow, invalidRow],
        stats: {
          totalRecords: 2,
          recordsProcessed: 2,
          recordsFiltered: 0,
        },
      });

      // Mock mairie data fetch failure for valid row
      mockInseeApiService.fetchMairieData.mockResolvedValueOnce(null);

      mockRepository.insertOpportunities.mockResolvedValueOnce(1);
      mockCsvParsingService.generateFailedRecordsCsv.mockReturnValueOnce(
        'failed,csv',
      );
      mockS3Service.uploadFile.mockResolvedValue('s3://path');
      mockS3Service.deleteFile.mockResolvedValueOnce();

      await processor.process(mockJob);

      // Should process only the valid row
      expect(mockRepository.insertOpportunities).toHaveBeenCalledWith([
        expect.objectContaining({
          inseeDeathId: '75001_20231201_001',
        }),
      ]);

      // Should generate failed records CSV for the invalid row
      expect(
        mockCsvParsingService.generateFailedRecordsCsv,
      ).toHaveBeenCalledWith([
        {
          row: invalidRow,
          error: 'Missing required fields: nomprenom, datedeces, or lieudeces',
        },
      ]);
    });
  });

  describe('generateDeathId', () => {
    it('should generate unique death ID', async () => {
      // This tests the private method through the public process method
      const jobData: DeceasesCsvProcessJobData = {
        s3Path: 's3://test-bucket/test.csv',
        fileName: 'test.csv',
      };

      const mockJob = {
        id: 'test',
        data: jobData,
      } as Job<DeceasesCsvProcessJobData>;

      mockS3Service.downloadFile.mockResolvedValueOnce(Buffer.from(''));
      mockCsvParsingService.parseCsv.mockResolvedValueOnce({
        rows: [DUMMY_CSV_ROW],
        stats: { totalRecords: 1, recordsProcessed: 1, recordsFiltered: 0 },
      });

      mockInseeApiService.fetchMairieData.mockResolvedValueOnce(null);
      mockRepository.insertOpportunities.mockResolvedValueOnce(1);
      mockS3Service.uploadFile.mockResolvedValue('');
      mockS3Service.deleteFile.mockResolvedValueOnce();

      await processor.process(mockJob);

      expect(mockRepository.insertOpportunities).toHaveBeenCalledWith([
        expect.objectContaining({
          inseeDeathId: '75001_20231201_001', // lieudeces_datedeces_actedeces
        }),
      ]);
    });
  });

  describe('department extraction', () => {
    it('should extract standard department codes', async () => {
      const testRow = { ...DUMMY_CSV_ROW, lieudeces: '75001' };
      const jobData: DeceasesCsvProcessJobData = {
        s3Path: 's3://test.csv',
        fileName: 'test.csv',
      };

      mockS3Service.downloadFile.mockResolvedValueOnce(Buffer.from(''));
      mockCsvParsingService.parseCsv.mockResolvedValueOnce({
        rows: [testRow],
        stats: { totalRecords: 1, recordsProcessed: 1, recordsFiltered: 0 },
      });
      mockInseeApiService.fetchMairieData.mockResolvedValueOnce(null);
      mockRepository.insertOpportunities.mockResolvedValueOnce(1);
      mockS3Service.uploadFile.mockResolvedValue('');
      mockS3Service.deleteFile.mockResolvedValueOnce();

      await processor.process({ id: 'test', data: jobData } as any);

      expect(mockRepository.insertOpportunities).toHaveBeenCalledWith([
        expect.objectContaining({ department: '75' }),
      ]);
    });

    it('should handle overseas territories', async () => {
      const testRow = { ...DUMMY_CSV_ROW, lieudeces: '97101' }; // Guadeloupe
      const jobData: DeceasesCsvProcessJobData = {
        s3Path: 's3://test.csv',
        fileName: 'test.csv',
      };

      mockS3Service.downloadFile.mockResolvedValueOnce(Buffer.from(''));
      mockCsvParsingService.parseCsv.mockResolvedValueOnce({
        rows: [testRow],
        stats: { totalRecords: 1, recordsProcessed: 1, recordsFiltered: 0 },
      });
      mockInseeApiService.fetchMairieData.mockResolvedValueOnce(null);
      mockRepository.insertOpportunities.mockResolvedValueOnce(1);
      mockS3Service.uploadFile.mockResolvedValue('');
      mockS3Service.deleteFile.mockResolvedValueOnce();

      await processor.process({ id: 'test', data: jobData } as any);

      expect(mockRepository.insertOpportunities).toHaveBeenCalledWith([
        expect.objectContaining({ department: '971' }),
      ]);
    });
  });

  describe('person name cleaning', () => {
    it('should clean person names correctly', async () => {
      const testRow = { ...DUMMY_CSV_ROW, nomprenom: 'DUPONT*MARIE CLAIRE/' };
      const jobData: DeceasesCsvProcessJobData = {
        s3Path: 's3://test.csv',
        fileName: 'test.csv',
      };

      mockS3Service.downloadFile.mockResolvedValueOnce(Buffer.from(''));
      mockCsvParsingService.parseCsv.mockResolvedValueOnce({
        rows: [testRow],
        stats: { totalRecords: 1, recordsProcessed: 1, recordsFiltered: 0 },
      });
      mockInseeApiService.fetchMairieData.mockResolvedValueOnce(null);
      mockRepository.insertOpportunities.mockResolvedValueOnce(1);
      mockS3Service.uploadFile.mockResolvedValue('');
      mockS3Service.deleteFile.mockResolvedValueOnce();

      await processor.process({ id: 'test', data: jobData } as any);

      expect(mockRepository.insertOpportunities).toHaveBeenCalledWith([
        expect.objectContaining({ label: 'Dupont Marie Claire' }),
      ]);
    });
  });
});
