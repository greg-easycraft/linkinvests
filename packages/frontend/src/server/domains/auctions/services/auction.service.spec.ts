import { AuctionService } from './auction.service';
import type { IAuctionRepository } from '../lib.types';
import type { IExportService, ExportFormat } from '~/server/services/export.service';
import type { OpportunityFilters } from '~/types/filters';
import { OpportunityType, type Auction } from '@linkinvests/shared';
import { DEFAULT_PAGE_SIZE } from '~/constants/filters';
import { getOpportunityHeaders } from '~/server/services/export-headers.service';
import { mockClass } from '~/test-utils/mock-class';

// Mock the export-headers service
jest.mock('~/server/services/export-headers.service', () => ({
  getOpportunityHeaders: jest.fn(),
}));

describe('AuctionService', () => {
  let auctionService: AuctionService;
  let mockAuctionRepository: jest.Mocked<IAuctionRepository>;
  let mockExportService: jest.Mocked<IExportService>;

  const mockAuction: Auction = {
    id: 'auction-1',
    type: OpportunityType.AUCTION,
    title: 'Test Auction',
    description: 'Test Description',
    address: 'Test Address',
    zipCode: '75001',
    city: 'Paris',
    department: '75',
    price: 100000,
    surface: 50,
    rooms: 2,
    auctionDate: new Date('2024-01-15'),
    estimatedPrice: 120000,
    coordinates: { lat: 48.8566, lng: 2.3522 },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mocked dependencies
    mockAuctionRepository = {
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
    auctionService = new AuctionService(mockAuctionRepository, mockExportService);

    // Mock export headers service
    jest.mocked(getOpportunityHeaders).mockReturnValue({
      title: 'Titre',
      address: 'Adresse',
      price: 'Prix',
    });
  });

  describe('getAuctionsData', () => {
    it('should return paginated auction data with default pagination', async () => {
      const mockAuctions = [mockAuction];
      mockAuctionRepository.findAll.mockResolvedValue(mockAuctions);

      const result = await auctionService.getAuctionsData();

      expect(result).toEqual({
        opportunities: mockAuctions,
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
      });
      expect(mockAuctionRepository.findAll).toHaveBeenCalledWith(
        undefined,
        { limit: DEFAULT_PAGE_SIZE, offset: 0 }
      );
    });

    it('should return paginated auction data with custom pagination', async () => {
      const filters: OpportunityFilters = { page: 3, pageSize: 25 };
      const mockAuctions = [mockAuction];
      mockAuctionRepository.findAll.mockResolvedValue(mockAuctions);

      const result = await auctionService.getAuctionsData(filters);

      expect(result).toEqual({
        opportunities: mockAuctions,
        page: 3,
        pageSize: 25,
      });
      expect(mockAuctionRepository.findAll).toHaveBeenCalledWith(
        filters,
        { limit: 25, offset: 50 } // (3-1) * 25
      );
    });

    it('should handle filters correctly', async () => {
      const filters: OpportunityFilters = {
        departments: ['75'],
        zipCodes: ['75001'],
        page: 2,
        pageSize: 10,
      };
      const mockAuctions = [mockAuction];
      mockAuctionRepository.findAll.mockResolvedValue(mockAuctions);

      await auctionService.getAuctionsData(filters);

      expect(mockAuctionRepository.findAll).toHaveBeenCalledWith(
        filters,
        { limit: 10, offset: 10 }
      );
    });

    it('should handle repository errors', async () => {
      const error = new Error('Repository error');
      mockAuctionRepository.findAll.mockRejectedValue(error);

      await expect(auctionService.getAuctionsData()).rejects.toThrow('Repository error');
    });
  });

  describe('getAuctionsCount', () => {
    it('should return auction count without filters', async () => {
      const expectedCount = 150;
      mockAuctionRepository.count.mockResolvedValue(expectedCount);

      const result = await auctionService.getAuctionsCount();

      expect(result).toBe(expectedCount);
      expect(mockAuctionRepository.count).toHaveBeenCalledWith(undefined);
    });

    it('should return auction count with filters', async () => {
      const filters: OpportunityFilters = { departments: ['75'] };
      const expectedCount = 50;
      mockAuctionRepository.count.mockResolvedValue(expectedCount);

      const result = await auctionService.getAuctionsCount(filters);

      expect(result).toBe(expectedCount);
      expect(mockAuctionRepository.count).toHaveBeenCalledWith(filters);
    });

    it('should handle repository count errors', async () => {
      const error = new Error('Count error');
      mockAuctionRepository.count.mockRejectedValue(error);

      await expect(auctionService.getAuctionsCount()).rejects.toThrow('Count error');
    });
  });

  describe('getAuctionById', () => {
    it('should return auction when found', async () => {
      const auctionId = 'auction-123';
      mockAuctionRepository.findById.mockResolvedValue(mockAuction);

      const result = await auctionService.getAuctionById(auctionId);

      expect(result).toBe(mockAuction);
      expect(mockAuctionRepository.findById).toHaveBeenCalledWith(auctionId);
    });

    it('should return null when auction not found', async () => {
      const auctionId = 'non-existent-auction';
      mockAuctionRepository.findById.mockResolvedValue(null);

      const result = await auctionService.getAuctionById(auctionId);

      expect(result).toBeNull();
      expect(mockAuctionRepository.findById).toHaveBeenCalledWith(auctionId);
    });

    it('should handle repository findById errors', async () => {
      const error = new Error('Find error');
      const auctionId = 'auction-123';
      mockAuctionRepository.findById.mockRejectedValue(error);

      await expect(auctionService.getAuctionById(auctionId)).rejects.toThrow('Find error');
    });
  });

  describe('exportList', () => {
    const filters: OpportunityFilters = { departments: ['75'] };
    const mockAuctionsForExport = [mockAuction, { ...mockAuction, id: 'auction-2' }];
    const mockBlob = new Blob(['test data']);

    beforeEach(() => {
      mockAuctionRepository.findAll.mockResolvedValue(mockAuctionsForExport);
      mockExportService.exportToCSV.mockResolvedValue(mockBlob);
      mockExportService.exportToXLSX.mockResolvedValue(mockBlob);
    });

    it('should export to CSV successfully when under limit', async () => {
      mockAuctionRepository.count.mockResolvedValue(100); // Under 500 limit

      const result = await auctionService.exportList(filters, 'csv');

      expect(result).toBe(mockBlob);
      expect(mockAuctionRepository.count).toHaveBeenCalledWith(filters);
      expect(mockAuctionRepository.findAll).toHaveBeenCalledWith(filters);
      expect(getOpportunityHeaders).toHaveBeenCalledWith(OpportunityType.AUCTION);
      expect(mockExportService.exportToCSV).toHaveBeenCalledWith(
        mockAuctionsForExport,
        { title: 'Titre', address: 'Adresse', price: 'Prix' }
      );
    });

    it('should export to XLSX successfully when under limit', async () => {
      mockAuctionRepository.count.mockResolvedValue(200);

      const result = await auctionService.exportList(filters, 'xlsx');

      expect(result).toBe(mockBlob);
      expect(mockExportService.exportToXLSX).toHaveBeenCalledWith(
        mockAuctionsForExport,
        { title: 'Titre', address: 'Adresse', price: 'Prix' }
      );
    });

    it('should throw error when export limit exceeded', async () => {
      mockAuctionRepository.count.mockResolvedValue(600); // Over 500 limit

      await expect(auctionService.exportList(filters, 'csv')).rejects.toThrow(
        'Export limit exceeded. Found 600 items, maximum allowed is 500. Please refine your filters.'
      );

      expect(mockAuctionRepository.findAll).not.toHaveBeenCalled();
      expect(mockExportService.exportToCSV).not.toHaveBeenCalled();
    });

    it('should throw error for unsupported export format', async () => {
      mockAuctionRepository.count.mockResolvedValue(100);

      await expect(
        auctionService.exportList(filters, 'pdf' as ExportFormat)
      ).rejects.toThrow('Unsupported export format: pdf');
    });

    it('should handle export service errors', async () => {
      mockAuctionRepository.count.mockResolvedValue(100);
      const exportError = new Error('Export failed');
      mockExportService.exportToCSV.mockRejectedValue(exportError);

      await expect(auctionService.exportList(filters, 'csv')).rejects.toThrow('Export failed');
    });

    it('should handle repository errors during export', async () => {
      mockAuctionRepository.count.mockResolvedValue(100);
      const repositoryError = new Error('Repository export error');
      mockAuctionRepository.findAll.mockRejectedValue(repositoryError);

      await expect(auctionService.exportList(filters, 'csv')).rejects.toThrow('Repository export error');
    });

    it('should validate export limit is exactly 500', async () => {
      mockAuctionRepository.count.mockResolvedValue(500); // Exactly at limit

      const result = await auctionService.exportList(filters, 'csv');

      expect(result).toBe(mockBlob);
      expect(mockExportService.exportToCSV).toHaveBeenCalled();
    });

    it('should reject when count is 501 (just over limit)', async () => {
      mockAuctionRepository.count.mockResolvedValue(501); // Just over limit

      await expect(auctionService.exportList(filters, 'csv')).rejects.toThrow(
        'Export limit exceeded. Found 501 items, maximum allowed is 500. Please refine your filters.'
      );
    });
  });
});