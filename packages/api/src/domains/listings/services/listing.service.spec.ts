import { ListingService } from './listing.service';
import type { ListingRepository } from '../lib.types';
import type {
  IExportService,
  ExportFormat,
} from '~/common/export/export.types';
import type { IOpportunityFilters } from '~/types';
import {
  OpportunityType,
  EnergyClass,
  type Listing,
} from '@linkinvests/shared';
import { DEFAULT_PAGE_SIZE } from '~/constants';
import { getOpportunityHeaders } from '~/common/export/services/export-headers.service';

// Mock the export-headers service
jest.mock('~/common/export/services/export-headers.service', () => ({
  getOpportunityHeaders: jest.fn(),
}));

describe('ListingService', () => {
  let listingService: ListingService;
  let mockListingRepository: jest.Mocked<ListingRepository>;
  let mockExportService: jest.Mocked<IExportService>;

  const mockListing: Listing = {
    id: 'listing-1',
    label: 'Test Listing',
    description: 'Test Description',
    address: 'Test Address',
    zipCode: '75001',
    department: '75',
    latitude: 48.8566,
    longitude: 2.3522,
    opportunityDate: '2024-01-15',
    externalId: 'external-123',
    url: 'https://example.com/listing/1',
    source: 'test-agency',
    propertyType: 'FLAT' as any,
    lastChangeDate: '2024-01-10',
    price: 250000,
    squareFootage: 75,
    rooms: 3,
    energyClass: EnergyClass.D,
    isSoldRented: false,
    sellerType: 'professional',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mocked dependencies
    mockListingRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      count: jest.fn(),
      getDistinctSources: jest.fn(),
    };

    mockExportService = {
      exportToCSV: jest.fn(),
      exportToXLSX: jest.fn(),
      generateFilename: jest.fn(),
    };

    // Initialize service with mocked dependencies
    listingService = new ListingService(
      mockListingRepository,
      mockExportService,
    );

    // Mock export headers service
    jest.mocked(getOpportunityHeaders).mockReturnValue({
      title: 'Titre',
      address: 'Adresse',
      price: 'Prix',
    });
  });

  describe('getListingsData', () => {
    it('should return paginated listing data with default pagination', async () => {
      const mockListings = [mockListing];
      mockListingRepository.findAll.mockResolvedValue(mockListings);

      const result = await listingService.getListingsData();

      expect(result).toEqual({
        opportunities: mockListings,
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
      });
      expect(mockListingRepository.findAll).toHaveBeenCalledWith(undefined, {
        limit: DEFAULT_PAGE_SIZE,
        offset: 0,
      });
    });

    it('should return paginated listing data with custom pagination', async () => {
      const filters: IOpportunityFilters = { page: 3, pageSize: 25 };
      const mockListings = [mockListing];
      mockListingRepository.findAll.mockResolvedValue(mockListings);

      const result = await listingService.getListingsData(filters);

      expect(result).toEqual({
        opportunities: mockListings,
        page: 3,
        pageSize: 25,
      });
      expect(mockListingRepository.findAll).toHaveBeenCalledWith(
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
      const mockListings = [mockListing];
      mockListingRepository.findAll.mockResolvedValue(mockListings);

      await listingService.getListingsData(filters);

      expect(mockListingRepository.findAll).toHaveBeenCalledWith(filters, {
        limit: 10,
        offset: 10,
      });
    });

    it('should handle repository errors', async () => {
      const error = new Error('Repository error');
      mockListingRepository.findAll.mockRejectedValue(error);

      await expect(listingService.getListingsData()).rejects.toThrow(
        'Repository error',
      );
    });
  });

  describe('getListingsCount', () => {
    it('should return listing count without filters', async () => {
      const expectedCount = 350;
      mockListingRepository.count.mockResolvedValue(expectedCount);

      const result = await listingService.getListingsCount();

      expect(result).toBe(expectedCount);
      expect(mockListingRepository.count).toHaveBeenCalledWith(undefined);
    });

    it('should return listing count with filters', async () => {
      const filters: IOpportunityFilters = { departments: ['75'] };
      const expectedCount = 120;
      mockListingRepository.count.mockResolvedValue(expectedCount);

      const result = await listingService.getListingsCount(filters);

      expect(result).toBe(expectedCount);
      expect(mockListingRepository.count).toHaveBeenCalledWith(filters);
    });

    it('should handle repository count errors', async () => {
      const error = new Error('Count error');
      mockListingRepository.count.mockRejectedValue(error);

      await expect(listingService.getListingsCount()).rejects.toThrow(
        'Count error',
      );
    });
  });

  describe('getListingById', () => {
    it('should return listing when found', async () => {
      const listingId = 'listing-123';
      mockListingRepository.findById.mockResolvedValue(mockListing);

      const result = await listingService.getListingById(listingId);

      expect(result).toBe(mockListing);
      expect(mockListingRepository.findById).toHaveBeenCalledWith(listingId);
    });

    it('should return null when listing not found', async () => {
      const listingId = 'non-existent-listing';
      mockListingRepository.findById.mockResolvedValue(null);

      const result = await listingService.getListingById(listingId);

      expect(result).toBeNull();
      expect(mockListingRepository.findById).toHaveBeenCalledWith(listingId);
    });

    it('should handle repository findById errors', async () => {
      const error = new Error('Find error');
      const listingId = 'listing-123';
      mockListingRepository.findById.mockRejectedValue(error);

      await expect(listingService.getListingById(listingId)).rejects.toThrow(
        'Find error',
      );
    });
  });

  describe('exportList', () => {
    const filters: IOpportunityFilters = { departments: ['75'] };
    const mockListingsForExport = [
      mockListing,
      { ...mockListing, id: 'listing-2' },
    ];
    const mockBlob = new Blob(['test data']);

    beforeEach(() => {
      mockListingRepository.findAll.mockResolvedValue(mockListingsForExport);
      mockExportService.exportToCSV.mockResolvedValue(mockBlob);
      mockExportService.exportToXLSX.mockResolvedValue(mockBlob);
    });

    it('should export to CSV successfully when under limit', async () => {
      mockListingRepository.count.mockResolvedValue(200); // Under 500 limit

      const result = await listingService.exportList(filters, 'csv');

      expect(result).toBe(mockBlob);
      expect(mockListingRepository.count).toHaveBeenCalledWith(filters);
      expect(mockListingRepository.findAll).toHaveBeenCalledWith(filters);
      expect(getOpportunityHeaders).toHaveBeenCalledWith(
        OpportunityType.REAL_ESTATE_LISTING,
      );
      expect(mockExportService.exportToCSV).toHaveBeenCalledWith(
        mockListingsForExport,
        { title: 'Titre', address: 'Adresse', price: 'Prix' },
      );
    });

    it('should export to XLSX successfully when under limit', async () => {
      mockListingRepository.count.mockResolvedValue(300);

      const result = await listingService.exportList(filters, 'xlsx');

      expect(result).toBe(mockBlob);
      expect(mockExportService.exportToXLSX).toHaveBeenCalledWith(
        mockListingsForExport,
        { title: 'Titre', address: 'Adresse', price: 'Prix' },
      );
    });

    it('should throw error when export limit exceeded', async () => {
      mockListingRepository.count.mockResolvedValue(750); // Over 500 limit

      await expect(listingService.exportList(filters, 'csv')).rejects.toThrow(
        'Export limit exceeded. Found 750 items, maximum allowed is 500. Please refine your filters.',
      );

      expect(mockListingRepository.findAll).not.toHaveBeenCalled();
      expect(mockExportService.exportToCSV).not.toHaveBeenCalled();
    });

    it('should throw error for unsupported export format', async () => {
      mockListingRepository.count.mockResolvedValue(100);

      await expect(
        listingService.exportList(filters, 'pdf' as ExportFormat),
      ).rejects.toThrow('Unsupported export format: pdf');
    });

    it('should handle export service errors', async () => {
      mockListingRepository.count.mockResolvedValue(100);
      const exportError = new Error('Export failed');
      mockExportService.exportToCSV.mockRejectedValue(exportError);

      await expect(listingService.exportList(filters, 'csv')).rejects.toThrow(
        'Export failed',
      );
    });

    it('should handle repository errors during export', async () => {
      mockListingRepository.count.mockResolvedValue(100);
      const repositoryError = new Error('Repository export error');
      mockListingRepository.findAll.mockRejectedValue(repositoryError);

      await expect(listingService.exportList(filters, 'csv')).rejects.toThrow(
        'Repository export error',
      );
    });

    it('should validate export limit is exactly 500', async () => {
      mockListingRepository.count.mockResolvedValue(500); // Exactly at limit

      const result = await listingService.exportList(filters, 'csv');

      expect(result).toBe(mockBlob);
      expect(mockExportService.exportToCSV).toHaveBeenCalled();
    });

    it('should reject when count is 501 (just over limit)', async () => {
      mockListingRepository.count.mockResolvedValue(501); // Just over limit

      await expect(listingService.exportList(filters, 'csv')).rejects.toThrow(
        'Export limit exceeded. Found 501 items, maximum allowed is 500. Please refine your filters.',
      );
    });
  });
});
