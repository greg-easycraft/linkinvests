import { Injectable, Logger } from '@nestjs/common';
import { chromium, type Browser, type Page } from 'playwright';

@Injectable()
export class BrowserService {
  private readonly logger = new Logger(BrowserService.name);
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    this.logger.log('Launching browser');

    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-sandbox',
      ],
    });

    const context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    this.page = await context.newPage();
    this.logger.log('Browser initialized successfully');
  }

  async navigateToUrl(url: string): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    this.logger.log({ url }, 'Navigating to URL');

    const response = await this.page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    if (!response) {
      throw new Error('Failed to navigate to URL');
    }

    if (response.status() !== 200) {
      throw new Error(`Navigation failed with status: ${response.status()}`);
    }

    this.logger.debug({ url, status: response.status() }, 'Navigation successful');
  }

  async handleCookieConsent(): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    try {
      this.logger.debug('Looking for cookie consent modal');
      await this.page.waitForSelector('.fc-consent-root', { timeout: 3000 });

      const cookieButton = await this.page.locator('.fc-cta-consent').first();
      if (await cookieButton.isVisible({ timeout: 2000 })) {
        await cookieButton.click();
        this.logger.log('Closed cookie consent modal');
        await this.page.waitForTimeout(1000); // Wait for modal animation
      }
    } catch (error: unknown) {
      this.logger.debug('No cookie modal found or already closed');
    }
  }

  async waitForContent(timeout: number = 5000): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    await this.page.waitForLoadState('domcontentloaded', { timeout }).catch(() => {
      this.logger.debug('DOM content loaded timeout - proceeding anyway');
    });
  }

  getPage(): Page {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }
    return this.page;
  }

  async close(): Promise<void> {
    if (this.browser) {
      this.logger.log('Closing browser');
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  async delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
