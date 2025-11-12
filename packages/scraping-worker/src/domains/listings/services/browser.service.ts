import { Injectable, Logger } from '@nestjs/common';
import { chromium, type Browser, type Page } from 'playwright';

@Injectable()
export class BrowserService {
  private readonly logger = new Logger(BrowserService.name);
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    this.logger.log('Launching browser for notary listings scraping');

    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
      ],
    });

    const context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'fr-FR',
      timezoneId: 'Europe/Paris',
      extraHTTPHeaders: {
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
      },
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

    this.logger.debug(
      { url, status: response.status() },
      'Navigation successful'
    );
  }

  async handleTarteaucitronCookieConsent(): Promise<boolean> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    await this.page.waitForLoadState('domcontentloaded', { timeout: 5000 });
    this.logger.debug('Looking for tarteaucitron cookie consent modal');

    try {
      // Wait for the specific tarteaucitron button to appear
      const cookieButton = this.page.getByText(/.*Tout.*refuser.*/i);

      await cookieButton.click();

      this.logger.log('cookieButton found & clicked');
      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      this.logger.debug(
        'No tarteaucitron cookie modal found or already handled'
      );
      // Don't throw error as cookie modal might not always be present
    }

    try {
      // Wait for the specific tarteaucitron button to appear
      const cookieButton = this.page.getByText(/.*Deny.*all.*/i);

      await cookieButton.click();

      this.logger.log('cookieButton found & clicked');
      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      this.logger.debug(
        'No tarteaucitron cookie modal found or already handled'
      );
      // Don't throw error as cookie modal might not always be present
    }

    try {
      // Wait for the specific tarteaucitron button to appear
      const cookieButton = await this.page.waitForSelector(
        '#tarteaucitronAllDenied2',
        { timeout: 1500 }
      );

      await cookieButton.click();

      this.logger.log('cookieButton found & clicked');
      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      this.logger.debug(
        'No tarteaucitron cookie modal found or already handled'
      );
      // Don't throw error as cookie modal might not always be present
    }
    return false;
  }

  async waitForContent(timeout: number = 5000): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    await this.page
      .waitForLoadState('domcontentloaded', { timeout })
      .catch(() => {
        this.logger.debug('DOM content loaded timeout - proceeding anyway');
      });
  }

  async scrollToBottom(): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    await this.page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    // Wait for potential lazy loading
    await this.page.waitForTimeout(2000);
  }

  async clickLoadMoreButton(selector: string): Promise<boolean> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    try {
      const button = this.page.locator(selector);

      if (await button.isVisible({ timeout: 3000 })) {
        await button.click();
        this.logger.debug('Clicked "Load More" button');
        await this.page.waitForTimeout(3000); // Wait for new content
        return true;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      this.logger.debug('No "Load More" button found or not clickable');
    }

    return false;
  }

  async extractPageContent(): Promise<string> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    return await this.page.content();
  }

  async getPageTitle(): Promise<string> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }
    return await this.page.title();
  }

  getPageUrl(): string {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }
    return this.page.url();
  }

  async takeScreenshot(path?: string): Promise<Buffer> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    const screenshot = await this.page.screenshot({
      fullPage: true,
      path: path,
    });

    if (path) {
      this.logger.debug({ path }, 'Screenshot saved');
    }

    return screenshot;
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
