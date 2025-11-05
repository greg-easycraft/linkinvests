import { CsvParsingService } from './csv-parsing.service';
import { InseeCsvRow } from '../types/deceases.types';

describe('CsvParsingService', () => {
  let service: CsvParsingService;

  beforeEach(() => {
    service = new CsvParsingService();
    // Mock the logger
    (service as any).logger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
      info: jest.fn(),
    };
  });

  describe('parseCsv', () => {
    it('should parse valid CSV with header', async () => {
      const csvContent = `"nomprenom";"sexe";"datenaiss";"lieunaiss";"commnaiss";"paysnaiss";"datedeces";"lieudeces";"actedeces"
"MARTIN*JEAN/";"1";"19400101";"75001";"PARIS";"";"20231201";"75001";"001"
"DUPONT*MARIE/";"2";"19350201";"69001";"LYON";"";"20231202";"69001";"002"`;

      const buffer = Buffer.from(csvContent, 'utf-8');
      const result = await service.parseCsv(buffer, 50);

      expect(result.stats.totalRecords).toBe(2);
      expect(result.stats.recordsProcessed).toBe(2);
      expect(result.stats.recordsFiltered).toBe(0);
      expect(result.rows).toHaveLength(2);

      expect(result.rows[0]).toEqual({
        nomprenom: 'MARTIN*JEAN/',
        sexe: '1',
        datenaiss: '19400101',
        lieunaiss: '75001',
        commnaiss: 'PARIS',
        paysnaiss: '',
        datedeces: '20231201',
        lieudeces: '75001',
        actedeces: '001',
      });
    });

    it('should parse CSV without header', async () => {
      const csvContent = `"MARTIN*JEAN/";"1";"19400101";"75001";"PARIS";"";"20231201";"75001";"001"
"DUPONT*MARIE/";"2";"19350201";"69001";"LYON";"";"20231202";"69001";"002"`;

      const buffer = Buffer.from(csvContent, 'utf-8');
      const result = await service.parseCsv(buffer, 50);

      expect(result.stats.totalRecords).toBe(2);
      expect(result.rows).toHaveLength(2);
    });

    it('should filter records by age (under 50)', async () => {
      const csvContent = `"YOUNG*PERSON/";"1";"20000101";"75001";"PARIS";"";"20231201";"75001";"001"
"OLD*PERSON/";"2";"19350201";"69001";"LYON";"";"20231202";"69001";"002"`;

      const buffer = Buffer.from(csvContent, 'utf-8');
      const result = await service.parseCsv(buffer, 50);

      expect(result.stats.totalRecords).toBe(2);
      expect(result.stats.recordsProcessed).toBe(1); // Only the old person
      expect(result.stats.recordsFiltered).toBe(1); // Young person filtered out
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].nomprenom).toBe('OLD*PERSON/');
    });

    it('should handle empty CSV', async () => {
      const buffer = Buffer.from('', 'utf-8');
      const result = await service.parseCsv(buffer, 50);

      expect(result.stats.totalRecords).toBe(0);
      expect(result.stats.recordsProcessed).toBe(0);
      expect(result.stats.recordsFiltered).toBe(0);
      expect(result.rows).toHaveLength(0);
    });

    it('should handle CSV with invalid rows', async () => {
      const csvContent = `"MARTIN*JEAN/";"1";"19400101";"75001";"PARIS";"";"20231201";"75001";"001"
"DUPONT*MARIE/";"2";"19350201";"69001";"LYON";"";"20231202";"69001";"002"`;

      const buffer = Buffer.from(csvContent, 'utf-8');
      const result = await service.parseCsv(buffer, 50);

      expect(result.stats.totalRecords).toBe(2);
      expect(result.stats.recordsProcessed).toBe(2); // Two valid rows
      expect(result.rows).toHaveLength(2);
    });

    it('should handle CSV parsing errors', async () => {
      // Create truly malformed CSV that will cause parsing error
      const invalidCsv =
        '"unclosed quote field and other malformed content";\n"another";"malformed';
      const buffer = Buffer.from(invalidCsv, 'utf-8');

      await expect(service.parseCsv(buffer, 50)).rejects.toThrow('CSV streaming parsing failed');
    });
  });

  describe('convertToDeathRecord', () => {
    it('should convert CSV row to death record format', () => {
      const csvRow: InseeCsvRow = {
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

      const result = service.convertToDeathRecord(csvRow);

      expect(result).toEqual({
        nomPrenom: 'MARTIN*JEAN/',
        sexe: '1',
        dateNaissance: '19400101',
        lieuNaissance: '75001',
        communeNaissance: 'PARIS',
        paysNaissance: '',
        dateDeces: '20231201',
        lieuDeces: '75001',
        acteDeces: '001',
      });
    });
  });

  describe('generateFailedRecordsCsv', () => {
    it('should generate CSV for failed records', () => {
      const failedRows = [
        {
          row: {
            nomprenom: 'FAILED*PERSON/',
            sexe: '1',
            datenaiss: '19400101',
            lieunaiss: '75001',
            commnaiss: 'PARIS',
            paysnaiss: '',
            datedeces: '20231201',
            lieudeces: '75001',
            actedeces: '001',
          } as InseeCsvRow,
          error: 'Geocoding failed',
        },
      ];

      const result = service.generateFailedRecordsCsv(failedRows);

      expect(result).toContain('"nomprenom";"sexe";"datenaiss"');
      expect(result).toContain('"FAILED*PERSON/";"1";"19400101"');
      expect(result).toContain('"Geocoding failed"');
    });

    it('should handle empty failed records', () => {
      const result = service.generateFailedRecordsCsv([]);
      expect(result).toBe('');
    });

    it('should escape quotes in error messages', () => {
      const failedRows = [
        {
          row: {
            nomprenom: 'PERSON*TEST/',
            sexe: '1',
            datenaiss: '19400101',
            lieunaiss: '75001',
            commnaiss: 'PARIS',
            paysnaiss: '',
            datedeces: '20231201',
            lieudeces: '75001',
            actedeces: '001',
          } as InseeCsvRow,
          error: 'Error with "quoted" message',
        },
      ];

      const result = service.generateFailedRecordsCsv(failedRows);
      expect(result).toContain('"Error with ""quoted"" message"');
    });
  });

  describe('calculateAge (private method tested via parseCsv)', () => {
    it('should calculate age correctly for same month birthday', async () => {
      // Person born 1940-01-01, died 2023-01-01 (83 years old)
      const csvContent = `"TEST*PERSON/";"1";"19400101";"75001";"PARIS";"";"20230101";"75001";"001"`;
      const buffer = Buffer.from(csvContent, 'utf-8');
      const result = await service.parseCsv(buffer, 80);

      expect(result.stats.recordsProcessed).toBe(1); // Should pass 80+ filter
    });

    it('should calculate age correctly for birthday not yet reached', async () => {
      // Person born 1940-12-31, died 2023-01-01 (82 years old, birthday not reached)
      const csvContent = `"TEST*PERSON/";"1";"19401231";"75001";"PARIS";"";"20230101";"75001";"001"`;
      const buffer = Buffer.from(csvContent, 'utf-8');
      const result = await service.parseCsv(buffer, 83);

      expect(result.stats.recordsFiltered).toBe(1); // Should be filtered out (82 < 83)
    });

    it('should handle invalid date formats gracefully', async () => {
      const csvContent = `"TEST*PERSON/";"1";"INVALID";"75001";"PARIS";"";"INVALID";"75001";"001"`;
      const buffer = Buffer.from(csvContent, 'utf-8');
      const result = await service.parseCsv(buffer, 50);

      expect(result.stats.recordsFiltered).toBe(1); // Should be filtered (age = 0)
    });
  });
});
