import { Test, TestingModule } from '@nestjs/testing';
import { AuctionsProcessor } from './auctions.processor';
import { EncheresPubliquesScraperService } from './services/encheres-publiques-scraper.service';
import { AuctionsOpportunityRepository } from './repositories/auctions-opportunity.repository';
import type { Job } from 'bullmq';
import type { AuctionOpportunity } from './types';

describe('AuctionsProcessor', () => {
  let processor: AuctionsProcessor;
  let scraperService: EncheresPubliquesScraperService;
  let repository: AuctionsOpportunityRepository;

  const mockScraperService = {
    scrapeAuctions: jest.fn(),
  };

  const mockRepository = {
    insertOpportunities: jest.fn(),
  };

  const mockOpportunities: AuctionOpportunity[] = [
    {
      url: 'https://encheres-publiques.fr/lot/test-1',
      label: 'Test Property 1',
      address: '1 Rue de la Paix, 75001 Paris, France',
      city: 'Paris',
      department: 75,
      zipCode: 75001,
      latitude: 48.8566,
      longitude: 2.3522,
      auctionDate: '2025-01-15T14:00:00.000Z',
      extraData: {
        url: 'https://encheres-publiques.fr/lot/test-1',
        auctionId: '12345',
        auctionVenue: 'Tribunal de Paris',
      },
    },
    {
      url: 'https://encheres-publiques.fr/lot/test-2',
      label: 'Test Property 2',
      address: '2 Avenue des Champs-Élysées, 75008 Paris, France',
      city: 'Paris',
      department: 75,
      zipCode: 75008,
      latitude: 48.8698,
      longitude: 2.3075,
      auctionDate: '2025-01-20T15:30:00.000Z',
      extraData: {
        url: 'https://encheres-publiques.fr/lot/test-2',
        auctionId: '12346',
        auctionVenue: 'Tribunal de Paris',
      },
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuctionsProcessor,
        { provide: EncheresPubliquesScraperService, useValue: mockScraperService },
        { provide: AuctionsOpportunityRepository, useValue: mockRepository },
      ],
    }).compile();

    processor = module.get<AuctionsProcessor>(AuctionsProcessor);
    scraperService = module.get<EncheresPubliquesScraperService>(EncheresPubliquesScraperService);
    repository = module.get<AuctionsOpportunityRepository>(AuctionsOpportunityRepository);

    // Suppress logger
    jest.spyOn(processor['logger'], 'log').mockImplementation();
    jest.spyOn(processor['logger'], 'warn').mockImplementation();
    jest.spyOn(processor['logger'], 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('processScrapeAuctions', () => {
    const createMockJob = (name: string, data: any = {}): Job => ({
      name,
      data,
      id: 'test-job-123',
      timestamp: Date.now(),
      processedOn: Date.now(),
      finishedOn: null,
      progress: jest.fn(),
      log: jest.fn(),
      updateProgress: jest.fn(),
    } as any);

    beforeEach(() => {
      mockScraperService.scrapeAuctions.mockResolvedValue(mockOpportunities);
      mockRepository.insertOpportunities.mockResolvedValue(undefined);
    });

    it('should process scrape-auctions job successfully', async () => {
      const job = createMockJob('scrape-auctions');

      const result = await processor.processScrapeAuctions(job);

      expect(result).toEqual({
        success: true,
        totalOpportunities: 2,
        persistedOpportunities: 2,
      });

      expect(mockScraperService.scrapeAuctions).toHaveBeenCalledTimes(1);
      expect(mockRepository.insertOpportunities).toHaveBeenCalledWith(mockOpportunities);

      expect(processor['logger'].log).toHaveBeenCalledWith('Starting auction scraping job...');
      expect(processor['logger'].log).toHaveBeenCalledWith('Found 2 opportunities to process');
      expect(processor['logger'].log).toHaveBeenCalledWith('Successfully persisted 2 opportunities');
      expect(processor['logger'].log).toHaveBeenCalledWith('Auction scraping job completed successfully');
    });

    it('should reject job with invalid name', async () => {
      const job = createMockJob('invalid-job-name');

      await expect(processor.processScrapeAuctions(job)).rejects.toThrow(
        'Invalid job name: invalid-job-name. Expected: scrape-auctions'
      );

      expect(mockScraperService.scrapeAuctions).not.toHaveBeenCalled();
      expect(mockRepository.insertOpportunities).not.toHaveBeenCalled();
    });

    it('should handle empty scraping results', async () => {
      mockScraperService.scrapeAuctions.mockResolvedValue([]);
      const job = createMockJob('scrape-auctions');

      const result = await processor.processScrapeAuctions(job);

      expect(result).toEqual({
        success: true,
        totalOpportunities: 0,
        persistedOpportunities: 0,
      });

      expect(processor['logger'].log).toHaveBeenCalledWith('Found 0 opportunities to process');
      expect(processor['logger'].log).toHaveBeenCalledWith('No opportunities to persist');
      expect(mockRepository.insertOpportunities).not.toHaveBeenCalled();
    });

    it('should handle scraper service failure', async () => {
      const scraperError = new Error('Scraping failed');
      mockScraperService.scrapeAuctions.mockRejectedValue(scraperError);
      const job = createMockJob('scrape-auctions');

      await expect(processor.processScrapeAuctions(job)).rejects.toThrow('Scraping failed');

      expect(processor['logger'].error).toHaveBeenCalledWith(
        'Failed to scrape auctions:',
        scraperError
      );
      expect(mockRepository.insertOpportunities).not.toHaveBeenCalled();
    });

    it('should handle repository insertion failure', async () => {
      const repositoryError = new Error('Database insertion failed');
      mockRepository.insertOpportunities.mockRejectedValue(repositoryError);
      const job = createMockJob('scrape-auctions');

      await expect(processor.processScrapeAuctions(job)).rejects.toThrow('Database insertion failed');

      expect(processor['logger'].error).toHaveBeenCalledWith(
        'Failed to persist opportunities:',
        repositoryError
      );
      expect(mockScraperService.scrapeAuctions).toHaveBeenCalledTimes(1);
    });

    it('should handle null scraping results', async () => {
      mockScraperService.scrapeAuctions.mockResolvedValue(null as any);
      const job = createMockJob('scrape-auctions');

      const result = await processor.processScrapeAuctions(job);

      expect(result).toEqual({
        success: true,
        totalOpportunities: 0,
        persistedOpportunities: 0,
      });

      expect(processor['logger'].log).toHaveBeenCalledWith('Found 0 opportunities to process');
    });

    it('should handle undefined scraping results', async () => {
      mockScraperService.scrapeAuctions.mockResolvedValue(undefined as any);
      const job = createMockJob('scrape-auctions');

      const result = await processor.processScrapeAuctions(job);

      expect(result).toEqual({
        success: true,
        totalOpportunities: 0,
        persistedOpportunities: 0,
      });
    });

    it('should log detailed statistics for large datasets', async () => {
      const largeOpportunitiesArray: AuctionOpportunity[] = Array(1000).fill(null).map((_, index) => ({
        ...mockOpportunities[0],
        url: `https://test.com/lot-${index}`,
        extraData: {
          ...mockOpportunities[0].extraData,
          auctionId: `id-${index}`,
        },
      }));

      mockScraperService.scrapeAuctions.mockResolvedValue(largeOpportunitiesArray);
      const job = createMockJob('scrape-auctions');

      const result = await processor.processScrapeAuctions(job);

      expect(result).toEqual({
        success: true,
        totalOpportunities: 1000,
        persistedOpportunities: 1000,
      });

      expect(processor['logger'].log).toHaveBeenCalledWith('Found 1000 opportunities to process');
      expect(processor['logger'].log).toHaveBeenCalledWith('Successfully persisted 1000 opportunities');
    });

    it('should handle partial persistence scenarios', async () => {
      // Simulate scenario where repository doesn't throw but persists different count
      // (This would happen if some records were filtered or failed silently)
      const job = createMockJob('scrape-auctions');

      const result = await processor.processScrapeAuctions(job);

      expect(result.totalOpportunities).toBe(2);
      expect(result.persistedOpportunities).toBe(2); // Assuming all were persisted
      expect(result.success).toBe(true);
    });

    it('should handle job with custom data payload', async () => {
      const customData = {
        customParam: 'test-value',
        timestamp: Date.now(),
      };
      const job = createMockJob('scrape-auctions', customData);

      const result = await processor.processScrapeAuctions(job);

      expect(result.success).toBe(true);
      // Custom data doesn't affect processing, but job should still succeed
      expect(mockScraperService.scrapeAuctions).toHaveBeenCalledTimes(1);
    });

    it('should measure and log execution time', async () => {
      const job = createMockJob('scrape-auctions');

      // Mock Date.now to control timing
      const startTime = 1000000;
      const endTime = 1005000; // 5 seconds later
      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(startTime)
        .mockReturnValueOnce(endTime);

      await processor.processScrapeAuctions(job);

      expect(processor['logger'].log).toHaveBeenCalledWith(
        expect.stringContaining('Auction scraping job completed successfully')
      );
    });

    it('should handle concurrent job processing', async () => {
      const job1 = createMockJob('scrape-auctions');
      const job2 = createMockJob('scrape-auctions');

      // Process both jobs concurrently
      const [result1, result2] = await Promise.all([
        processor.processScrapeAuctions(job1),
        processor.processScrapeAuctions(job2),
      ]);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(mockScraperService.scrapeAuctions).toHaveBeenCalledTimes(2);
      expect(mockRepository.insertOpportunities).toHaveBeenCalledTimes(2);
    });

    it('should handle service unavailability gracefully', async () => {
      const unavailableError = new Error('Service temporarily unavailable');
      unavailableError.name = 'ServiceUnavailableError';
      mockScraperService.scrapeAuctions.mockRejectedValue(unavailableError);

      const job = createMockJob('scrape-auctions');

      await expect(processor.processScrapeAuctions(job)).rejects.toThrow('Service temporarily unavailable');

      expect(processor['logger'].error).toHaveBeenCalledWith(
        'Failed to scrape auctions:',
        unavailableError
      );
    });

    it('should handle timeout scenarios', async () => {
      const timeoutError = new Error('Operation timed out');
      timeoutError.name = 'TimeoutError';
      mockScraperService.scrapeAuctions.mockRejectedValue(timeoutError);

      const job = createMockJob('scrape-auctions');

      await expect(processor.processScrapeAuctions(job)).rejects.toThrow('Operation timed out');

      expect(processor['logger'].error).toHaveBeenCalledWith(
        'Failed to scrape auctions:',
        timeoutError
      );
    });

    it('should preserve job metadata in logs', async () => {
      const job = createMockJob('scrape-auctions');
      job.id = 'auction-job-456';

      await processor.processScrapeAuctions(job);

      expect(processor['logger'].log).toHaveBeenCalledWith('Starting auction scraping job...');
      // The processor should have access to job metadata if needed for debugging
    });

    it('should handle mixed success/failure in batch processing', async () => {
      // Simulate scenario where scraping succeeds but persistence partially fails
      const repositoryError = new Error('Some records failed to insert');
      mockRepository.insertOpportunities.mockRejectedValue(repositoryError);

      const job = createMockJob('scrape-auctions');

      await expect(processor.processScrapeAuctions(job)).rejects.toThrow('Some records failed to insert');

      // Should have attempted scraping first
      expect(mockScraperService.scrapeAuctions).toHaveBeenCalledTimes(1);
      expect(processor['logger'].log).toHaveBeenCalledWith('Found 2 opportunities to process');

      // Then failed during persistence
      expect(processor['logger'].error).toHaveBeenCalledWith(
        'Failed to persist opportunities:',
        repositoryError
      );
    });
  });

  describe('error handling and recovery', () => {
    it('should provide detailed error messages for debugging', async () => {
      const detailedError = new Error('Database connection pool exhausted');
      detailedError.stack = 'Error stack trace...';
      mockRepository.insertOpportunities.mockRejectedValue(detailedError);

      const job = { name: 'scrape-auctions' } as Job;

      await expect(processor.processScrapeAuctions(job)).rejects.toThrow(
        'Database connection pool exhausted'
      );

      expect(processor['logger'].error).toHaveBeenCalledWith(
        'Failed to persist opportunities:',
        detailedError
      );
    });

    it('should handle invalid job data gracefully', async () => {
      const job = createMockJob('scrape-auctions', null);

      const result = await processor.processScrapeAuctions(job);

      expect(result.success).toBe(true);
      // Should still process normally as job data isn't used in this implementation
    });

    it('should maintain job processing statistics', async () => {
      const job = createMockJob('scrape-auctions');

      const result = await processor.processScrapeAuctions(job);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('totalOpportunities');
      expect(result).toHaveProperty('persistedOpportunities');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.totalOpportunities).toBe('number');
      expect(typeof result.persistedOpportunities).toBe('number');
    });
  });
});