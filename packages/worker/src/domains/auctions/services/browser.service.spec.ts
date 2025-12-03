import { Test, TestingModule } from '@nestjs/testing';
import { BrowserService } from './browser.service';
import type { Browser, BrowserContext, Page } from 'playwright';

// Mock playwright
jest.mock('playwright', () => ({
  chromium: {
    launch: jest.fn(),
  },
}));

describe('BrowserService', () => {
  let service: BrowserService;
  let mockBrowser: jest.Mocked<Browser>;
  let mockContext: jest.Mocked<BrowserContext>;
  let mockPage: jest.Mocked<Page>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BrowserService],
    }).compile();

    service = module.get<BrowserService>(BrowserService);

    // Create mock objects
    mockPage = {
      goto: jest.fn(),
      waitForLoadState: jest.fn(),
      locator: jest.fn(),
      waitForSelector: jest.fn(),
      waitForTimeout: jest.fn(),
      close: jest.fn(),
    } as any;

    mockContext = {
      newPage: jest.fn(),
      close: jest.fn(),
    } as any;

    mockBrowser = {
      newContext: jest.fn(),
      close: jest.fn(),
    } as any;

    // Setup default mock behavior
    const mockResponse = {
      status: jest.fn().mockReturnValue(200),
    };

    mockBrowser.newContext.mockResolvedValue(mockContext);
    mockContext.newPage.mockResolvedValue(mockPage);
    mockPage.goto.mockResolvedValue(mockResponse as any);
    mockPage.waitForLoadState.mockResolvedValue(undefined);

    // Import and setup the mocked playwright
    const { chromium } = require('playwright');
    chromium.launch.mockResolvedValue(mockBrowser);

    // Suppress logger
    jest.spyOn(service['logger'], 'log').mockImplementation();
    jest.spyOn(service['logger'], 'warn').mockImplementation();
    jest.spyOn(service['logger'], 'error').mockImplementation();
    jest.spyOn(service['logger'], 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('initialize', () => {
    it('should initialize browser successfully', async () => {
      await service.initialize();

      const { chromium } = require('playwright');
      expect(chromium.launch).toHaveBeenCalledWith({
        headless: true,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--disable-dev-shm-usage',
          '--no-sandbox',
        ],
      });

      expect(mockBrowser.newContext).toHaveBeenCalledWith({
        viewport: { width: 1920, height: 1080 },
        userAgent: expect.stringContaining('Mozilla/5.0'),
      });

      expect(mockContext.newPage).toHaveBeenCalledTimes(1);
      expect(service['logger'].log).toHaveBeenCalledWith(
        'Browser initialized successfully'
      );
    });
  });

  describe('navigateToUrl', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should navigate to URL successfully', async () => {
      const testUrl = 'https://encheres-publiques.fr/test';

      await service.navigateToUrl(testUrl);

      expect(mockPage.goto).toHaveBeenCalledWith(testUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
      expect(service['logger'].log).toHaveBeenCalledWith(
        { url: testUrl },
        'Navigating to URL'
      );
    });

    it('should throw error if browser not initialized', async () => {
      const uninitializedService = new BrowserService();

      await expect(
        uninitializedService.navigateToUrl('https://test.com')
      ).rejects.toThrow('Browser not initialized');
    });
  });

  describe('handleCookieConsent', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should handle cookie consent when modal is present', async () => {
      const mockLocator = {
        first: jest.fn().mockReturnThis(),
        click: jest.fn(),
        isVisible: jest.fn().mockResolvedValue(true),
      };
      mockPage.locator.mockReturnValue(mockLocator as any);
      mockPage.waitForSelector.mockResolvedValue({} as any);

      await service.handleCookieConsent();

      expect(mockPage.waitForSelector).toHaveBeenCalledWith(
        '.fc-consent-root',
        { timeout: 3000 }
      );
      expect(mockPage.locator).toHaveBeenCalledWith('.fc-cta-consent');
      expect(mockLocator.click).toHaveBeenCalled();
    });

    it('should throw error if browser not initialized', async () => {
      const uninitializedService = new BrowserService();

      await expect(uninitializedService.handleCookieConsent()).rejects.toThrow(
        'Browser not initialized'
      );
    });
  });

  describe('waitForContent', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should wait for content with default timeout', async () => {
      await service.waitForContent();

      expect(mockPage.waitForLoadState).toHaveBeenCalledWith(
        'domcontentloaded',
        {
          timeout: 5000,
        }
      );
    });

    it('should wait for content with custom timeout', async () => {
      await service.waitForContent(10000);

      expect(mockPage.waitForLoadState).toHaveBeenCalledWith(
        'domcontentloaded',
        {
          timeout: 10000,
        }
      );
    });

    it('should throw error if browser not initialized', async () => {
      const uninitializedService = new BrowserService();

      await expect(uninitializedService.waitForContent()).rejects.toThrow(
        'Browser not initialized'
      );
    });
  });

  describe('getPage', () => {
    it('should return page when browser is initialized', async () => {
      await service.initialize();

      const page = service.getPage();

      expect(page).toBe(mockPage);
    });

    it('should throw error if browser not initialized', () => {
      expect(() => service.getPage()).toThrow('Browser not initialized');
    });
  });

  describe('delay', () => {
    it('should delay for specified milliseconds', async () => {
      jest.spyOn(global, 'setTimeout');

      await service.delay(1000);

      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);
    });
  });

  describe('close', () => {
    it('should close browser when initialized', async () => {
      await service.initialize();

      await service.close();

      expect(mockBrowser.close).toHaveBeenCalledTimes(1);
      expect(service['logger'].log).toHaveBeenCalledWith('Closing browser');
    });

    it('should handle close when not initialized', async () => {
      await service.close();

      // Should not throw and not call browser.close
      expect(mockBrowser.close).not.toHaveBeenCalled();
    });
  });
});
