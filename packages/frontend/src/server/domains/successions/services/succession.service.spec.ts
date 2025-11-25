import { SuccessionService } from './succession.service';
import type { ISuccessionRepository } from '../lib.types';
import type { IExportService, ExportFormat } from '~/server/services/export.service';
import type { IOpportunityFilters } from '~/types/filters';
import { OpportunityType, type Succession } from '@linkinvests/shared';
import { DEFAULT_PAGE_SIZE } from '~/constants/filters';
import { getOpportunityHeaders } from '~/server/services/export-headers.service';

// Mock the export-headers service
jest.mock('~/server/services/export-headers.service', () => ({
  getOpportunityHeaders: jest.fn(),
}));

describe('SuccessionService', () => {
  let successionService: SuccessionService;
  let mockSuccessionRepository: jest.Mocked<ISuccessionRepository>;
  let mockExportService: jest.Mocked<IExportService>;

  const mockSuccession: Succession = {
    id: 'succession-1',
    // @ts-expect-error - type property doesn't exist on Succession but needed for test
    type: OpportunityType.SUCCESSION,
    title: 'Test Succession',
    description: 'Test Description',
    address: 'Test Address',
    zipCode: '75001',
    city: 'Paris',
    department: '75',
    price: 200000,
    surface: 80,
    rooms: 3,
    successionDate: new Date('2024-01-15'),
    notaryOffice: 'Test Notary Office',
    coordinates: { lat: 48.8566, lng: 2.3522 },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mocked dependencies
    mockSuccessionRepository = {
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
    successionService = new SuccessionService(mockSuccessionRepository, mockExportService);

    // Mock export headers service
    jest.mocked(getOpportunityHeaders).mockReturnValue({
      title: 'Titre',
      address: 'Adresse',
      price: 'Prix',
    });
  });

  describe('getSuccessionsData', () => {
    it('should return paginated succession data with default pagination', async () => {
      const mockSuccessions = [mockSuccession];
      mockSuccessionRepository.findAll.mockResolvedValue(mockSuccessions);

      const result = await successionService.getSuccessionsData();

      expect(result).toEqual({
        opportunities: mockSuccessions,
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
      });
      expect(mockSuccessionRepository.findAll).toHaveBeenCalledWith(
        undefined,
        { limit: DEFAULT_PAGE_SIZE, offset: 0 }
      );
    });

    it('should return paginated succession data with custom pagination', async () => {
      const filters: IOpportunityFilters = { page: 3, pageSize: 25 };
      const mockSuccessions = [mockSuccession];
      mockSuccessionRepository.findAll.mockResolvedValue(mockSuccessions);

      const result = await successionService.getSuccessionsData(filters);

      expect(result).toEqual({
        opportunities: mockSuccessions,
        page: 3,
        pageSize: 25,
      });
      expect(mockSuccessionRepository.findAll).toHaveBeenCalledWith(
        filters,
        { limit: 25, offset: 50 } // (3-1) * 25
      );
    });

    it('should handle filters correctly', async () => {
      const filters: IOpportunityFilters = {
        departments: ['75'],
        zipCodes: ['75001'],
        page: 2,
        pageSize: 10,
      };
      const mockSuccessions = [mockSuccession];
      mockSuccessionRepository.findAll.mockResolvedValue(mockSuccessions);

      await successionService.getSuccessionsData(filters);

      expect(mockSuccessionRepository.findAll).toHaveBeenCalledWith(
        filters,
        { limit: 10, offset: 10 }
      );
    });

    it('should handle repository errors', async () => {
      const error = new Error('Repository error');
      mockSuccessionRepository.findAll.mockRejectedValue(error);

      await expect(successionService.getSuccessionsData()).rejects.toThrow('Repository error');
    });
  });

  describe('getSuccessionsCount', () => {
    it('should return succession count without filters', async () => {
      const expectedCount = 420;
      mockSuccessionRepository.count.mockResolvedValue(expectedCount);

      const result = await successionService.getSuccessionsCount();

      expect(result).toBe(expectedCount);
      expect(mockSuccessionRepository.count).toHaveBeenCalledWith(undefined);
    });

    it('should return succession count with filters', async () => {
      const filters: IOpportunityFilters = { departments: ['75'] };
      const expectedCount = 95;
      mockSuccessionRepository.count.mockResolvedValue(expectedCount);

      const result = await successionService.getSuccessionsCount(filters);

      expect(result).toBe(expectedCount);
      expect(mockSuccessionRepository.count).toHaveBeenCalledWith(filters);
    });

    it('should handle repository count errors', async () => {
      const error = new Error('Count error');
      mockSuccessionRepository.count.mockRejectedValue(error);

      await expect(successionService.getSuccessionsCount()).rejects.toThrow('Count error');
    });
  });

  describe('getSuccessionById', () => {
    it('should return succession when found', async () => {
      const successionId = 'succession-123';
      mockSuccessionRepository.findById.mockResolvedValue(mockSuccession);

      const result = await successionService.getSuccessionById(successionId);

      expect(result).toBe(mockSuccession);
      expect(mockSuccessionRepository.findById).toHaveBeenCalledWith(successionId);
    });

    it('should return null when succession not found', async () => {
      const successionId = 'non-existent-succession';
      mockSuccessionRepository.findById.mockResolvedValue(null);

      const result = await successionService.getSuccessionById(successionId);

      expect(result).toBeNull();
      expect(mockSuccessionRepository.findById).toHaveBeenCalledWith(successionId);
    });

    it('should handle repository findById errors', async () => {
      const error = new Error('Find error');
      const successionId = 'succession-123';
      mockSuccessionRepository.findById.mockRejectedValue(error);

      await expect(successionService.getSuccessionById(successionId)).rejects.toThrow('Find error');
    });
  });

  describe('exportList', () => {
    const filters: IOpportunityFilters = { departments: ['75'] };
    const mockSuccessionsForExport = [mockSuccession, { ...mockSuccession, id: 'succession-2' }];
    const mockBlob = new Blob(['test data']);

    beforeEach(() => {
      mockSuccessionRepository.findAll.mockResolvedValue(mockSuccessionsForExport);
      mockExportService.exportToCSV.mockResolvedValue(mockBlob);
      mockExportService.exportToXLSX.mockResolvedValue(mockBlob);
    });

    it('should export to CSV successfully when under limit', async () => {
      mockSuccessionRepository.count.mockResolvedValue(180); // Under 500 limit

      const result = await successionService.exportList(filters, 'csv');

      expect(result).toBe(mockBlob);
      expect(mockSuccessionRepository.count).toHaveBeenCalledWith(filters);
      expect(mockSuccessionRepository.findAll).toHaveBeenCalledWith(filters);
      expect(getOpportunityHeaders).toHaveBeenCalledWith(OpportunityType.SUCCESSION);
      expect(mockExportService.exportToCSV).toHaveBeenCalledWith(
        mockSuccessionsForExport,
        { title: 'Titre', address: 'Adresse', price: 'Prix' }
      );
    });

    it('should export to XLSX successfully when under limit', async () => {
      mockSuccessionRepository.count.mockResolvedValue(320);

      const result = await successionService.exportList(filters, 'xlsx');

      expect(result).toBe(mockBlob);
      expect(mockExportService.exportToXLSX).toHaveBeenCalledWith(
        mockSuccessionsForExport,
        { title: 'Titre', address: 'Adresse', price: 'Prix' }
      );
    });

    it('should throw error when export limit exceeded', async () => {
      mockSuccessionRepository.count.mockResolvedValue(800); // Over 500 limit

      await expect(successionService.exportList(filters, 'csv')).rejects.toThrow(
        'Export limit exceeded. Found 800 items, maximum allowed is 500. Please refine your filters.'
      );

      expect(mockSuccessionRepository.findAll).not.toHaveBeenCalled();
      expect(mockExportService.exportToCSV).not.toHaveBeenCalled();
    });

    it('should throw error for unsupported export format', async () => {
      mockSuccessionRepository.count.mockResolvedValue(100);

      await expect(
        successionService.exportList(filters, 'pdf' as ExportFormat)
      ).rejects.toThrow('Unsupported export format: pdf');
    });

    it('should handle export service errors', async () => {
      mockSuccessionRepository.count.mockResolvedValue(100);
      const exportError = new Error('Export failed');
      mockExportService.exportToCSV.mockRejectedValue(exportError);

      await expect(successionService.exportList(filters, 'csv')).rejects.toThrow('Export failed');
    });

    it('should handle repository errors during export', async () => {
      mockSuccessionRepository.count.mockResolvedValue(100);
      const repositoryError = new Error('Repository export error');
      mockSuccessionRepository.findAll.mockRejectedValue(repositoryError);

      await expect(successionService.exportList(filters, 'csv')).rejects.toThrow('Repository export error');
    });

    it('should validate export limit is exactly 500', async () => {
      mockSuccessionRepository.count.mockResolvedValue(500); // Exactly at limit

      const result = await successionService.exportList(filters, 'csv');

      expect(result).toBe(mockBlob);
      expect(mockExportService.exportToCSV).toHaveBeenCalled();
    });

    it('should reject when count is 501 (just over limit)', async () => {
      mockSuccessionRepository.count.mockResolvedValue(501); // Just over limit

      await expect(successionService.exportList(filters, 'csv')).rejects.toThrow(
        'Export limit exceeded. Found 501 items, maximum allowed is 500. Please refine your filters.'
      );
    });
  });
});