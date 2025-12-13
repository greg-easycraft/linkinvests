import {
  SuccessionService,
  SuccessionServiceErrorReason,
} from './succession.service';
import type { SuccessionRepository } from '../lib.types';
import type { IExportService } from '~/common/export/export.types';
import type { ExportService } from '~/common/export/services/export.service';
import {
  OpportunityType,
  type IOpportunityFilters,
  type Succession,
} from '@linkinvests/shared';
import { DEFAULT_PAGE_SIZE } from '~/constants';
import { getOpportunityHeaders } from '~/common/export/services/export-headers.service';
import { succeed } from '~/common/utils/operation-result';

// Mock the export-headers service
jest.mock('~/common/export/services/export-headers.service', () => ({
  getOpportunityHeaders: jest.fn(),
}));

describe('SuccessionService', () => {
  let successionService: SuccessionService;
  let mockSuccessionRepository: jest.Mocked<SuccessionRepository>;
  let mockExportService: jest.Mocked<IExportService>;

  const mockSuccession: Succession = {
    id: 'succession-1',
    label: 'Test Succession',
    streetAddress: 'Test Address',
    city: 'Paris',
    zipCode: '75001',
    department: '75',
    latitude: 48.8566,
    longitude: 2.3522,
    opportunityDate: '2024-01-15',
    externalId: 'external-123',
    firstName: 'Jean',
    lastName: 'Dupont',
    mairieContact: {
      name: 'Mairie de Paris',
      address: {
        complement1: '',
        complement2: '',
        numero_voie: "1 Place de l'Hôtel de Ville",
        service_distribution: '',
        code_postal: '75004',
        nom_commune: 'Paris',
      },
      phone: '01 42 76 40 40',
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockBlob = new Blob(['test data']);

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
    successionService = new SuccessionService(
      mockSuccessionRepository,
      mockExportService as unknown as ExportService,
    );

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

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          opportunities: mockSuccessions,
          page: 1,
          pageSize: DEFAULT_PAGE_SIZE,
        });
      }
      expect(mockSuccessionRepository.findAll).toHaveBeenCalledWith(undefined, {
        limit: DEFAULT_PAGE_SIZE,
        offset: 0,
      });
    });

    it('should return paginated succession data with custom pagination', async () => {
      const filters: IOpportunityFilters = { page: 3, pageSize: 25 };
      const mockSuccessions = [mockSuccession];
      mockSuccessionRepository.findAll.mockResolvedValue(mockSuccessions);

      const result = await successionService.getSuccessionsData(filters);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          opportunities: mockSuccessions,
          page: 3,
          pageSize: 25,
        });
      }
      expect(mockSuccessionRepository.findAll).toHaveBeenCalledWith(
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
      const mockSuccessions = [mockSuccession];
      mockSuccessionRepository.findAll.mockResolvedValue(mockSuccessions);

      await successionService.getSuccessionsData(filters);

      expect(mockSuccessionRepository.findAll).toHaveBeenCalledWith(filters, {
        limit: 10,
        offset: 10,
      });
    });

    it('should return error on repository failure', async () => {
      const error = new Error('Repository error');
      mockSuccessionRepository.findAll.mockRejectedValue(error);

      const result = await successionService.getSuccessionsData();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(SuccessionServiceErrorReason.UNKNOWN_ERROR);
      }
    });
  });

  describe('getSuccessionsCount', () => {
    it('should return succession count without filters', async () => {
      const expectedCount = 420;
      mockSuccessionRepository.count.mockResolvedValue(expectedCount);

      const result = await successionService.getSuccessionsCount();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(expectedCount);
      }
      expect(mockSuccessionRepository.count).toHaveBeenCalledWith(undefined);
    });

    it('should return succession count with filters', async () => {
      const filters: IOpportunityFilters = { departments: ['75'] };
      const expectedCount = 95;
      mockSuccessionRepository.count.mockResolvedValue(expectedCount);

      const result = await successionService.getSuccessionsCount(filters);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(expectedCount);
      }
      expect(mockSuccessionRepository.count).toHaveBeenCalledWith(filters);
    });

    it('should return error on repository count failure', async () => {
      const error = new Error('Count error');
      mockSuccessionRepository.count.mockRejectedValue(error);

      const result = await successionService.getSuccessionsCount();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(SuccessionServiceErrorReason.UNKNOWN_ERROR);
      }
    });
  });

  describe('getSuccessionById', () => {
    it('should return succession when found', async () => {
      const successionId = 'succession-123';
      mockSuccessionRepository.findById.mockResolvedValue(mockSuccession);

      const result = await successionService.getSuccessionById(successionId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(mockSuccession);
      }
      expect(mockSuccessionRepository.findById).toHaveBeenCalledWith(
        successionId,
      );
    });

    it('should return NOT_FOUND when succession not found', async () => {
      const successionId = 'non-existent-succession';
      mockSuccessionRepository.findById.mockResolvedValue(null);

      const result = await successionService.getSuccessionById(successionId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(SuccessionServiceErrorReason.NOT_FOUND);
      }
      expect(mockSuccessionRepository.findById).toHaveBeenCalledWith(
        successionId,
      );
    });

    it('should return error on repository findById failure', async () => {
      const error = new Error('Find error');
      const successionId = 'succession-123';
      mockSuccessionRepository.findById.mockRejectedValue(error);

      const result = await successionService.getSuccessionById(successionId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(SuccessionServiceErrorReason.UNKNOWN_ERROR);
      }
    });
  });

  describe('exportList', () => {
    const filters: IOpportunityFilters = { departments: ['75'] };
    const mockSuccessionsForExport = [
      mockSuccession,
      { ...mockSuccession, id: 'succession-2' },
    ];

    beforeEach(() => {
      mockSuccessionRepository.findAll.mockResolvedValue(
        mockSuccessionsForExport,
      );
      mockExportService.exportToCSV.mockResolvedValue(succeed(mockBlob));
      mockExportService.exportToXLSX.mockResolvedValue(succeed(mockBlob));
    });

    it('should export to CSV successfully when under limit', async () => {
      mockSuccessionRepository.count.mockResolvedValue(180); // Under 500 limit

      const result = await successionService.exportList(filters, 'csv');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(mockBlob);
      }
      expect(mockSuccessionRepository.count).toHaveBeenCalledWith(filters);
      expect(mockSuccessionRepository.findAll).toHaveBeenCalledWith(filters);
      expect(getOpportunityHeaders).toHaveBeenCalledWith(
        OpportunityType.SUCCESSION,
      );
      expect(mockExportService.exportToCSV).toHaveBeenCalledWith(
        mockSuccessionsForExport,
        { title: 'Titre', address: 'Adresse', price: 'Prix' },
      );
    });

    it('should export to XLSX successfully when under limit', async () => {
      mockSuccessionRepository.count.mockResolvedValue(320);

      const result = await successionService.exportList(filters, 'xlsx');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(mockBlob);
      }
      expect(mockExportService.exportToXLSX).toHaveBeenCalledWith(
        mockSuccessionsForExport,
        { title: 'Titre', address: 'Adresse', price: 'Prix' },
      );
    });

    it('should return error when export limit exceeded', async () => {
      mockSuccessionRepository.count.mockResolvedValue(800); // Over 500 limit

      const result = await successionService.exportList(filters, 'csv');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(
          SuccessionServiceErrorReason.EXPORT_LIMIT_EXCEEDED,
        );
      }

      expect(mockSuccessionRepository.findAll).not.toHaveBeenCalled();
      expect(mockExportService.exportToCSV).not.toHaveBeenCalled();
    });

    it('should return error for unsupported export format', async () => {
      mockSuccessionRepository.count.mockResolvedValue(100);

      const result = await successionService.exportList(
        filters,
        'pdf' as 'csv' | 'xlsx',
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(
          SuccessionServiceErrorReason.UNSUPPORTED_FORMAT,
        );
      }
    });

    it('should return error on export service failure', async () => {
      mockSuccessionRepository.count.mockResolvedValue(100);
      const exportError = new Error('Export failed');
      mockExportService.exportToCSV.mockRejectedValue(exportError);

      const result = await successionService.exportList(filters, 'csv');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(SuccessionServiceErrorReason.UNKNOWN_ERROR);
      }
    });

    it('should return error on repository failure during export', async () => {
      mockSuccessionRepository.count.mockResolvedValue(100);
      const repositoryError = new Error('Repository export error');
      mockSuccessionRepository.findAll.mockRejectedValue(repositoryError);

      const result = await successionService.exportList(filters, 'csv');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(SuccessionServiceErrorReason.UNKNOWN_ERROR);
      }
    });

    it('should export successfully when count is exactly 500', async () => {
      mockSuccessionRepository.count.mockResolvedValue(500); // Exactly at limit

      const result = await successionService.exportList(filters, 'csv');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(mockBlob);
      }
      expect(mockExportService.exportToCSV).toHaveBeenCalled();
    });

    it('should return error when count is 501 (just over limit)', async () => {
      mockSuccessionRepository.count.mockResolvedValue(501); // Just over limit

      const result = await successionService.exportList(filters, 'csv');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe(
          SuccessionServiceErrorReason.EXPORT_LIMIT_EXCEEDED,
        );
      }
    });
  });
});
