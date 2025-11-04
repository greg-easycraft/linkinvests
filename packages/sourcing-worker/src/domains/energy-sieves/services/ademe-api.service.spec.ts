import { Test, TestingModule } from '@nestjs/testing';
import { AdemeApiService } from './ademe-api.service';
import type { DpeRecord } from '../types/energy-sieves.types';

// Mock global fetch
global.fetch = jest.fn();

describe('AdemeApiService', () => {
  let service: AdemeApiService;
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdemeApiService],
    }).compile();

    service = module.get<AdemeApiService>(AdemeApiService);

    // Suppress logger output during tests
    jest.spyOn(service['logger'], 'log').mockImplementation();
    jest.spyOn(service['logger'], 'warn').mockImplementation();
    jest.spyOn(service['logger'], 'error').mockImplementation();

    // Mock Date.now() for rate limiting tests
    jest.spyOn(Date, 'now').mockReturnValue(1000000);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('buildApiUrl', () => {
    it('should build correct ADEME API URL with all parameters', () => {
      const url = service['buildApiUrl'](75, '2024-01-01', ['F', 'G'], 1, 1000);

      expect(url).toContain(
        'https://data.ademe.fr/data-fair/api/v1/datasets/dpe03existant/lines',
      );
      expect(url).toContain('size=1000');
      expect(url).toContain('page=1');
      expect(url).toContain('qs=');
      expect(url).toContain('code_departement_ban%3A75');
      expect(url).toContain('etiquette_dpe%3A%28F+OR+G%29');
      expect(url).toContain('date_etablissement_dpe%3A%3E%3D2024-01-01');
    });

    it('should pad single-digit department code with zero', () => {
      const url = service['buildApiUrl'](7, '2024-01-01', ['F'], 1, 1000);

      expect(url).toContain('code_departement_ban%3A07');
    });

    it('should handle single energy class', () => {
      const url = service['buildApiUrl'](75, '2024-01-01', ['F'], 1, 1000);

      expect(url).toContain('etiquette_dpe%3A%28F%29');
    });

    it('should handle multiple energy classes', () => {
      const url = service['buildApiUrl'](
        75,
        '2024-01-01',
        ['D', 'E', 'F', 'G'],
        1,
        1000,
      );

      expect(url).toContain('etiquette_dpe%3A%28D+OR+E+OR+F+OR+G%29');
    });

    it('should select correct fields', () => {
      const url = service['buildApiUrl'](75, '2024-01-01', ['F'], 1, 1000);

      expect(url).toContain('select=');
      expect(url).toContain('numero_dpe');
      expect(url).toContain('adresse_ban');
      expect(url).toContain('code_postal_ban');
      expect(url).toContain('_geopoint');
      expect(url).toContain('date_etablissement_dpe');
    });

    it('should build URL with date range when beforeDate is provided', () => {
      const url = service['buildApiUrl'](75, '2024-01-01', ['F', 'G'], 1, 1000, '2024-12-31');

      expect(url).toContain('date_etablissement_dpe%3A%3E%3D2024-01-01');
      expect(url).toContain('date_etablissement_dpe%3A%3C%3D2024-12-31');
    });

    it('should build URL without beforeDate when not provided', () => {
      const url = service['buildApiUrl'](75, '2024-01-01', ['F', 'G'], 1, 1000);

      expect(url).toContain('date_etablissement_dpe%3A%3E%3D2024-01-01');
      expect(url).not.toContain('date_etablissement_dpe%3A%3C%3D');
    });
  });

  describe('fetchDpePage', () => {
    const mockDpeRecords: DpeRecord[] = [
      {
        numero_dpe: 'DPE123',
        adresse_ban: '123 Rue Test',
        code_postal_ban: '75001',
        nom_commune_ban: 'Paris',
        code_departement_ban: '75',
        etiquette_dpe: 'F',
        etiquette_ges: 'F',
        _geopoint: '48.8566,2.3522',
        date_etablissement_dpe: '2024-01-15',
        date_reception_dpe: '2024-01-16',
        type_batiment: 'Appartement',
        annee_construction: '1950',
        surface_habitable_logement: 50,
      },
    ];

    it('should successfully fetch a page of DPE records', async () => {
      mockFetch.mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue({
          results: mockDpeRecords,
        }),
      } as any);

      const result = await service['fetchDpePage'](
        75,
        '2024-01-01',
        ['F', 'G'],
        1,
        1000,
      );

      expect(result).toEqual(mockDpeRecords);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('code_departement_ban%3A75'),
        expect.objectContaining({
          method: 'GET',
          signal: expect.any(AbortSignal),
        }),
      );
    });

    it('should return empty array when results is undefined', async () => {
      mockFetch.mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue({}),
      } as any);

      const result = await service['fetchDpePage'](
        75,
        '2024-01-01',
        ['F'],
        1,
        1000,
      );

      expect(result).toEqual([]);
    });

    it('should throw error on non-200 status', async () => {
      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      mockFetch.mockResolvedValue({
        status: 500,
        json: jest.fn(),
      } as any);

      await expect(
        service['fetchDpePage'](75, '2024-01-01', ['F'], 1, 1000),
      ).rejects.toThrow('ADEME API returned status 500');

      sleepSpy.mockRestore();
    });

    it('should handle 429 rate limit with retry-after header', async () => {
      // First call: rate limited
      mockFetch.mockResolvedValueOnce({
        status: 429,
        headers: {
          get: jest.fn().mockReturnValue('2'),
        },
        json: jest.fn(),
      } as any);

      // Second call: success
      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: jest.fn().mockResolvedValue({
          results: mockDpeRecords,
        }),
      } as any);

      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      const result = await service['fetchDpePage'](
        75,
        '2024-01-01',
        ['F'],
        1,
        1000,
      );

      expect(result).toEqual(mockDpeRecords);
      expect(sleepSpy).toHaveBeenCalledWith(2000); // 2 seconds * 1000ms
      expect(service['logger'].warn).toHaveBeenCalledWith(
        expect.stringContaining('Rate limited'),
      );
    });

    it('should handle 429 rate limit without retry-after header', async () => {
      // First call: rate limited
      mockFetch.mockResolvedValueOnce({
        status: 429,
        headers: {
          get: jest.fn().mockReturnValue(null),
        },
        json: jest.fn(),
      } as any);

      // Second call: success
      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: jest.fn().mockResolvedValue({
          results: mockDpeRecords,
        }),
      } as any);

      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      const result = await service['fetchDpePage'](
        75,
        '2024-01-01',
        ['F'],
        1,
        1000,
      );

      expect(result).toEqual(mockDpeRecords);
      expect(sleepSpy).toHaveBeenCalledWith(2000); // retryDelay * 1 (first attempt)
    });

    it('should retry on transient errors up to maxRetries', async () => {
      // First 2 calls: fail
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'));

      // Third call: success
      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: jest.fn().mockResolvedValue({
          results: mockDpeRecords,
        }),
      } as any);

      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      const result = await service['fetchDpePage'](
        75,
        '2024-01-01',
        ['F'],
        1,
        1000,
      );

      expect(result).toEqual(mockDpeRecords);
      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(sleepSpy).toHaveBeenCalledTimes(2); // 2 retries
      expect(service['logger'].warn).toHaveBeenCalledWith(
        expect.stringContaining('Retrying'),
      );
    });

    it('should throw error after maxRetries exhausted', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      await expect(
        service['fetchDpePage'](75, '2024-01-01', ['F'], 1, 1000),
      ).rejects.toThrow('Network error');

      expect(mockFetch).toHaveBeenCalledTimes(3); // maxRetries = 3
      expect(sleepSpy).toHaveBeenCalledTimes(2); // 2 retry delays
      expect(service['logger'].error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to fetch DPE records'),
        expect.any(String),
      );
    });

    it('should respect rate limiting (minRequestInterval)', async () => {
      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      // Set lastRequestTime to simulate recent request
      service['lastRequestTime'] = 999950; // 50ms ago

      mockFetch.mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue({
          results: mockDpeRecords,
        }),
      } as any);

      await service['fetchDpePage'](75, '2024-01-01', ['F'], 1, 1000);

      // Should wait 50ms to reach minRequestInterval of 100ms
      expect(sleepSpy).toHaveBeenCalledWith(50);
    });

    it('should successfully fetch a page of DPE records with beforeDate', async () => {
      mockFetch.mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue({
          results: mockDpeRecords,
        }),
      } as any);

      const result = await service['fetchDpePage'](
        75,
        '2024-01-01',
        ['F', 'G'],
        1,
        1000,
        '2024-12-31',
      );

      expect(result).toEqual(mockDpeRecords);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('date_etablissement_dpe%3A%3E%3D2024-01-01'),
        expect.objectContaining({
          method: 'GET',
          signal: expect.any(AbortSignal),
        }),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('date_etablissement_dpe%3A%3C%3D2024-12-31'),
        expect.any(Object),
      );
    });
  });

  describe('fetchAllDpeRecords', () => {
    const mockDpeRecords: DpeRecord[] = Array.from({ length: 10 }, (_, i) => ({
      numero_dpe: `DPE${i}`,
      adresse_ban: `${i} Rue Test`,
      code_postal_ban: '75001',
      nom_commune_ban: 'Paris',
      code_departement_ban: '75',
      etiquette_dpe: 'F',
      etiquette_ges: 'F',
      _geopoint: '48.8566,2.3522',
      date_etablissement_dpe: '2024-01-15',
      date_reception_dpe: '2024-01-16',
      type_batiment: 'Appartement',
      annee_construction: '1950',
      surface_habitable_logement: 50,
    }));

    it('should fetch all pages of records', async () => {
      // Mock with full page size to trigger pagination
      service['fetchDpePage'] = jest
        .fn()
        .mockResolvedValueOnce(Array(1000).fill(mockDpeRecords[0]))
        .mockResolvedValueOnce(Array(500).fill(mockDpeRecords[0]));

      const result = await service.fetchAllDpeRecords(75, '2024-01-01', [
        'F',
        'G',
      ]);

      expect(result).toHaveLength(1500);
      expect(service['fetchDpePage']).toHaveBeenCalledTimes(2);
    });

    it('should fetch records with date range when beforeDate is provided', async () => {
      service['fetchDpePage'] = jest
        .fn()
        .mockResolvedValueOnce(mockDpeRecords);

      const result = await service.fetchAllDpeRecords(75, '2024-01-01', ['F', 'G'], '2024-12-31');

      expect(result).toEqual(mockDpeRecords);
      expect(service['fetchDpePage']).toHaveBeenCalledWith(
        75,
        '2024-01-01',
        ['F', 'G'],
        1,
        1000,
        '2024-12-31'
      );
    });

    it('should stop fetching when receiving less than pageSize', async () => {
      const page1 = mockDpeRecords.slice(0, 10);

      service['fetchDpePage'] = jest.fn().mockResolvedValueOnce(page1);

      const result = await service.fetchAllDpeRecords(75, '2024-01-01', ['F']);

      expect(result).toHaveLength(10);
      expect(service['fetchDpePage']).toHaveBeenCalledTimes(1);
    });

    it('should handle 400 error gracefully after fetching some records', async () => {
      service['fetchDpePage'] = jest
        .fn()
        .mockResolvedValueOnce(Array(1000).fill(mockDpeRecords[0]))
        .mockRejectedValueOnce(new Error('ADEME API returned status 400'));

      const result = await service.fetchAllDpeRecords(75, '2024-01-01', ['F']);

      expect(result).toHaveLength(1000);
      expect(service['logger'].warn).toHaveBeenCalledWith(
        expect.stringContaining('Reached API pagination limit'),
      );
    });

    it('should throw error on first page failure', async () => {
      service['fetchDpePage'] = jest
        .fn()
        .mockRejectedValue(new Error('Network error'));

      await expect(
        service.fetchAllDpeRecords(75, '2024-01-01', ['F']),
      ).rejects.toThrow('Network error');
    });

    it('should throw error on non-400 error', async () => {
      service['fetchDpePage'] = jest
        .fn()
        .mockResolvedValueOnce(Array(1000).fill(mockDpeRecords[0]))
        .mockRejectedValueOnce(new Error('Network timeout'));

      await expect(
        service.fetchAllDpeRecords(75, '2024-01-01', ['F']),
      ).rejects.toThrow('Network timeout');
    });
  });

  describe('sleep', () => {
    it('should sleep for the specified duration', async () => {
      jest.useFakeTimers();

      const sleepPromise = service['sleep'](1000);
      jest.advanceTimersByTime(1000);

      await expect(sleepPromise).resolves.toBeUndefined();

      jest.useRealTimers();
    });
  });
});
