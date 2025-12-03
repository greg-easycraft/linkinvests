import {
  EnergyDiagnosticsService,
  EnergyDiagnosticsServiceErrorReason,
} from './energy-diagnostics.service';
import type { EnergyDiagnosticsRepository } from '../lib.types';
import type { IExportService } from '~/common/export/export.types';
import type { ExportService } from '~/common/export/services/export.service';
import type { IOpportunityFilters } from '~/types';
import { OpportunityType, type EnergyDiagnostic } from '@linkinvests/shared';
import { DEFAULT_PAGE_SIZE } from '~/constants';
import { getOpportunityHeaders } from '~/common/export/services/export-headers.service';
import { succeed } from '~/common/utils/operation-result';

// Mock the export-headers service
jest.mock('~/common/export/services/export-headers.service', () => ({
  getOpportunityHeaders: jest.fn(),
}));

describe('EnergyDiagnosticsService', () => {
  let energyDiagnosticsService: EnergyDiagnosticsService;
  let mockEnergyDiagnosticsRepository: jest.Mocked<EnergyDiagnosticsRepository>;
  let mockExportService: jest.Mocked<IExportService>;

  const mockEnergyDiagnostic: EnergyDiagnostic = {
    id: 'energy-diagnostic-1',
    label: 'Test Energy Diagnostic',
    address: 'Test Address',
    zipCode: '75001',
    department: '75',
    latitude: 48.8566,
    longitude: 2.3522,
    opportunityDate: '2024-01-15',
    externalId: 'external-123',
    squareFootage: 45,
    energyClass: 'F',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockBlob = new Blob(['test data']);

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mocked dependencies
    mockEnergyDiagnosticsRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByExternalId: jest.fn(),
      count: jest.fn(),
    };

    mockExportService = {
      exportToCSV: jest.fn(),
      exportToXLSX: jest.fn(),
      generateFilename: jest.fn(),
    };

    // Initialize service with mocked dependencies
    energyDiagnosticsService = new EnergyDiagnosticsService(
      mockEnergyDiagnosticsRepository,
      mockExportService as unknown as ExportService,
    );

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
      mockEnergyDiagnosticsRepository.findAll.mockResolvedValue(
        mockEnergyDiagnostics,
      );

      const result = await energyDiagnosticsService.getEnergyDiagnosticsData();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          opportunities: mockEnergyDiagnostics,
          page: 1,
          pageSize: DEFAULT_PAGE_SIZE,
        });
      }
      expect(mockEnergyDiagnosticsRepository.findAll).toHaveBeenCalledWith(
        undefined,
        { limit: DEFAULT_PAGE_SIZE, offset: 0 },
      );
    });

    it('should return paginated energy diagnostic data with custom pagination', async () => {
      const filters: IOpportunityFilters = { page: 3, pageSize: 25 };
      const mockEnergyDiagnostics = [mockEnergyDiagnostic];
      mockEnergyDiagnosticsRepository.findAll.mockResolvedValue(
        mockEnergyDiagnostics,
      );

      const result =
        await energyDiagnosticsService.getEnergyDiagnosticsData(filters);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          opportunities: mockEnergyDiagnostics,
          page: 3,
          pageSize: 25,
        });
      }
      expect(mockEnergyDiagnosticsRepository.findAll).toHaveBeenCalledWith(
        filters,
        { limit: 25, offset: 50 }, // (3-1) * 25
      );
    });

    it('should handle filters correctly including energy class filters', async () => {
      const filters: IOpportunityFilters = {
        departments: ['75'],
        zipCodes: ['75001'],
        // @ts-expect-error - energyClasses property doesn't exist on IOpportunityFilters but needed for test
        energyClasses: ['F', 'G'],
        page: 2,
        pageSize: 10,
      };
      const mockEnergyDiagnostics = [mockEnergyDiagnostic];
      mockEnergyDiagnosticsRepository.findAll.mockResolvedValue(
        mockEnergyDiagnostics,
      );

      await energyDiagnosticsService.getEnergyDiagnosticsData(filters);

      expect(mockEnergyDiagnosticsRepository.findAll).toHaveBeenCalledWith(
        filters,
        { limit: 10, offset: 10 },
      );
    });

    it('should return error on repository failure', async () => {
      const error = new Error('Repository error');
      mockEnergyDiagnosticsRepository.findAll.mockRejectedValue(error);

      const result = await energyDiagnosticsService.getEnergyDiagnosticsData();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(
          EnergyDiagnosticsServiceErrorReason.UNKNOWN_ERROR,
        );
      }
    });
  });

  describe('getEnergyDiagnosticsCount', () => {
    it('should return energy diagnostic count without filters', async () => {
      const expectedCount = 1200;
      mockEnergyDiagnosticsRepository.count.mockResolvedValue(expectedCount);

      const result = await energyDiagnosticsService.getEnergyDiagnosticsCount();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(expectedCount);
      }
      expect(mockEnergyDiagnosticsRepository.count).toHaveBeenCalledWith(
        undefined,
      );
    });

    it('should return energy diagnostic count with filters', async () => {
      const filters: IOpportunityFilters = {
        departments: ['75'],
        // @ts-expect-error - energyClasses property doesn't exist on IOpportunityFilters but needed for test
        energyClasses: ['F', 'G'],
      };
      const expectedCount = 340;
      mockEnergyDiagnosticsRepository.count.mockResolvedValue(expectedCount);

      const result =
        await energyDiagnosticsService.getEnergyDiagnosticsCount(filters);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(expectedCount);
      }
      expect(mockEnergyDiagnosticsRepository.count).toHaveBeenCalledWith(
        filters,
      );
    });

    it('should return error on repository count failure', async () => {
      const error = new Error('Count error');
      mockEnergyDiagnosticsRepository.count.mockRejectedValue(error);

      const result = await energyDiagnosticsService.getEnergyDiagnosticsCount();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(
          EnergyDiagnosticsServiceErrorReason.UNKNOWN_ERROR,
        );
      }
    });
  });

  describe('getEnergyDiagnosticById', () => {
    it('should return energy diagnostic when found', async () => {
      const energyDiagnosticId = 'energy-diagnostic-123';
      mockEnergyDiagnosticsRepository.findById.mockResolvedValue(
        mockEnergyDiagnostic,
      );

      const result =
        await energyDiagnosticsService.getEnergyDiagnosticById(
          energyDiagnosticId,
        );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(mockEnergyDiagnostic);
      }
      expect(mockEnergyDiagnosticsRepository.findById).toHaveBeenCalledWith(
        energyDiagnosticId,
      );
    });

    it('should return NOT_FOUND when energy diagnostic not found', async () => {
      const energyDiagnosticId = 'non-existent-energy-diagnostic';
      mockEnergyDiagnosticsRepository.findById.mockResolvedValue(null);

      const result =
        await energyDiagnosticsService.getEnergyDiagnosticById(
          energyDiagnosticId,
        );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(
          EnergyDiagnosticsServiceErrorReason.NOT_FOUND,
        );
      }
      expect(mockEnergyDiagnosticsRepository.findById).toHaveBeenCalledWith(
        energyDiagnosticId,
      );
    });

    it('should return error on repository findById failure', async () => {
      const error = new Error('Find error');
      const energyDiagnosticId = 'energy-diagnostic-123';
      mockEnergyDiagnosticsRepository.findById.mockRejectedValue(error);

      const result =
        await energyDiagnosticsService.getEnergyDiagnosticById(
          energyDiagnosticId,
        );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(
          EnergyDiagnosticsServiceErrorReason.UNKNOWN_ERROR,
        );
      }
    });
  });

  describe('exportList', () => {
    const filters: IOpportunityFilters = {
      departments: ['75'],
      // @ts-expect-error - energyClasses property doesn't exist on IOpportunityFilters but needed for test
      energyClasses: ['F', 'G'],
    };
    const mockEnergyDiagnosticsForExport = [
      mockEnergyDiagnostic,
      { ...mockEnergyDiagnostic, id: 'energy-diagnostic-2' },
    ];

    beforeEach(() => {
      mockEnergyDiagnosticsRepository.findAll.mockResolvedValue(
        mockEnergyDiagnosticsForExport,
      );
      mockExportService.exportToCSV.mockResolvedValue(succeed(mockBlob));
      mockExportService.exportToXLSX.mockResolvedValue(succeed(mockBlob));
    });

    it('should export to CSV successfully when under limit', async () => {
      mockEnergyDiagnosticsRepository.count.mockResolvedValue(300); // Under 500 limit

      const result = await energyDiagnosticsService.exportList(filters, 'csv');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(mockBlob);
      }
      expect(mockEnergyDiagnosticsRepository.count).toHaveBeenCalledWith(
        filters,
      );
      expect(mockEnergyDiagnosticsRepository.findAll).toHaveBeenCalledWith(
        filters,
      );
      expect(getOpportunityHeaders).toHaveBeenCalledWith(
        OpportunityType.ENERGY_SIEVE,
      );
      expect(mockExportService.exportToCSV).toHaveBeenCalledWith(
        mockEnergyDiagnosticsForExport,
        {
          title: 'Titre',
          address: 'Adresse',
          price: 'Prix',
          energyClass: 'Classe énergétique',
        },
      );
    });

    it('should export to XLSX successfully when under limit', async () => {
      mockEnergyDiagnosticsRepository.count.mockResolvedValue(400);

      const result = await energyDiagnosticsService.exportList(filters, 'xlsx');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(mockBlob);
      }
      expect(mockExportService.exportToXLSX).toHaveBeenCalledWith(
        mockEnergyDiagnosticsForExport,
        {
          title: 'Titre',
          address: 'Adresse',
          price: 'Prix',
          energyClass: 'Classe énergétique',
        },
      );
    });

    it('should return error when export limit exceeded', async () => {
      mockEnergyDiagnosticsRepository.count.mockResolvedValue(900); // Over 500 limit

      const result = await energyDiagnosticsService.exportList(filters, 'csv');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(
          EnergyDiagnosticsServiceErrorReason.EXPORT_LIMIT_EXCEEDED,
        );
      }

      expect(mockEnergyDiagnosticsRepository.findAll).not.toHaveBeenCalled();
      expect(mockExportService.exportToCSV).not.toHaveBeenCalled();
    });

    it('should return error for unsupported export format', async () => {
      mockEnergyDiagnosticsRepository.count.mockResolvedValue(100);

      const result = await energyDiagnosticsService.exportList(
        filters,
        'pdf' as 'csv' | 'xlsx',
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(
          EnergyDiagnosticsServiceErrorReason.UNSUPPORTED_FORMAT,
        );
      }
    });

    it('should return error on export service failure', async () => {
      mockEnergyDiagnosticsRepository.count.mockResolvedValue(100);
      const exportError = new Error('Export failed');
      mockExportService.exportToCSV.mockRejectedValue(exportError);

      const result = await energyDiagnosticsService.exportList(filters, 'csv');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(
          EnergyDiagnosticsServiceErrorReason.UNKNOWN_ERROR,
        );
      }
    });

    it('should return error on repository failure during export', async () => {
      mockEnergyDiagnosticsRepository.count.mockResolvedValue(100);
      const repositoryError = new Error('Repository export error');
      mockEnergyDiagnosticsRepository.findAll.mockRejectedValue(
        repositoryError,
      );

      const result = await energyDiagnosticsService.exportList(filters, 'csv');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(
          EnergyDiagnosticsServiceErrorReason.UNKNOWN_ERROR,
        );
      }
    });

    it('should export successfully when count is exactly 500', async () => {
      mockEnergyDiagnosticsRepository.count.mockResolvedValue(500); // Exactly at limit

      const result = await energyDiagnosticsService.exportList(filters, 'csv');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(mockBlob);
      }
      expect(mockExportService.exportToCSV).toHaveBeenCalled();
    });

    it('should return error when count is 501 (just over limit)', async () => {
      mockEnergyDiagnosticsRepository.count.mockResolvedValue(501); // Just over limit

      const result = await energyDiagnosticsService.exportList(filters, 'csv');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(
          EnergyDiagnosticsServiceErrorReason.EXPORT_LIMIT_EXCEEDED,
        );
      }
    });
  });
});
