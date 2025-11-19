import { EnergyDiagnosticsService } from './energy-diagnostics.service';
import type { IEnergyDiagnosticsRepository } from '../lib.types';
import type { IExportService, ExportFormat } from '~/server/services/export.service';
import type { OpportunityFilters } from '~/types/filters';
import { OpportunityType, type EnergyDiagnostic } from '@linkinvests/shared';
import { DEFAULT_PAGE_SIZE } from '~/constants/filters';
import { getOpportunityHeaders } from '~/server/services/export-headers.service';

// Mock the export-headers service
jest.mock('~/server/services/export-headers.service', () => ({
  getOpportunityHeaders: jest.fn(),
}));

describe('EnergyDiagnosticsService', () => {
  let energyDiagnosticsService: EnergyDiagnosticsService;
  let mockEnergyDiagnosticsRepository: jest.Mocked<IEnergyDiagnosticsRepository>;
  let mockExportService: jest.Mocked<IExportService>;

  const mockEnergyDiagnostic: EnergyDiagnostic = {
    id: 'energy-diagnostic-1',
    // @ts-expect-error - type property doesn't exist on EnergyDiagnostic but needed for test
    type: OpportunityType.ENERGY_SIEVE,
    title: 'Test Energy Diagnostic',
    description: 'Test Description',
    address: 'Test Address',
    zipCode: '75001',
    city: 'Paris',
    department: '75',
    price: 150000,
    surface: 45,
    rooms: 2,
    energyClass: 'F',
    diagnosticDate: new Date('2024-01-15'),
    coordinates: { lat: 48.8566, lng: 2.3522 },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mocked dependencies
    mockEnergyDiagnosticsRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      count: jest.fn(),
    };

    mockExportService = {
      exportToCSV: jest.fn(),
      exportToXLSX: jest.fn(),
      generateFilename: jest.fn(),
    };

    // Initialize service with mocked dependencies
    energyDiagnosticsService = new EnergyDiagnosticsService(mockEnergyDiagnosticsRepository, mockExportService);

    // Mock export headers service
    jest.mocked(getOpportunityHeaders).mockReturnValue({
      title: 'Titre',
      address: 'Adresse',
      price: 'Prix',
      energyClass: 'Classe énergétique',
    });
  });

  describe('getEnergyDiagnosticsData', () => {
    it('should return paginated energy diagnostic data with default pagination', async () => {
      const mockEnergyDiagnostics = [mockEnergyDiagnostic];
      mockEnergyDiagnosticsRepository.findAll.mockResolvedValue(mockEnergyDiagnostics);

      const result = await energyDiagnosticsService.getEnergyDiagnosticsData();

      expect(result).toEqual({
        opportunities: mockEnergyDiagnostics,
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
      });
      expect(mockEnergyDiagnosticsRepository.findAll).toHaveBeenCalledWith(
        undefined,
        { limit: DEFAULT_PAGE_SIZE, offset: 0 }
      );
    });

    it('should return paginated energy diagnostic data with custom pagination', async () => {
      const filters: OpportunityFilters = { page: 3, pageSize: 25 };
      const mockEnergyDiagnostics = [mockEnergyDiagnostic];
      mockEnergyDiagnosticsRepository.findAll.mockResolvedValue(mockEnergyDiagnostics);

      const result = await energyDiagnosticsService.getEnergyDiagnosticsData(filters);

      expect(result).toEqual({
        opportunities: mockEnergyDiagnostics,
        page: 3,
        pageSize: 25,
      });
      expect(mockEnergyDiagnosticsRepository.findAll).toHaveBeenCalledWith(
        filters,
        { limit: 25, offset: 50 } // (3-1) * 25
      );
    });

    it('should handle filters correctly including energy class filters', async () => {
      const filters: OpportunityFilters = {
        departments: ['75'],
        zipCodes: ['75001'],
        // @ts-expect-error - energyClasses property doesn't exist on OpportunityFilters but needed for test
        energyClasses: ['F', 'G'],
        page: 2,
        pageSize: 10,
      };
      const mockEnergyDiagnostics = [mockEnergyDiagnostic];
      mockEnergyDiagnosticsRepository.findAll.mockResolvedValue(mockEnergyDiagnostics);

      await energyDiagnosticsService.getEnergyDiagnosticsData(filters);

      expect(mockEnergyDiagnosticsRepository.findAll).toHaveBeenCalledWith(
        filters,
        { limit: 10, offset: 10 }
      );
    });

    it('should handle repository errors', async () => {
      const error = new Error('Repository error');
      mockEnergyDiagnosticsRepository.findAll.mockRejectedValue(error);

      await expect(energyDiagnosticsService.getEnergyDiagnosticsData()).rejects.toThrow('Repository error');
    });
  });

  describe('getEnergyDiagnosticsCount', () => {
    it('should return energy diagnostic count without filters', async () => {
      const expectedCount = 1200;
      mockEnergyDiagnosticsRepository.count.mockResolvedValue(expectedCount);

      const result = await energyDiagnosticsService.getEnergyDiagnosticsCount();

      expect(result).toBe(expectedCount);
      expect(mockEnergyDiagnosticsRepository.count).toHaveBeenCalledWith(undefined);
    });

    it('should return energy diagnostic count with filters', async () => {
      const filters: OpportunityFilters = {
        departments: ['75'],
        // @ts-expect-error - energyClasses property doesn't exist on OpportunityFilters but needed for test
        energyClasses: ['F', 'G']
      };
      const expectedCount = 340;
      mockEnergyDiagnosticsRepository.count.mockResolvedValue(expectedCount);

      const result = await energyDiagnosticsService.getEnergyDiagnosticsCount(filters);

      expect(result).toBe(expectedCount);
      expect(mockEnergyDiagnosticsRepository.count).toHaveBeenCalledWith(filters);
    });

    it('should handle repository count errors', async () => {
      const error = new Error('Count error');
      mockEnergyDiagnosticsRepository.count.mockRejectedValue(error);

      await expect(energyDiagnosticsService.getEnergyDiagnosticsCount()).rejects.toThrow('Count error');
    });
  });

  describe('getEnergyDiagnosticById', () => {
    it('should return energy diagnostic when found', async () => {
      const energyDiagnosticId = 'energy-diagnostic-123';
      mockEnergyDiagnosticsRepository.findById.mockResolvedValue(mockEnergyDiagnostic);

      const result = await energyDiagnosticsService.getEnergyDiagnosticById(energyDiagnosticId);

      expect(result).toBe(mockEnergyDiagnostic);
      expect(mockEnergyDiagnosticsRepository.findById).toHaveBeenCalledWith(energyDiagnosticId);
    });

    it('should return null when energy diagnostic not found', async () => {
      const energyDiagnosticId = 'non-existent-energy-diagnostic';
      mockEnergyDiagnosticsRepository.findById.mockResolvedValue(null);

      const result = await energyDiagnosticsService.getEnergyDiagnosticById(energyDiagnosticId);

      expect(result).toBeNull();
      expect(mockEnergyDiagnosticsRepository.findById).toHaveBeenCalledWith(energyDiagnosticId);
    });

    it('should handle repository findById errors', async () => {
      const error = new Error('Find error');
      const energyDiagnosticId = 'energy-diagnostic-123';
      mockEnergyDiagnosticsRepository.findById.mockRejectedValue(error);

      await expect(energyDiagnosticsService.getEnergyDiagnosticById(energyDiagnosticId)).rejects.toThrow('Find error');
    });
  });

  describe('exportList', () => {
    const filters: OpportunityFilters = {
      departments: ['75'],
      // @ts-expect-error - energyClasses property doesn't exist on OpportunityFilters but needed for test
      energyClasses: ['F', 'G']
    };
    const mockEnergyDiagnosticsForExport = [mockEnergyDiagnostic, { ...mockEnergyDiagnostic, id: 'energy-diagnostic-2' }];
    const mockBlob = new Blob(['test data']);

    beforeEach(() => {
      mockEnergyDiagnosticsRepository.findAll.mockResolvedValue(mockEnergyDiagnosticsForExport);
      mockExportService.exportToCSV.mockResolvedValue(mockBlob);
      mockExportService.exportToXLSX.mockResolvedValue(mockBlob);
    });

    it('should export to CSV successfully when under limit', async () => {
      mockEnergyDiagnosticsRepository.count.mockResolvedValue(300); // Under 500 limit

      const result = await energyDiagnosticsService.exportList(filters, 'csv');

      expect(result).toBe(mockBlob);
      expect(mockEnergyDiagnosticsRepository.count).toHaveBeenCalledWith(filters);
      expect(mockEnergyDiagnosticsRepository.findAll).toHaveBeenCalledWith(filters);
      expect(getOpportunityHeaders).toHaveBeenCalledWith(OpportunityType.ENERGY_SIEVE);
      expect(mockExportService.exportToCSV).toHaveBeenCalledWith(
        mockEnergyDiagnosticsForExport,
        { title: 'Titre', address: 'Adresse', price: 'Prix', energyClass: 'Classe énergétique' }
      );
    });

    it('should export to XLSX successfully when under limit', async () => {
      mockEnergyDiagnosticsRepository.count.mockResolvedValue(400);

      const result = await energyDiagnosticsService.exportList(filters, 'xlsx');

      expect(result).toBe(mockBlob);
      expect(mockExportService.exportToXLSX).toHaveBeenCalledWith(
        mockEnergyDiagnosticsForExport,
        { title: 'Titre', address: 'Adresse', price: 'Prix', energyClass: 'Classe énergétique' }
      );
    });

    it('should throw error when export limit exceeded', async () => {
      mockEnergyDiagnosticsRepository.count.mockResolvedValue(900); // Over 500 limit

      await expect(energyDiagnosticsService.exportList(filters, 'csv')).rejects.toThrow(
        'Export limit exceeded. Found 900 items, maximum allowed is 500. Please refine your filters.'
      );

      expect(mockEnergyDiagnosticsRepository.findAll).not.toHaveBeenCalled();
      expect(mockExportService.exportToCSV).not.toHaveBeenCalled();
    });

    it('should throw error for unsupported export format', async () => {
      mockEnergyDiagnosticsRepository.count.mockResolvedValue(100);

      await expect(
        energyDiagnosticsService.exportList(filters, 'pdf' as ExportFormat)
      ).rejects.toThrow('Unsupported export format: pdf');
    });

    it('should handle export service errors', async () => {
      mockEnergyDiagnosticsRepository.count.mockResolvedValue(100);
      const exportError = new Error('Export failed');
      mockExportService.exportToCSV.mockRejectedValue(exportError);

      await expect(energyDiagnosticsService.exportList(filters, 'csv')).rejects.toThrow('Export failed');
    });

    it('should handle repository errors during export', async () => {
      mockEnergyDiagnosticsRepository.count.mockResolvedValue(100);
      const repositoryError = new Error('Repository export error');
      mockEnergyDiagnosticsRepository.findAll.mockRejectedValue(repositoryError);

      await expect(energyDiagnosticsService.exportList(filters, 'csv')).rejects.toThrow('Repository export error');
    });

    it('should validate export limit is exactly 500', async () => {
      mockEnergyDiagnosticsRepository.count.mockResolvedValue(500); // Exactly at limit

      const result = await energyDiagnosticsService.exportList(filters, 'csv');

      expect(result).toBe(mockBlob);
      expect(mockExportService.exportToCSV).toHaveBeenCalled();
    });

    it('should reject when count is 501 (just over limit)', async () => {
      mockEnergyDiagnosticsRepository.count.mockResolvedValue(501); // Just over limit

      await expect(energyDiagnosticsService.exportList(filters, 'csv')).rejects.toThrow(
        'Export limit exceeded. Found 501 items, maximum allowed is 500. Please refine your filters.'
      );
    });
  });
});