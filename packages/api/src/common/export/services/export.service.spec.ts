import { ExportService } from './export.service';

describe('ExportService', () => {
  let exportService: ExportService;

  beforeEach(() => {
    exportService = new ExportService();
  });

  describe('exportToCSV', () => {
    it('should return empty blob for empty data', async () => {
      const result = await exportService.exportToCSV([]);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('text/csv');
      const text = await result.text();
      expect(text).toBe('');
    });

    it('should export data with headers', async () => {
      const data = [
        { id: '1', name: 'Test', value: 100 },
        { id: '2', name: 'Test2', value: 200 },
      ];

      const result = await exportService.exportToCSV(data);

      const text = await result.text();
      const lines = text.split('\n');

      expect(lines[0]).toBe('"id","name","value"');
      expect(lines[1]).toBe('"1","Test","100"');
      expect(lines[2]).toBe('"2","Test2","200"');
    });

    it('should use custom headers when provided', async () => {
      const data = [{ id: '1', name: 'Test' }];
      const customHeaders = { id: 'ID', name: 'Nom' };

      const result = await exportService.exportToCSV(data, customHeaders);

      const text = await result.text();
      const lines = text.split('\n');

      expect(lines[0]).toBe('"ID","Nom"');
    });

    it('should handle null and undefined values', async () => {
      const data = [{ id: '1', name: null, value: undefined }];

      const result = await exportService.exportToCSV(data);

      const text = await result.text();
      const lines = text.split('\n');

      expect(lines[1]).toBe('"1","",""');
    });

    it('should escape double quotes in values', async () => {
      const data = [{ id: '1', name: 'Test "quoted" value' }];

      const result = await exportService.exportToCSV(data);

      const text = await result.text();
      const lines = text.split('\n');

      expect(lines[1]).toBe('"1","Test ""quoted"" value"');
    });

    it('should handle object values by stringifying them', async () => {
      const data = [{ id: '1', metadata: { key: 'value' } }];

      const result = await exportService.exportToCSV(data);

      const text = await result.text();
      const lines = text.split('\n');

      // Object is stringified and quotes are escaped
      expect(lines[1]).toContain('"1"');
      expect(lines[1]).toContain('key');
      expect(lines[1]).toContain('value');
    });

    it('should handle array values by stringifying them', async () => {
      const data = [{ id: '1', tags: ['a', 'b', 'c'] }];

      const result = await exportService.exportToCSV(data);

      const text = await result.text();
      const lines = text.split('\n');

      expect(lines[1]).toContain('[');
    });

    it('should preserve special characters', async () => {
      const data = [{ id: '1', name: 'Café résumé' }];

      const result = await exportService.exportToCSV(data);

      const text = await result.text();
      expect(text).toContain('Café résumé');
    });

    it('should handle numeric values', async () => {
      const data = [{ price: 123.45, count: 0 }];

      const result = await exportService.exportToCSV(data);

      const text = await result.text();
      const lines = text.split('\n');

      expect(lines[1]).toBe('"123.45","0"');
    });

    it('should handle boolean values', async () => {
      const data = [{ active: true, deleted: false }];

      const result = await exportService.exportToCSV(data);

      const text = await result.text();
      const lines = text.split('\n');

      expect(lines[1]).toBe('"true","false"');
    });

    it('should set correct content type', async () => {
      const data = [{ id: '1' }];

      const result = await exportService.exportToCSV(data);

      expect(result.type).toBe('text/csv;charset=utf-8');
    });

    it('should handle partial custom headers', async () => {
      const data = [{ id: '1', name: 'Test', value: 100 }];
      const customHeaders = { id: 'ID' }; // Only id is customized

      const result = await exportService.exportToCSV(data, customHeaders);

      const text = await result.text();
      const lines = text.split('\n');

      expect(lines[0]).toBe('"ID","name","value"');
    });
  });

  describe('exportToXLSX', () => {
    it('should return blob with xlsx content type', async () => {
      const data = [{ id: '1', name: 'Test' }];

      const result = await exportService.exportToXLSX(data);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    });

    it('should use custom headers when provided', async () => {
      const data = [{ id: '1', name: 'Test' }];
      const customHeaders = { id: 'ID', name: 'Nom' };

      const result = await exportService.exportToXLSX(data, customHeaders);

      // Since current implementation uses CSV format internally
      const text = await result.text();
      expect(text).toContain('ID');
      expect(text).toContain('Nom');
    });

    it('should return empty blob for empty data', async () => {
      const result = await exportService.exportToXLSX([]);

      expect(result).toBeInstanceOf(Blob);
      const text = await result.text();
      expect(text).toBe('');
    });
  });

  describe('generateFilename', () => {
    it('should generate filename with csv extension', () => {
      const result = exportService.generateFilename('listings', 'csv');

      expect(result).toMatch(/^listings_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.csv$/);
    });

    it('should generate filename with xlsx extension', () => {
      const result = exportService.generateFilename('auctions', 'xlsx');

      expect(result).toMatch(/^auctions_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.xlsx$/);
    });

    it('should include timestamp in ISO format', () => {
      const before = new Date().toISOString().replace(/[:.]/g, '-');
      const result = exportService.generateFilename('test', 'csv');
      const after = new Date().toISOString().replace(/[:.]/g, '-');

      const timestamp = result.replace('test_', '').replace('.csv', '');
      expect(timestamp >= before.slice(0, 20)).toBe(true);
      expect(timestamp <= after.slice(0, 20) + 'Z').toBe(true);
    });

    it('should handle prefix with special characters', () => {
      const result = exportService.generateFilename('energy-diagnostics', 'csv');

      expect(result).toMatch(/^energy-diagnostics_/);
      expect(result).toMatch(/\.csv$/);
    });
  });
});
