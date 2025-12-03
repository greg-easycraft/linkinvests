# Scraping Worker

NestJS worker for web scraping real estate opportunities using Playwright.

## Features

- **Queue-based architecture**: BullMQ with single queue (SCRAPING_QUEUE)
- **Concurrency**: 1 job at a time (safe for heavy scraping operations)
- **Playwright integration**: Headless browser automation
- **Pagination support**: Automatically processes all listing pages
- **Batch processing**: Details fetched in batches of 10 with rate limiting
- **Bull Board**: Monitoring dashboard at `/queues`

## Installation

```bash
# Install dependencies
pnpm install

# Install Playwright browsers
pnpm exec playwright install chromium
```

## Environment Variables

Create a `.env` file:

```env
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/linkinvests

# Application
PORT=8081

# Bull Board
BULL_BOARD_USERNAME=admin
BULL_BOARD_PASSWORD=admin
```

## Usage

### Start the Worker

```bash
# Development mode (with hot reload)
pnpm dev

# Production mode
pnpm build
pnpm start:prod
```

### Enqueue a Scraping Job

```bash
curl -X POST http://localhost:8081/jobs/auctions \
  -H "Content-Type: application/json" \
  -d '{"departmentId": 75, "sinceDate": "2025-01-01"}'
```

**Parameters:**
- `departmentId` (required): Department code (1-95)
- `sinceDate` (optional): ISO date format YYYY-MM-DD

## Architecture

### Job Data

```typescript
interface ScrapingJobData {
  jobName: 'auctions';  // Only 'auctions' supported for now
  departmentId: number; // 1-95
  sinceDate: string;    // ISO format
}
```

### Processing Flow

1. **Initialize Browser**: Launch headless Chromium
2. **Handle Cookie Consent**: Automatically dismiss modal
3. **Extract Listings**: Scrape all listing URLs with pagination (max 10 pages)
4. **Scrape Details**: Fetch property details in batches of 10
   - Rate limiting: 2-3 seconds between requests
   - Error handling: Skip failed properties, continue with batch
5. **Insert to Database**: Batch insert into `opportunities` table (500 records per batch)
   - Type: `OpportunityType.AUCTION`
   - Status: `pending_review`
   - Idempotent: `onConflictDoNothing()`

### Services

- **BrowserService**: Browser lifecycle management
- **ListingExtractorService**: Extract listing URLs with pagination
- **DetailScraperService**: Scrape individual property details
- **EncheresPubliquesScraperService**: Orchestrator service
- **AuctionsOpportunityRepository**: Database operations

## Monitoring

Access Bull Board dashboard:
- URL: http://localhost:8081/queues
- Username: admin (or from env)
- Password: admin (or from env)

## Limitations & TODOs

### Current Limitations

1. **Geocoding**: Properties without coordinates (lat/lng) are skipped
   - TODO: Implement geocoding service for addresses

2. **Auction Dates**: Currently using placeholder dates
   - TODO: Extract real auction dates from listings/details

3. **Date Filtering**: `sinceDate` parameter not yet implemented
   - TODO: Filter listings by auction date

### Future Enhancements

- [ ] Add geocoding service (Google Maps API or similar)
- [ ] Extract auction dates from property pages
- [ ] Implement date filtering logic
- [ ] Add cron job for automatic daily scraping
- [ ] Support additional job names beyond 'auctions'
- [ ] Add image download and storage
- [ ] Implement scraping metrics and monitoring
- [ ] Add department-based filtering during listing extraction

## Development

### Run Type Check

```bash
pnpm typecheck
```

### Run Linter

```bash
pnpm lint:fix
```

### Run Tests

```bash
pnpm test
```

## Project Structure

```
src/
├── main.ts                    # Bootstrap
├── app.module.ts              # Root module
├── app.controller.ts          # HTTP endpoints
├── database/                  # Database module
├── types/                     # Global types
└── domains/
    └── auctions/
        ├── auctions.module.ts           # Domain module
        ├── auctions.processor.ts        # BullMQ processor (concurrency=1)
        ├── services/
        │   ├── browser.service.ts           # Browser management
        │   ├── listing-extractor.service.ts # URL extraction + pagination
        │   ├── detail-scraper.service.ts    # Property details
        │   └── encheres-publiques-scraper.service.ts  # Main orchestrator
        ├── repositories/
        │   └── auctions-opportunity.repository.ts  # DB operations
        └── types/
            └── auctions.types.ts        # Domain types
```

## Notes

- Concurrency is set to 1 to respect rate limiting and reduce server load
- Browser instances are properly cleaned up after each job
- Failed properties are logged but don't stop the entire job
- Database inserts are idempotent (duplicates are skipped)
