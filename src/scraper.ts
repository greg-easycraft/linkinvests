import { chromium, Page } from 'playwright';
import { RealEstateListing, ScraperConfig } from './types.js';
import { writeListingsToCSV } from './utils/csv-writer.js';

const DEFAULT_CONFIG: ScraperConfig = {
  department: '80',
  daysBack: 7,
  headless: true,
  outputFile: 'leboncoin_listings.csv',
};

async function buildSearchUrl(department: string): Promise<string> {
  // Leboncoin URL structure for real estate (Ventes immobilières) in department 80
  const baseUrl = 'https://www.leboncoin.fr/recherche';
  const params = new URLSearchParams({
    category: '9', // Real estate category
    locations: `d_${department}`, // Department filter (d_80 for Somme)
  });
  return `${baseUrl}?${params.toString()}`;
}

async function extractListingUrls(page: Page): Promise<string[]> {
  // Wait for listings to load
  await page.waitForSelector('[data-qa-id="adlist_list"]', { timeout: 10000 });

  // Extract all listing URLs from the search results page
  const listingUrls = await page.$$eval(
    'a[data-qa-id="adlink"]',
    (links) => links.map((link) => (link as any).href)
  );

  console.log(`Found ${listingUrls.length} listings on current page`);
  return listingUrls;
}

async function extractListingDetails(page: Page, url: string): Promise<RealEstateListing | null> {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // Extract title
    const title = await page.$eval(
      '[data-qa-id="adview_title"]',
      (el) => el.textContent?.trim() || ''
    ).catch(() => '');

    // Extract price
    const price = await page.$eval(
      '[data-qa-id="adview_price"] span[data-qa-id="adview_price"]',
      (el) => el.textContent?.trim() || ''
    ).catch(() => '');

    // Extract location
    const location = await page.$eval(
      '[data-qa-id="adview_location_informations"]',
      (el) => el.textContent?.trim() || ''
    ).catch(() => '');

    // Extract description
    const description = await page.$eval(
      '[data-qa-id="adview_description_container"]',
      (el) => el.textContent?.trim() || ''
    ).catch(() => '');

    // Extract publication date
    const publicationDate = await page.$eval(
      '[data-qa-id="adview_date"]',
      (el) => el.textContent?.trim() || ''
    ).catch(() => '');

    // Extract property details from attributes section
    const attributes: Record<string, string> = {};
    const attributeElements = await page.$$('[data-qa-id="criteria_item"]');

    for (const element of attributeElements) {
      const label = await element.$eval(
        '[data-qa-id="criteria_item_label"]',
        (el) => el.textContent?.trim() || ''
      ).catch(() => '');

      const value = await element.$eval(
        '[data-qa-id="criteria_item_value"]',
        (el) => el.textContent?.trim() || ''
      ).catch(() => '');

      if (label && value) {
        attributes[label.toLowerCase()] = value;
      }
    }

    // Map attributes to our fields
    const surfaceArea = attributes['surface'] || attributes['superficie'] || '';
    const rooms = attributes['pièces'] || attributes['pieces'] || '';
    const propertyType = attributes['type de bien'] || attributes['bien'] || '';
    const energyRating = attributes['ges'] || attributes['dpe'] || '';

    // Extract seller information
    let sellerName = '';
    let sellerType = '';

    try {
      sellerName = await page.$eval(
        '[data-qa-id="adview_profile_name"]',
        (el) => el.textContent?.trim() || ''
      ).catch(() => '');

      sellerType = await page.$eval(
        '[data-qa-id="adview_professional"]',
        (el) => el.textContent?.trim() ? 'Professional' : 'Individual'
      ).catch(() => 'Individual');
    } catch {
      // Seller info might not always be available
    }

    const listing: RealEstateListing = {
      title,
      price,
      location,
      description,
      publicationDate,
      url,
      surfaceArea,
      rooms,
      propertyType,
      energyRating,
      sellerName,
      sellerType,
    };

    console.log(`✓ Extracted: ${title.substring(0, 50)}...`);
    return listing;
  } catch (error) {
    console.error(`✗ Error extracting listing from ${url}:`, error);
    return null;
  }
}

async function isWithinDateRange(
  publicationDate: string,
  daysBack: number
): Promise<boolean> {
  // Parse leboncoin date format (e.g., "Aujourd'hui", "Hier", "Il y a X jours")
  const today = new Date();
  const cutoffDate = new Date(today);
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  if (publicationDate.includes('Aujourd\'hui') || publicationDate.includes('aujourd\'hui')) {
    return true;
  }

  if (publicationDate.includes('Hier') || publicationDate.includes('hier')) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday >= cutoffDate;
  }

  const daysAgoMatch = publicationDate.match(/(\d+)\s+jour/i);
  if (daysAgoMatch) {
    const daysAgo = parseInt(daysAgoMatch[1], 10);
    return daysAgo <= daysBack;
  }

  // If we can't parse the date, include it to be safe
  return true;
}

async function scrapeAllPages(
  page: Page,
  searchUrl: string,
  config: ScraperConfig
): Promise<RealEstateListing[]> {
  const allListings: RealEstateListing[] = [];
  let currentPage = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    console.log(`\nScraping page ${currentPage}...`);

    const pageUrl = currentPage === 1 ? searchUrl : `${searchUrl}&page=${currentPage}`;
    await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 30000 });

    // Extract listing URLs from current page
    const listingUrls = await extractListingUrls(page);

    if (listingUrls.length === 0) {
      console.log('No more listings found');
      break;
    }

    // Visit each listing and extract details
    for (const url of listingUrls) {
      const listing = await extractListingDetails(page, url);

      if (listing) {
        // Check if listing is within date range
        const isRecent = await isWithinDateRange(
          listing.publicationDate,
          config.daysBack
        );

        if (isRecent) {
          allListings.push(listing);
        } else {
          console.log(`Skipping older listing: ${listing.title.substring(0, 50)}...`);
        }
      }

      // Add delay to avoid rate limiting
      await page.waitForTimeout(1000 + Math.random() * 1000);
    }

    // Check for next page
    const nextButton = await page.$('a[data-qa-id="pagination_next_page"]');
    hasNextPage = nextButton !== null;

    if (hasNextPage) {
      currentPage++;
      // Add delay between pages
      await page.waitForTimeout(2000 + Math.random() * 1000);
    }

    // Limit to first 3 pages to avoid excessive scraping
    if (currentPage > 3) {
      console.log('\nReached page limit (3 pages)');
      break;
    }
  }

  return allListings;
}

async function main() {
  const config = DEFAULT_CONFIG;

  console.log('Starting Leboncoin scraper...');
  console.log(`Configuration:
  - Department: ${config.department}
  - Days back: ${config.daysBack}
  - Output file: ${config.outputFile}
  `);

  const browser = await chromium.launch({
    headless: config.headless,
    slowMo: 100, // Slow down by 100ms to be more human-like
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'fr-FR',
  });

  const page = await context.newPage();

  try {
    const searchUrl = await buildSearchUrl(config.department);
    console.log(`Search URL: ${searchUrl}\n`);

    const listings = await scrapeAllPages(page, searchUrl, config);

    if (listings.length > 0) {
      await writeListingsToCSV(listings, config.outputFile);
      console.log(`\n✓ Scraping completed! Found ${listings.length} listings from the last ${config.daysBack} days.`);
    } else {
      console.log('\n⚠ No listings found matching the criteria.');
    }
  } catch (error) {
    console.error('Error during scraping:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
