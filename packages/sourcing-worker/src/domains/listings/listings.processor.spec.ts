import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { ListingsProcessor } from './listings.processor';
import { MoteurImmoService } from './services/moteur-immo.service';
import { ListingsRepository } from './repositories/listings.repository';
import { EnergyClass, ListingInput, PropertyType } from '@linkinvests/shared';

// Mock data
const mockValidListing: ListingInput = {
  label: 'Appartement 3 pièces',
  address: '123 Rue de la Paix',
  zipCode: '75001',
  department: '75',
  latitude: 48.8566,
  longitude: 2.3522,
  opportunityDate: '2024-01-15',
  externalId: 'moteurimmo-123',
  url: 'https://moteurimmo.fr/listing/123',
  source: 'seloger',
  propertyType: PropertyType.FLAT,
  description: 'Bel appartement en centre ville',
  squareFootage: 75,
  isSoldRented: false,
  sellerType: 'individual',
  rooms: 3,
  bedrooms: 2,
  energyClass: EnergyClass.C,
  price: 500000,
  pictures: ['image1.jpg', 'image2.jpg'],
  mainPicture: 'image1.jpg',
};

const mockInvalidListing: any = {
  // Missing required fields to trigger validation failure
  externalId: 'moteurimmo-invalid',
  source: 'seloger',
  // Missing zipCode, department, latitude, longitude, etc.
};

