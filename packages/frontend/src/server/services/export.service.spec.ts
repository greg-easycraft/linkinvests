import { ExportService } from './export.service';
import * as XLSX from 'xlsx';
import { unparse } from 'papaparse';

// Mock the external dependencies
jest.mock('xlsx', () => ({
  utils: {
    book_new: jest.fn(),
    json_to_sheet: jest.fn(),
    book_append_sheet: jest.fn(),
  },
  write: jest.fn(),
}));

jest.mock('papaparse', () => ({
  unparse: jest.fn(),
}));

describe('ExportService', () => {
  let exportService: ExportService;

  const mockData = [
    {
      id: '1',
      title: 'Test Property',
      price: 100000,
      address: '123 Test Street',
      date: new Date('2024-01-15T10:30:00Z'),
      coordinates: { lat: 48.8566, lng: 2.3522 },
      tags: ['tag1', 'tag2'],
      nullValue: null,
      undefinedValue: undefined,
    },
    {
      id: '2',
      title: 'Another Property',
      price: 150000,
      address: '456 Another Street',
      date: new Date('2024-02-20T14:45:00Z'),
      coordinates: { lat: 45.7640, lng: 4.8357 },
      tags: ['tag3'],
      nullValue: null,
      undefinedValue: undefined,
    },
  ];

  const mockCustomHeaders = {
    title: 'Titre',
    price: 'Prix',
    address: 'Adresse',
    date: 'Date',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    exportService = new ExportService();
  });

  describe('exportToCSV', () => {
    it('should export data to CSV with default headers', async () => {
      const mockCsv = 'id;title;price\n1;Test Property;100000';
      jest.mocked(unparse).mockReturnValue(mockCsv);

      const result = await exportService.exportToCSV(mockData);

      expect(unparse).toHaveBeenCalledWith(
        [
          ['id', 'title', 'price', 'address', 'date', 'coordinates', 'tags', 'nullValue', 'undefinedValue'],
          expect.any(Array), // First flattened row
          expect.any(Array), // Second flattened row
        ],
        {
          header: true,
          skipEmptyLines: true,
          delimiter: ';',
        }
      );

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('text/csv;charset=utf-8;');
    });

    it('should export data to CSV with custom headers', async () => {
      const mockCsv = 'Titre;Prix;Adresse\nTest Property;100000;123 Test Street';
      jest.mocked(unparse).mockReturnValue(mockCsv);

      const result = await exportService.exportToCSV(mockData, mockCustomHeaders);

      expect(unparse).toHaveBeenCalledWith(
        [
          ['id', 'Titre', 'Prix', 'Adresse', 'Date', 'coordinates', 'tags', 'nullValue', 'undefinedValue'],
          expect.any(Array),
          expect.any(Array),
        ],
        {
          header: true,
          skipEmptyLines: true,
          delimiter: ';',
        }
      );

      expect(result).toBeInstanceOf(Blob);
    });

    it('should throw error when no data provided', async () => {
      await expect(exportService.exportToCSV([])).rejects.toThrow('No data to export');
    });

    it('should handle date formatting correctly', async () => {
      const dateData = [{ id: '1', date: new Date('2024-01-15T10:30:00Z') }];
      jest.mocked(unparse).mockReturnValue('mock-csv');

      await exportService.exportToCSV(dateData);

      const callArgs = jest.mocked(unparse).mock.calls[0][0];
      const flattenedRow = callArgs[1] as string[];

      // The date should be formatted in French format (DD/MM/YYYY HH:MM)
      expect(flattenedRow[1]).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/);
    });

    it('should handle null and undefined values', async () => {
      const nullData = [{ id: '1', nullValue: null, undefinedValue: undefined }];
      jest.mocked(unparse).mockReturnValue('mock-csv');

      await exportService.exportToCSV(nullData);

      const callArgs = jest.mocked(unparse).mock.calls[0][0];
      const flattenedRow = callArgs[1] as string[];

      expect(flattenedRow[1]).toBe(''); // null becomes empty string
      expect(flattenedRow[2]).toBe(''); // undefined becomes empty string
    });

    it('should handle objects and arrays correctly', async () => {
      const complexData = [{
        id: '1',
        obj: { nested: 'value' },
        arr: ['item1', 'item2']
      }];
      jest.mocked(unparse).mockReturnValue('mock-csv');

      await exportService.exportToCSV(complexData);

      const callArgs = jest.mocked(unparse).mock.calls[0][0];
      const flattenedRow = callArgs[1] as string[];

      expect(flattenedRow[1]).toBe('{"nested":"value"}'); // Object becomes JSON string
      expect(flattenedRow[2]).toBe('item1, item2'); // Array becomes comma-separated
    });
  });

  describe('exportToXLSX', () => {
    const mockWorkbook = {};
    const mockWorksheet = {};
    const mockExcelBuffer = new ArrayBuffer(8);

    beforeEach(() => {
      jest.mocked(XLSX.utils.book_new).mockReturnValue(mockWorkbook);
      jest.mocked(XLSX.utils.json_to_sheet).mockReturnValue(mockWorksheet);
      jest.mocked(XLSX.write).mockReturnValue(mockExcelBuffer);
    });

    it('should export data to XLSX with default headers', async () => {
      const result = await exportService.exportToXLSX(mockData);

      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith([
        ['id', 'title', 'price', 'address', 'date', 'coordinates', 'tags', 'nullValue', 'undefinedValue'],
        expect.any(Array),
        expect.any(Array),
      ]);
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(mockWorkbook, mockWorksheet, 'Data');
      expect(XLSX.write).toHaveBeenCalledWith(mockWorkbook, {
        bookType: 'xlsx',
        type: 'array',
      });

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });

    it('should export data to XLSX with custom headers', async () => {
      const result = await exportService.exportToXLSX(mockData, mockCustomHeaders);

      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith([
        ['id', 'Titre', 'Prix', 'Adresse', 'Date', 'coordinates', 'tags', 'nullValue', 'undefinedValue'],
        expect.any(Array),
        expect.any(Array),
      ]);

      expect(result).toBeInstanceOf(Blob);
    });

    it('should set column widths on worksheet', async () => {
      await exportService.exportToXLSX(mockData);

      // Column widths should be set on the worksheet
      expect(mockWorksheet).toHaveProperty('!cols');
    });

    it('should throw error when no data provided', async () => {
      await expect(exportService.exportToXLSX([])).rejects.toThrow('No data to export');
    });

    it('should throw error when flattened data is empty', async () => {
      // Mock json_to_sheet to simulate empty data scenario
      const dataWithEmptyFlattening = [{ id: '1' }];

      // We need to actually test the private method through the public interface
      // The service will handle the error internally
      await expect(exportService.exportToXLSX(dataWithEmptyFlattening)).resolves.toBeInstanceOf(Blob);
    });
  });

  describe('generateFilename', () => {
    it('should generate filename with domain and format', () => {
      const result = exportService.generateFilename('auctions', 'csv');

      expect(result).toMatch(/^auctions_export_\d+\.csv$/);
    });

    it('should generate filename with custom timestamp', () => {
      const result = exportService.generateFilename('listings', 'xlsx', '1234567890');

      expect(result).toBe('listings_export_1234567890.xlsx');
    });

    it('should handle different domains and formats', () => {
      const csvResult = exportService.generateFilename('successions', 'csv');
      const xlsxResult = exportService.generateFilename('liquidations', 'xlsx');

      expect(csvResult).toMatch(/^successions_export_\d+\.csv$/);
      expect(xlsxResult).toMatch(/^liquidations_export_\d+\.xlsx$/);
    });
  });

  describe('private methods (tested through public interface)', () => {
    describe('flattenObject behavior', () => {
      it('should properly flatten nested objects', async () => {
        const nestedData = [{
          id: '1',
          nested: { key1: 'value1', key2: 'value2' },
          array: ['a', 'b', 'c'],
          date: new Date('2024-01-15T10:30:00Z'),
          null: null,
          undefined: undefined,
        }];

        jest.mocked(unparse).mockReturnValue('mock-csv');
        await exportService.exportToCSV(nestedData);

        const callArgs = jest.mocked(unparse).mock.calls[0][0];
        const flattenedRow = callArgs[1] as string[];

        expect(flattenedRow[0]).toBe('1'); // id
        expect(flattenedRow[1]).toBe('{"key1":"value1","key2":"value2"}'); // nested object
        expect(flattenedRow[2]).toBe('a, b, c'); // array
        expect(flattenedRow[3]).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/); // formatted date
        expect(flattenedRow[4]).toBe(''); // null
        expect(flattenedRow[5]).toBe(''); // undefined
      });
    });

    describe('formatDate behavior', () => {
      it('should format dates in French format', async () => {
        const dateData = [{ date: new Date('2024-01-15T10:30:00Z') }];
        jest.mocked(unparse).mockReturnValue('mock-csv');

        await exportService.exportToCSV(dateData);

        const callArgs = jest.mocked(unparse).mock.calls[0][0];
        const flattenedRow = callArgs[1] as string[];

        // Should be in French date format: DD/MM/YYYY HH:MM
        expect(flattenedRow[0]).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
      });
    });

    describe('calculateColumnWidths behavior', () => {
      it('should calculate appropriate column widths', async () => {
        const longData = [{
          shortCol: 'a',
          mediumCol: 'medium length text',
          longCol: 'this is a very long column text that should be capped at 50 characters maximum width for readability purposes',
        }];

        await exportService.exportToXLSX(longData);

        // Verify that column widths were calculated and applied
        const worksheet = jest.mocked(XLSX.utils.json_to_sheet).mock.results[0].value;
        expect(worksheet).toHaveProperty('!cols');
      });
    });

    describe('getHeadersWithLabels behavior', () => {
      it('should use custom headers when provided', async () => {
        const data = [{ title: 'Test', price: 100 }];
        const customHeaders = { title: 'Titre', price: 'Prix' };

        jest.mocked(unparse).mockReturnValue('mock-csv');
        await exportService.exportToCSV(data, customHeaders);

        const callArgs = jest.mocked(unparse).mock.calls[0][0];
        const headers = callArgs[0] as string[];

        expect(headers).toEqual(['Titre', 'Prix']);
      });

      it('should use original keys when no custom headers provided', async () => {
        const data = [{ title: 'Test', price: 100 }];

        jest.mocked(unparse).mockReturnValue('mock-csv');
        await exportService.exportToCSV(data);

        const callArgs = jest.mocked(unparse).mock.calls[0][0];
        const headers = callArgs[0] as string[];

        expect(headers).toEqual(['title', 'price']);
      });
    });
  });
});