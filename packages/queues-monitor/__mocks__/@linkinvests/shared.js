// Jest mock for @linkinvests/shared package

// Queue constants that are imported in the test files
export const SCRAPING_QUEUE = 'scraping-queue-test';
export const SOURCE_COMPANY_BUILDINGS_QUEUE = 'source-company-buildings-queue-test';
export const INGEST_DECEASES_CSV_QUEUE = 'ingest-deceases-csv-queue-test';
export const SOURCE_ENERGY_SIEVES_QUEUE = 'source-energy-sieves-queue-test';
export const SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE = 'source-failing-companies-requested-queue-test';
export const SOURCE_LISTINGS_QUEUE = 'source-listings-queue-test';

// If there are other exports from the shared package, they can be added here
// The actual implementation doesn't matter for the tests since we're mocking the functionality