describe('ListingsProcessor', () => {
  let processor: ListingsProcessor;
  let mockMoteurImmoService: jest.Mocked<MoteurImmoService>;
  let mockListingsRepository: jest.Mocked<ListingsRepository>;

  beforeEach(async () => {
    mockMoteurImmoService = {
      getListings: jest.fn(),
    } as any;

    mockListingsRepository = {
      insertListings: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingsProcessor,
        {
          provide: MoteurImmoService,
          useValue: mockMoteurImmoService,
        },
        {
          provide: ListingsRepository,
          useValue: mockListingsRepository,
        },
      ],
    }).compile();

    processor = module.get<ListingsProcessor>(ListingsProcessor);

    // Suppress logger output during tests
    jest.spyOn(processor['logger'], 'log').mockImplementation();
    jest.spyOn(processor['logger'], 'warn').mockImplementation();
    jest.spyOn(processor['logger'], 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('process', () => {
    const createMockJob = (data: any): Job =>
      ({
        id: 'test-job-123',
        data,
      }) as Job;

    it('should successfully process valid listings', async () => {
      const jobData = {
        source: 'moteurimmo',
        afterDate: '2024-01-01',
        beforeDate: '2024-01-31',
        energyClassClasses: ['E', 'F', 'G'],
        propertyTypes: ['ancien'],
        departments: ['75'],
        fetchType: 'energyClass_energy_sieves' as const,
      };

      const mockJob = createMockJob(jobData);

      // Mock service to return valid listings
      mockMoteurImmoService.getListings.mockResolvedValue([
        mockValidListing,
        { ...mockValidListing, externalId: 'moteurimmo-456' },
      ]);

      // Mock repository to return successful insert count
      mockListingsRepository.insertListings.mockResolvedValue(2);

      await processor.process(mockJob);

      // Verify service was called with correct parameters
      expect(mockMoteurImmoService.getListings).toHaveBeenCalledWith({
        afterDate: '2024-01-01',
        beforeDate: '2024-01-31',
        energyClassClasses: ['E', 'F', 'G'],
        propertyTypes: ['ancien'],
        departments: ['75'],
      });

      // Verify repository was called with validated listings
      expect(mockListingsRepository.insertListings).toHaveBeenCalledWith([
        mockValidListing,
        { ...mockValidListing, externalId: 'moteurimmo-456' },
      ]);

      // Verify logging
      expect(processor['logger']['log']).toHaveBeenCalledWith(
        expect.stringContaining('Starting to process listings'),
        expect.objectContaining({
          jobId: 'test-job-123',
          source: 'moteurimmo',
          fetchType: 'energyClass_energy_sieves',
        }),
      );

      expect(processor['logger']['log']).toHaveBeenCalledWith(
        expect.stringContaining('Successfully processed listings'),
        expect.objectContaining({ jobId: 'test-job-123' }),
      );
    });

    it('should handle mixed valid and invalid listings', async () => {
      const jobData = {
        source: 'moteurimmo',
        afterDate: '2024-01-01',
      };

      const mockJob = createMockJob(jobData);

      // Mock service to return mix of valid and invalid listings
      mockMoteurImmoService.getListings.mockResolvedValue([
        mockValidListing,
        mockInvalidListing, // This should fail validation
        { ...mockValidListing, externalId: 'moteurimmo-789' },
      ]);

      // Mock repository to return successful insert count
      mockListingsRepository.insertListings.mockResolvedValue(2);

      await processor.process(mockJob);

      // Should only call repository with valid listings (2 out of 3)
      expect(mockListingsRepository.insertListings).toHaveBeenCalledWith([
        mockValidListing,
        { ...mockValidListing, externalId: 'moteurimmo-789' },
      ]);

      // Should log validation warnings
      expect(processor['logger']['warn']).toHaveBeenCalledWith(
        expect.stringContaining('Invalid listing'),
      );
    });

    it('should handle empty results', async () => {
      const jobData = {
        source: 'moteurimmo',
        afterDate: '2024-01-01',
      };

      const mockJob = createMockJob(jobData);

      // Mock service to return no listings
      mockMoteurImmoService.getListings.mockResolvedValue([]);

      await processor.process(mockJob);

      // Should not call repository
      expect(mockListingsRepository.insertListings).not.toHaveBeenCalled();

      // Should log appropriate message
      expect(processor['logger']['log']).toHaveBeenCalledWith(
        'No valid listings to insert',
      );
    });

    it('should handle default parameters correctly', async () => {
      const jobData = {}; // Empty job data

      const mockJob = createMockJob(jobData);

      mockMoteurImmoService.getListings.mockResolvedValue([mockValidListing]);
      mockListingsRepository.insertListings.mockResolvedValue(1);

      await processor.process(mockJob);

      // Should call service with defaults
      expect(mockMoteurImmoService.getListings).toHaveBeenCalledWith({
        afterDate: undefined,
        beforeDate: undefined,
        energyClassClasses: undefined,
        propertyTypes: undefined,
        departments: undefined,
      });

      // Should log with default values
      expect(processor['logger']['log']).toHaveBeenCalledWith(
        expect.stringContaining(
          'Starting to process listings for source moteurimmo all dates (type: custom)',
        ),
        expect.objectContaining({
          source: 'moteurimmo',
          fetchType: 'custom',
        }),
      );
    });

    it('should handle filter arrays correctly', async () => {
      const jobData = {
        energyClassClasses: ['E', 'F'],
        propertyTypes: ['ancien', 'neuf'],
        departments: ['75', '92'],
      };

      const mockJob = createMockJob(jobData);

      mockMoteurImmoService.getListings.mockResolvedValue([]);

      await processor.process(mockJob);

      // Should pass arrays when they have items
      expect(mockMoteurImmoService.getListings).toHaveBeenCalledWith({
        afterDate: undefined,
        beforeDate: undefined,
        energyClassClasses: ['E', 'F'],
        propertyTypes: ['ancien', 'neuf'],
        departments: ['75', '92'],
      });
    });

    it('should handle empty filter arrays correctly', async () => {
      const jobData = {
        energyClassClasses: [],
        propertyTypes: [],
        departments: [],
      };

      const mockJob = createMockJob(jobData);

      mockMoteurImmoService.getListings.mockResolvedValue([]);

      await processor.process(mockJob);

      // Should pass undefined for empty arrays
      expect(mockMoteurImmoService.getListings).toHaveBeenCalledWith({
        afterDate: undefined,
        beforeDate: undefined,
        energyClassClasses: undefined,
        propertyTypes: undefined,
        departments: undefined,
      });
    });

    it('should handle service errors', async () => {
      const jobData = {
        source: 'moteurimmo',
        afterDate: '2024-01-01',
      };

      const mockJob = createMockJob(jobData);

      // Mock service to throw error
      const serviceError = new Error('API connection failed');
      mockMoteurImmoService.getListings.mockRejectedValue(serviceError);

      await expect(processor.process(mockJob)).rejects.toThrow(
        'API connection failed',
      );

      // Should log error
      expect(processor['logger']['error']).toHaveBeenCalledWith(
        expect.stringContaining('Failed to process listings'),
        expect.objectContaining({
          jobId: 'test-job-123',
          source: 'moteurimmo',
          stack: expect.any(String),
        }),
      );
    });

    it('should handle repository errors', async () => {
      const jobData = {
        source: 'moteurimmo',
        afterDate: '2024-01-01',
      };

      const mockJob = createMockJob(jobData);

      mockMoteurImmoService.getListings.mockResolvedValue([mockValidListing]);

      // Mock repository to throw error
      const repositoryError = new Error('Database connection failed');
      mockListingsRepository.insertListings.mockRejectedValue(repositoryError);

      await expect(processor.process(mockJob)).rejects.toThrow(
        'Database connection failed',
      );

      // Should log repository error specifically
      expect(processor['logger']['error']).toHaveBeenCalledWith(
        'Failed to insert listings: Database connection failed',
      );
    });

    it('should log comprehensive statistics', async () => {
      const jobData = {
        source: 'moteurimmo',
        afterDate: '2024-01-01',
        fetchType: 'recent_listings' as const,
      };

      const mockJob = createMockJob(jobData);

      // Mock data: 3 listings total, 1 invalid, 2 valid, 1 duplicate
      mockMoteurImmoService.getListings.mockResolvedValue([
        mockValidListing,
        mockInvalidListing,
        { ...mockValidListing, externalId: 'moteurimmo-456' },
      ]);

      // Mock repository: 1 duplicate skipped (2 attempted, 1 inserted)
      mockListingsRepository.insertListings.mockResolvedValue(1);

      await processor.process(mockJob);

      // Should log detailed statistics
      expect(processor['logger']['log']).toHaveBeenCalledWith(
        expect.stringContaining('Processing stats for job test-job-123:'),
      );

      expect(processor['logger']['log']).toHaveBeenCalledWith(
        'Job completed successfully',
        expect.objectContaining({
          jobId: 'test-job-123',
          source: 'moteurimmo',
          totalListings: 3,
          validListings: 2,
          listingsInserted: 1,
          duplicatesSkipped: 1,
          errors: 1, // from invalid listing
        }),
      );
    });

    it('should handle date range display correctly', async () => {
      // Test with both dates
      let jobData: any = {
        afterDate: '2024-01-01',
        beforeDate: '2024-01-31',
      };

      let mockJob = createMockJob(jobData);
      mockMoteurImmoService.getListings.mockResolvedValue([]);

      await processor.process(mockJob);

      expect(processor['logger']['log']).toHaveBeenCalledWith(
        expect.stringContaining('from 2024-01-01 to 2024-01-31'),
        expect.any(Object),
      );

      jest.clearAllMocks();

      // Test with only afterDate
      jobData = {
        afterDate: '2024-01-01',
      };

      mockJob = createMockJob(jobData);
      mockMoteurImmoService.getListings.mockResolvedValue([]);

      await processor.process(mockJob);

      expect(processor['logger']['log']).toHaveBeenCalledWith(
        expect.stringContaining('since 2024-01-01'),
        expect.any(Object),
      );

      jest.clearAllMocks();

      // Test with no dates
      jobData = {};

      mockJob = createMockJob(jobData);
      mockMoteurImmoService.getListings.mockResolvedValue([]);

      await processor.process(mockJob);

      expect(processor['logger']['log']).toHaveBeenCalledWith(
        expect.stringContaining('all dates'),
        expect.any(Object),
      );
    });
  });
});
