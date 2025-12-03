import {
  LiquidationService,
  LiquidationServiceErrorReason,
} from './liquidation.service';
import type { LiquidationRepository } from '../lib.types';
import type { IExportService } from '~/common/export/export.types';
import type { ExportService } from '~/common/export/services/export.service';
import type { IOpportunityFilters } from '~/types';
import { OpportunityType, type Liquidation } from '@linkinvests/shared';
import { DEFAULT_PAGE_SIZE } from '~/constants';
import { getOpportunityHeaders } from '~/common/export/services/export-headers.service';
import { succeed } from '~/common/utils/operation-result';

// Mock the export-headers service
jest.mock('~/common/export/services/export-headers.service', () => ({
  getOpportunityHeaders: jest.fn(),
}));

describe('LiquidationService', () => {
  let liquidationService: LiquidationService;
  let mockLiquidationRepository: jest.Mocked<LiquidationRepository>;
  let mockExportService: jest.Mocked<IExportService>;

  const mockLiquidation: Liquidation = {
    id: 'liquidation-1',
    label: 'Test Liquidation',
    address: 'Test Address',
    zipCode: '75001',
    department: '75',
    latitude: 48.8566,
    longitude: 2.3522,
    opportunityDate: '2024-01-15',
    externalId: 'external-123',
    siret: '12345678901234',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockBlob = new Blob(['test data']);

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mocked dependencies
    mockLiquidationRepository = {
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
    liquidationService = new LiquidationService(
      mockLiquidationRepository,
      mockExportService as unknown as ExportService,
    );

    // Mock export headers service
    jest.mocked(getOpportunityHeaders).mockReturnValue({
      title: 'Titre',
      address: 'Adresse',
      price: 'Prix',
    });
  });

  describe('getLiquidationsData', () => {
    it('should return paginated liquidation data with default pagination', async () => {
      const mockLiquidations = [mockLiquidation];
      mockLiquidationRepository.findAll.mockResolvedValue(mockLiquidations);

      const result = await liquidationService.getLiquidationsData();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          opportunities: mockLiquidations,
          page: 1,
          pageSize: DEFAULT_PAGE_SIZE,
        });
      }
      // Service adds default datePeriod: '12_months' when no valid datePeriod provided
      expect(mockLiquidationRepository.findAll).toHaveBeenCalledWith(
        { datePeriod: '12_months' },
        { limit: DEFAULT_PAGE_SIZE, offset: 0 },
      );
    });

    it('should return paginated liquidation data with custom pagination', async () => {
      const filters: IOpportunityFilters = { page: 3, pageSize: 25 };
      const mockLiquidations = [mockLiquidation];
      mockLiquidationRepository.findAll.mockResolvedValue(mockLiquidations);

      const result = await liquidationService.getLiquidationsData(filters);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          opportunities: mockLiquidations,
          page: 3,
          pageSize: 25,
        });
      }
      // Service adds default datePeriod: '12_months' when no valid datePeriod provided
      expect(mockLiquidationRepository.findAll).toHaveBeenCalledWith(
        { ...filters, datePeriod: '12_months' },
        { limit: 25, offset: 50 }, // (3-1) * 25
      );
    });

    it('should handle filters correctly', async () => {
      const filters: IOpportunityFilters = {
        departments: ['75'],
        zipCodes: ['75001'],
        page: 2,
        pageSize: 10,
      };
      const mockLiquidations = [mockLiquidation];
      mockLiquidationRepository.findAll.mockResolvedValue(mockLiquidations);

      await liquidationService.getLiquidationsData(filters);

      // Service adds default datePeriod: '12_months' when no valid datePeriod provided
      expect(mockLiquidationRepository.findAll).toHaveBeenCalledWith(
        { ...filters, datePeriod: '12_months' },
        { limit: 10, offset: 10 },
      );
    });

    it('should return error on repository failure', async () => {
      const error = new Error('Repository error');
      mockLiquidationRepository.findAll.mockRejectedValue(error);

      const result = await liquidationService.getLiquidationsData();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(LiquidationServiceErrorReason.UNKNOWN_ERROR);
      }
    });
  });

  describe('getLiquidationsCount', () => {
    it('should return liquidation count without filters', async () => {
      const expectedCount = 280;
      mockLiquidationRepository.count.mockResolvedValue(expectedCount);

      const result = await liquidationService.getLiquidationsCount();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(expectedCount);
      }
      // Service adds default datePeriod: '12_months' when no valid datePeriod provided
      expect(mockLiquidationRepository.count).toHaveBeenCalledWith({
        datePeriod: '12_months',
      });
    });

    it('should return liquidation count with filters', async () => {
      const filters: IOpportunityFilters = { departments: ['75'] };
      const expectedCount = 85;
      mockLiquidationRepository.count.mockResolvedValue(expectedCount);

      const result = await liquidationService.getLiquidationsCount(filters);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(expectedCount);
      }
      // Service adds default datePeriod: '12_months' when no valid datePeriod provided
      expect(mockLiquidationRepository.count).toHaveBeenCalledWith({
        ...filters,
        datePeriod: '12_months',
      });
    });

    it('should return error on repository count failure', async () => {
      const error = new Error('Count error');
      mockLiquidationRepository.count.mockRejectedValue(error);

      const result = await liquidationService.getLiquidationsCount();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(LiquidationServiceErrorReason.UNKNOWN_ERROR);
      }
    });
  });

  describe('getLiquidationById', () => {
    it('should return liquidation when found', async () => {
      const liquidationId = 'liquidation-123';
      mockLiquidationRepository.findById.mockResolvedValue(mockLiquidation);

      const result = await liquidationService.getLiquidationById(liquidationId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(mockLiquidation);
      }
      expect(mockLiquidationRepository.findById).toHaveBeenCalledWith(
        liquidationId,
      );
    });

    it('should return NOT_FOUND when liquidation not found', async () => {
      const liquidationId = 'non-existent-liquidation';
      mockLiquidationRepository.findById.mockResolvedValue(null);

      const result = await liquidationService.getLiquidationById(liquidationId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(LiquidationServiceErrorReason.NOT_FOUND);
      }
      expect(mockLiquidationRepository.findById).toHaveBeenCalledWith(
        liquidationId,
      );
    });

    it('should return error on repository findById failure', async () => {
      const error = new Error('Find error');
      const liquidationId = 'liquidation-123';
      mockLiquidationRepository.findById.mockRejectedValue(error);

      const result = await liquidationService.getLiquidationById(liquidationId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(LiquidationServiceErrorReason.UNKNOWN_ERROR);
      }
    });
  });

  describe('exportList', () => {
    const filters: IOpportunityFilters = { departments: ['75'] };
    const mockLiquidationsForExport = [
      mockLiquidation,
      { ...mockLiquidation, id: 'liquidation-2' },
    ];

    beforeEach(() => {
      mockLiquidationRepository.findAll.mockResolvedValue(
        mockLiquidationsForExport,
      );
      mockExportService.exportToCSV.mockResolvedValue(succeed(mockBlob));
      mockExportService.exportToXLSX.mockResolvedValue(succeed(mockBlob));
    });

    it('should export to CSV successfully when under limit', async () => {
      mockLiquidationRepository.count.mockResolvedValue(150); // Under 500 limit

      const result = await liquidationService.exportList(filters, 'csv');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(mockBlob);
      }
      // Service adds default datePeriod: '12_months' when no valid datePeriod provided
      const filtersWithDatePeriod = { ...filters, datePeriod: '12_months' };
      expect(mockLiquidationRepository.count).toHaveBeenCalledWith(
        filtersWithDatePeriod,
      );
      expect(mockLiquidationRepository.findAll).toHaveBeenCalledWith(
        filtersWithDatePeriod,
      );
      expect(getOpportunityHeaders).toHaveBeenCalledWith(
        OpportunityType.LIQUIDATION,
      );
      expect(mockExportService.exportToCSV).toHaveBeenCalledWith(
        mockLiquidationsForExport,
        { title: 'Titre', address: 'Adresse', price: 'Prix' },
      );
    });

    it('should export to XLSX successfully when under limit', async () => {
      mockLiquidationRepository.count.mockResolvedValue(250);

      const result = await liquidationService.exportList(filters, 'xlsx');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(mockBlob);
      }
      expect(mockExportService.exportToXLSX).toHaveBeenCalledWith(
        mockLiquidationsForExport,
        { title: 'Titre', address: 'Adresse', price: 'Prix' },
      );
    });

    it('should return error when export limit exceeded', async () => {
      mockLiquidationRepository.count.mockResolvedValue(650); // Over 500 limit

      const result = await liquidationService.exportList(filters, 'csv');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(
          LiquidationServiceErrorReason.EXPORT_LIMIT_EXCEEDED,
        );
      }

      expect(mockLiquidationRepository.findAll).not.toHaveBeenCalled();
      expect(mockExportService.exportToCSV).not.toHaveBeenCalled();
    });

    it('should return error for unsupported export format', async () => {
      mockLiquidationRepository.count.mockResolvedValue(100);

      const result = await liquidationService.exportList(
        filters,
        'pdf' as 'csv' | 'xlsx',
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(
          LiquidationServiceErrorReason.UNSUPPORTED_FORMAT,
        );
      }
    });

    it('should return error on export service failure', async () => {
      mockLiquidationRepository.count.mockResolvedValue(100);
      const exportError = new Error('Export failed');
      mockExportService.exportToCSV.mockRejectedValue(exportError);

      const result = await liquidationService.exportList(filters, 'csv');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(LiquidationServiceErrorReason.UNKNOWN_ERROR);
      }
    });

    it('should return error on repository failure during export', async () => {
      mockLiquidationRepository.count.mockResolvedValue(100);
      const repositoryError = new Error('Repository export error');
      mockLiquidationRepository.findAll.mockRejectedValue(repositoryError);

      const result = await liquidationService.exportList(filters, 'csv');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(LiquidationServiceErrorReason.UNKNOWN_ERROR);
      }
    });

    it('should export successfully when count is exactly 500', async () => {
      mockLiquidationRepository.count.mockResolvedValue(500); // Exactly at limit

      const result = await liquidationService.exportList(filters, 'csv');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(mockBlob);
      }
      expect(mockExportService.exportToCSV).toHaveBeenCalled();
    });

    it('should return error when count is 501 (just over limit)', async () => {
      mockLiquidationRepository.count.mockResolvedValue(501); // Just over limit

      const result = await liquidationService.exportList(filters, 'csv');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(
          LiquidationServiceErrorReason.EXPORT_LIMIT_EXCEEDED,
        );
      }
    });
  });
});
