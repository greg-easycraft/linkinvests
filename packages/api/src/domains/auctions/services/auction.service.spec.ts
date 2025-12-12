import { AuctionService, AuctionServiceErrorReason } from './auction.service';
import type { AuctionRepository } from '../lib.types';
import type { IExportService } from '~/common/export/export.types';
import type { ExportService } from '~/common/export/services/export.service';
import type { IOpportunityFilters } from '@linkinvests/shared';
import {
  OpportunityType,
  EnergyClass,
  GazClass,
  type Auction,
} from '@linkinvests/shared';
import { DEFAULT_PAGE_SIZE } from '~/constants';
import { getOpportunityHeaders } from '~/common/export/services/export-headers.service';
import { succeed } from '~/common/utils/operation-result';

// Mock the export-headers service
jest.mock('~/common/export/services/export-headers.service', () => ({
  getOpportunityHeaders: jest.fn(),
}));

describe('AuctionService', () => {
  let auctionService: AuctionService;
  let mockAuctionRepository: jest.Mocked<AuctionRepository>;
  let mockExportService: jest.Mocked<IExportService>;

  const mockAuction: Auction = {
    id: 'auction-1',
    label: 'Test Auction',
    description: 'Test Description',
    address: 'Test Address',
    zipCode: '75001',
    department: '75',
    latitude: 48.8566,
    longitude: 2.3522,
    opportunityDate: '2024-01-15',
    externalId: 'external-123',
    url: 'https://example.com/auction/1',
    squareFootage: 50,
    rooms: 2,
    energyClass: EnergyClass.D,
    gazClass: GazClass.D,
    currentPrice: 100000,
    reservePrice: 80000,
    source: 'test-source' as any,
    occupationStatus: 'vacant' as any,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockBlob = new Blob(['test data']);

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
    auctionService = new AuctionService(
      mockAuctionRepository,
      mockExportService as unknown as ExportService,
    );

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

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          opportunities: mockAuctions,
          page: 1,
          pageSize: DEFAULT_PAGE_SIZE,
        });
      }
      expect(mockAuctionRepository.findAll).toHaveBeenCalledWith(undefined, {
        limit: DEFAULT_PAGE_SIZE,
        offset: 0,
      });
    });

    it('should return paginated auction data with custom pagination', async () => {
      const filters: IOpportunityFilters = { page: 3, pageSize: 25 };
      const mockAuctions = [mockAuction];
      mockAuctionRepository.findAll.mockResolvedValue(mockAuctions);

      const result = await auctionService.getAuctionsData(filters);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          opportunities: mockAuctions,
          page: 3,
          pageSize: 25,
        });
      }
      expect(mockAuctionRepository.findAll).toHaveBeenCalledWith(
        filters,
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
      const mockAuctions = [mockAuction];
      mockAuctionRepository.findAll.mockResolvedValue(mockAuctions);

      await auctionService.getAuctionsData(filters);

      expect(mockAuctionRepository.findAll).toHaveBeenCalledWith(filters, {
        limit: 10,
        offset: 10,
      });
    });

    it('should return error on repository failure', async () => {
      const error = new Error('Repository error');
      mockAuctionRepository.findAll.mockRejectedValue(error);

      const result = await auctionService.getAuctionsData();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(AuctionServiceErrorReason.UNKNOWN_ERROR);
      }
    });
  });

  describe('getAuctionsCount', () => {
    it('should return auction count without filters', async () => {
      const expectedCount = 150;
      mockAuctionRepository.count.mockResolvedValue(expectedCount);

      const result = await auctionService.getAuctionsCount();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(expectedCount);
      }
      expect(mockAuctionRepository.count).toHaveBeenCalledWith(undefined);
    });

    it('should return auction count with filters', async () => {
      const filters: IOpportunityFilters = { departments: ['75'] };
      const expectedCount = 50;
      mockAuctionRepository.count.mockResolvedValue(expectedCount);

      const result = await auctionService.getAuctionsCount(filters);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(expectedCount);
      }
      expect(mockAuctionRepository.count).toHaveBeenCalledWith(filters);
    });

    it('should return error on repository count failure', async () => {
      const error = new Error('Count error');
      mockAuctionRepository.count.mockRejectedValue(error);

      const result = await auctionService.getAuctionsCount();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(AuctionServiceErrorReason.UNKNOWN_ERROR);
      }
    });
  });

  describe('getAuctionById', () => {
    it('should return auction when found', async () => {
      const auctionId = 'auction-123';
      mockAuctionRepository.findById.mockResolvedValue(mockAuction);

      const result = await auctionService.getAuctionById(auctionId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(mockAuction);
      }
      expect(mockAuctionRepository.findById).toHaveBeenCalledWith(auctionId);
    });

    it('should return NOT_FOUND when auction not found', async () => {
      const auctionId = 'non-existent-auction';
      mockAuctionRepository.findById.mockResolvedValue(null);

      const result = await auctionService.getAuctionById(auctionId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(AuctionServiceErrorReason.NOT_FOUND);
      }
      expect(mockAuctionRepository.findById).toHaveBeenCalledWith(auctionId);
    });

    it('should return error on repository findById failure', async () => {
      const error = new Error('Find error');
      const auctionId = 'auction-123';
      mockAuctionRepository.findById.mockRejectedValue(error);

      const result = await auctionService.getAuctionById(auctionId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(AuctionServiceErrorReason.UNKNOWN_ERROR);
      }
    });
  });

  describe('exportList', () => {
    const filters: IOpportunityFilters = { departments: ['75'] };
    const mockAuctionsForExport = [
      mockAuction,
      { ...mockAuction, id: 'auction-2' },
    ];

    beforeEach(() => {
      mockAuctionRepository.findAll.mockResolvedValue(mockAuctionsForExport);
      mockExportService.exportToCSV.mockResolvedValue(succeed(mockBlob));
      mockExportService.exportToXLSX.mockResolvedValue(succeed(mockBlob));
    });

    it('should export to CSV successfully when under limit', async () => {
      mockAuctionRepository.count.mockResolvedValue(100); // Under 500 limit

      const result = await auctionService.exportList(filters, 'csv');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(mockBlob);
      }
      expect(mockAuctionRepository.count).toHaveBeenCalledWith(filters);
      expect(mockAuctionRepository.findAll).toHaveBeenCalledWith(filters);
      expect(getOpportunityHeaders).toHaveBeenCalledWith(
        OpportunityType.AUCTION,
      );
      expect(mockExportService.exportToCSV).toHaveBeenCalledWith(
        mockAuctionsForExport,
        { title: 'Titre', address: 'Adresse', price: 'Prix' },
      );
    });

    it('should export to XLSX successfully when under limit', async () => {
      mockAuctionRepository.count.mockResolvedValue(200);

      const result = await auctionService.exportList(filters, 'xlsx');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(mockBlob);
      }
      expect(mockExportService.exportToXLSX).toHaveBeenCalledWith(
        mockAuctionsForExport,
        { title: 'Titre', address: 'Adresse', price: 'Prix' },
      );
    });

    it('should return error when export limit exceeded', async () => {
      mockAuctionRepository.count.mockResolvedValue(600); // Over 500 limit

      const result = await auctionService.exportList(filters, 'csv');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(
          AuctionServiceErrorReason.EXPORT_LIMIT_EXCEEDED,
        );
      }

      expect(mockAuctionRepository.findAll).not.toHaveBeenCalled();
      expect(mockExportService.exportToCSV).not.toHaveBeenCalled();
    });

    it('should return error for unsupported export format', async () => {
      mockAuctionRepository.count.mockResolvedValue(100);

      const result = await auctionService.exportList(
        filters,
        'pdf' as 'csv' | 'xlsx',
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(
          AuctionServiceErrorReason.UNSUPPORTED_FORMAT,
        );
      }
    });

    it('should return error on export service failure', async () => {
      mockAuctionRepository.count.mockResolvedValue(100);
      const exportError = new Error('Export failed');
      mockExportService.exportToCSV.mockRejectedValue(exportError);

      const result = await auctionService.exportList(filters, 'csv');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(AuctionServiceErrorReason.UNKNOWN_ERROR);
      }
    });

    it('should return error on repository failure during export', async () => {
      mockAuctionRepository.count.mockResolvedValue(100);
      const repositoryError = new Error('Repository export error');
      mockAuctionRepository.findAll.mockRejectedValue(repositoryError);

      const result = await auctionService.exportList(filters, 'csv');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(AuctionServiceErrorReason.UNKNOWN_ERROR);
      }
    });

    it('should export successfully when count is exactly 500', async () => {
      mockAuctionRepository.count.mockResolvedValue(500); // Exactly at limit

      const result = await auctionService.exportList(filters, 'csv');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(mockBlob);
      }
      expect(mockExportService.exportToCSV).toHaveBeenCalled();
    });

    it('should return error when count is 501 (just over limit)', async () => {
      mockAuctionRepository.count.mockResolvedValue(501); // Just over limit

      const result = await auctionService.exportList(filters, 'csv');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(
          AuctionServiceErrorReason.EXPORT_LIMIT_EXCEEDED,
        );
      }
    });
  });
});
