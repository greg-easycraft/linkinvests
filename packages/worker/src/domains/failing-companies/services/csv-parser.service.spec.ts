import { Test, TestingModule } from '@nestjs/testing';
import { CsvParserService } from './csv-parser.service';
import type { FailingCompanyCsvRow } from '../types/failing-companies.types';

describe('CsvParserService', () => {
  let service: CsvParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CsvParserService],
    }).compile();

    service = module.get<CsvParserService>(CsvParserService);

    // Suppress logger output during tests
    jest.spyOn(service['logger'], 'log').mockImplementation();
    jest.spyOn(service['logger'], 'warn').mockImplementation();
    jest.spyOn(service['logger'], 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('parseCsv', () => {
    it('should successfully parse valid CSV buffer with semicolon delimiter', () => {
      const csvData = `numerodepartement;departement_nom_officiel;familleavis_lib;typeavis_lib;dateparution;commercant;ville;cp;listepersonnes;jugement
75;Paris;Collective;Liquidation;2024-01-15;ACME Corp;Paris;75001;"{""personne"":{""numeroImmatriculation"":{""numeroIdentification"":""123456789""}}}";Tribunal`;

      const buffer = Buffer.from(csvData, 'utf-8');
      const result = service.parseCsv(buffer);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        numerodepartement: '75',
        departement_nom_officiel: 'Paris',
        familleavis_lib: 'Collective',
        typeavis_lib: 'Liquidation',
        dateparution: '2024-01-15',
        commercant: 'ACME Corp',
        ville: 'Paris',
        cp: '75001',
        listepersonnes:
          '{"personne":{"numeroImmatriculation":{"numeroIdentification":"123456789"}}}',
        jugement: 'Tribunal',
      });
    });

    it('should handle empty CSV', () => {
      const csvData = `numerodepartement;departement_nom_officiel;familleavis_lib;typeavis_lib;dateparution;commercant;ville;cp;listepersonnes;jugement`;
      const buffer = Buffer.from(csvData, 'utf-8');
      const result = service.parseCsv(buffer);

      expect(result).toHaveLength(0);
    });

    it('should throw error for malformed CSV', () => {
      const invalidCsv = Buffer.from(
        'invalid,csv,data\nwithout"proper"format',
        'utf-8'
      );

      expect(() => service.parseCsv(invalidCsv)).toThrow();
    });

    it('should handle varying column counts (relax_column_count)', () => {
      const csvData = `numerodepartement;departement_nom_officiel;familleavis_lib
75;Paris;Collective;ExtraColumn
93;Seine-Saint-Denis;Collective`;

      const buffer = Buffer.from(csvData, 'utf-8');
      const result = service.parseCsv(buffer);

      expect(result).toHaveLength(2);
      expect(result[0]?.numerodepartement).toBe('75');
      expect(result[1]?.numerodepartement).toBe('93');
    });
  });

  describe('extractSirensFromRows', () => {
    it('should extract unique SIRENs from valid JSON', () => {
      const rows: FailingCompanyCsvRow[] = [
        {
          numerodepartement: '75',
          departement_nom_officiel: 'Paris',
          familleavis_lib: 'Collective',
          typeavis_lib: 'Liquidation',
          dateparution: '2024-01-15',
          commercant: 'Company A',
          ville: 'Paris',
          cp: '75001',
          listepersonnes: JSON.stringify({
            personne: {
              numeroImmatriculation: {
                numeroIdentification: '123456789',
              },
            },
          }),
          jugement: 'Tribunal',
        },
        {
          numerodepartement: '75',
          departement_nom_officiel: 'Paris',
          familleavis_lib: 'Collective',
          typeavis_lib: 'Liquidation',
          dateparution: '2024-01-16',
          commercant: 'Company B',
          ville: 'Paris',
          cp: '75002',
          listepersonnes: JSON.stringify({
            personne: {
              numeroImmatriculation: {
                numeroIdentification: '987654321',
              },
            },
          }),
          jugement: 'Tribunal',
        },
      ];

      const result = service.extractSirensFromRows(rows);

      expect(result).toHaveLength(2);
      expect(result[0]?.siren).toBe('123456789');
      expect(result[0]?.row).toEqual(rows[0]);
      expect(result[1]?.siren).toBe('987654321');
      expect(result[1]?.row).toEqual(rows[1]);
    });

    it('should handle duplicate SIRENs (keeps first occurrence)', () => {
      const rows: FailingCompanyCsvRow[] = [
        {
          numerodepartement: '75',
          departement_nom_officiel: 'Paris',
          familleavis_lib: 'Collective',
          typeavis_lib: 'Liquidation',
          dateparution: '2024-01-15',
          commercant: 'Company A',
          ville: 'Paris',
          cp: '75001',
          listepersonnes: JSON.stringify({
            personne: {
              numeroImmatriculation: {
                numeroIdentification: '123456789',
              },
            },
          }),
          jugement: 'Tribunal',
        },
        {
          numerodepartement: '75',
          departement_nom_officiel: 'Paris',
          familleavis_lib: 'Collective',
          typeavis_lib: 'Liquidation',
          dateparution: '2024-01-16',
          commercant: 'Company A (duplicate)',
          ville: 'Paris',
          cp: '75002',
          listepersonnes: JSON.stringify({
            personne: {
              numeroImmatriculation: {
                numeroIdentification: '123456789',
              },
            },
          }),
          jugement: 'Tribunal',
        },
      ];

      const result = service.extractSirensFromRows(rows);

      expect(result).toHaveLength(1);
      expect(result[0]?.siren).toBe('123456789');
      expect(result[0]?.row.commercant).toBe('Company A'); // First occurrence
    });

    it('should handle missing listepersonnes field', () => {
      const rows: FailingCompanyCsvRow[] = [
        {
          numerodepartement: '75',
          departement_nom_officiel: 'Paris',
          familleavis_lib: 'Collective',
          typeavis_lib: 'Liquidation',
          dateparution: '2024-01-15',
          commercant: 'Company A',
          ville: 'Paris',
          cp: '75001',
          listepersonnes: '',
          jugement: 'Tribunal',
        },
      ];

      const result = service.extractSirensFromRows(rows);

      expect(result).toHaveLength(0);
    });

    it('should fall back to regex when JSON parsing fails', () => {
      const rows: FailingCompanyCsvRow[] = [
        {
          numerodepartement: '75',
          departement_nom_officiel: 'Paris',
          familleavis_lib: 'Collective',
          typeavis_lib: 'Liquidation',
          dateparution: '2024-01-15',
          commercant: 'Company A',
          ville: 'Paris',
          cp: '75001',
          listepersonnes: 'SIREN: 123456789, invalid JSON',
          jugement: 'Tribunal',
        },
      ];

      const result = service.extractSirensFromRows(rows);

      expect(result).toHaveLength(1);
      expect(result[0]?.siren).toBe('123456789');
    });

    it('should validate SIREN format (exactly 9 digits)', () => {
      const rows: FailingCompanyCsvRow[] = [
        {
          numerodepartement: '75',
          departement_nom_officiel: 'Paris',
          familleavis_lib: 'Collective',
          typeavis_lib: 'Liquidation',
          dateparution: '2024-01-15',
          commercant: 'Invalid SIREN',
          ville: 'Paris',
          cp: '75001',
          listepersonnes: JSON.stringify({
            personne: {
              numeroImmatriculation: {
                numeroIdentification: '12345', // Too short
              },
            },
          }),
          jugement: 'Tribunal',
        },
      ];

      const result = service.extractSirensFromRows(rows);

      expect(result).toHaveLength(0);
    });

    it('should handle both array and single object in JSON', () => {
      const rowWithArray: FailingCompanyCsvRow = {
        numerodepartement: '75',
        departement_nom_officiel: 'Paris',
        familleavis_lib: 'Collective',
        typeavis_lib: 'Liquidation',
        dateparution: '2024-01-15',
        commercant: 'Company A',
        ville: 'Paris',
        cp: '75001',
        listepersonnes: JSON.stringify([
          {
            personne: {
              numeroImmatriculation: {
                numeroIdentification: '123456789',
              },
            },
          },
        ]),
        jugement: 'Tribunal',
      };

      const rowWithObject: FailingCompanyCsvRow = {
        numerodepartement: '75',
        departement_nom_officiel: 'Paris',
        familleavis_lib: 'Collective',
        typeavis_lib: 'Liquidation',
        dateparution: '2024-01-16',
        commercant: 'Company B',
        ville: 'Paris',
        cp: '75002',
        listepersonnes: JSON.stringify({
          personne: {
            numeroImmatriculation: {
              numeroIdentification: '987654321',
            },
          },
        }),
        jugement: 'Tribunal',
      };

      const resultArray = service.extractSirensFromRows([rowWithArray]);
      const resultObject = service.extractSirensFromRows([rowWithObject]);

      expect(resultArray).toHaveLength(1);
      expect(resultArray[0]?.siren).toBe('123456789');
      expect(resultObject).toHaveLength(1);
      expect(resultObject[0]?.siren).toBe('987654321');
    });

    it('should remove spaces from SIREN numbers', () => {
      const rows: FailingCompanyCsvRow[] = [
        {
          numerodepartement: '75',
          departement_nom_officiel: 'Paris',
          familleavis_lib: 'Collective',
          typeavis_lib: 'Liquidation',
          dateparution: '2024-01-15',
          commercant: 'Company A',
          ville: 'Paris',
          cp: '75001',
          listepersonnes: JSON.stringify({
            personne: {
              numeroImmatriculation: {
                numeroIdentification: '123 456 789',
              },
            },
          }),
          jugement: 'Tribunal',
        },
      ];

      const result = service.extractSirensFromRows(rows);

      expect(result).toHaveLength(1);
      expect(result[0]?.siren).toBe('123456789');
    });
  });

  describe('parseCsvAndExtractSirens', () => {
    it('should integrate parsing and extraction (legacy method)', () => {
      const csvData = `numerodepartement;departement_nom_officiel;familleavis_lib;typeavis_lib;dateparution;commercant;ville;cp;listepersonnes;jugement
75;Paris;Collective;Liquidation;2024-01-15;Company A;Paris;75001;"{""personne"":{""numeroImmatriculation"":{""numeroIdentification"":""123456789""}}}";Tribunal
93;Seine-Saint-Denis;Collective;Liquidation;2024-01-16;Company B;Bobigny;93000;"{""personne"":{""numeroImmatriculation"":{""numeroIdentification"":""987654321""}}}";Tribunal`;

      const buffer = Buffer.from(csvData, 'utf-8');
      const result = service.parseCsvAndExtractSirens(buffer);

      expect(result).toHaveLength(2);
      expect(result[0]).toBe('123456789');
      expect(result[1]).toBe('987654321');
    });
  });
});
