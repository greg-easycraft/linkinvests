# Scraping Worker Implementation Plan

## Overview
Create a new NestJS package `packages/scraping-worker` following the exact architecture of `sourcing-worker`, dedicated to web scraping tasks using Playwright.

---

## Phase 1: Package Setup

### 1.1 Create Package Structure
- [ ] Create `packages/scraping-worker/` directory
- [ ] Copy `package.json` from sourcing-worker and update:
  - Name: `@linkinvests/scraping-worker`
  - Add Playwright dependencies: `playwright`, `@playwright/test`
  - Keep all NestJS and BullMQ dependencies
- [ ] Copy `tsconfig.json` from sourcing-worker
- [ ] Copy `nest-cli.json` from sourcing-worker
- [ ] Create `.env` file with:
  ```env
  REDIS_HOST=localhost
  REDIS_PORT=6379
  DATABASE_URL=postgresql://...
  PORT=8081
  ```
- [ ] Create `.gitignore`

### 1.2 Create Base Application Files
- [ ] Copy `src/main.ts` from sourcing-worker
- [ ] Copy entire `src/database/` folder from sourcing-worker
- [ ] Create `src/app.module.ts` (will be customized in Phase 2)
- [ ] Create `src/app.controller.ts` (will be customized in Phase 2)

---

## Phase 2: Queue Configuration

### 2.1 Update Shared Package
- [ ] Add to `packages/shared/src/constants/queues.ts`:
  ```typescript
  export const SCRAPING_QUEUE: string = 'SCRAPING';
  ```

### 2.2 Configure App Module
- [ ] Create `src/app.module.ts` with:
  - [ ] `ConfigModule.forRoot({ isGlobal: true })`
  - [ ] `ScheduleModule.forRoot()`
  - [ ] `DatabaseModule.forRoot()`
  - [ ] `BullModule.forRoot()` with Redis connection
  - [ ] `BullBoardModule.forRoot()` with basic auth
  - [ ] Import `AuctionsModule` (to be created)

---

## Phase 3: Job Data Types

### 3.1 Define Job Data Interface
- [ ] Create `src/types/scraping-job.types.ts`:
  ```typescript
  export interface ScrapingJobData {
    jobName: 'auctions';
    departmentId: number;
    sinceDate: string; // ISO format YYYY-MM-DD
  }
  ```

---

## Phase 4: Auctions Domain - Directory Structure

### 4.1 Create Domain Directories
- [ ] Create `src/domains/auctions/`
- [ ] Create `src/domains/auctions/repositories/`
- [ ] Create `src/domains/auctions/services/`
- [ ] Create `src/domains/auctions/types/`

### 4.2 Create Index Files
- [ ] Create `src/domains/auctions/index.ts`
- [ ] Create `src/domains/auctions/repositories/index.ts`
- [ ] Create `src/domains/auctions/services/index.ts`
- [ ] Create `src/domains/auctions/types/index.ts`

---

## Phase 5: Auctions Domain - Types

### 5.1 Create Type Definitions
- [ ] Create `src/domains/auctions/types/auctions.types.ts`:
  ```typescript
  export interface AuctionListing {
    url: string;
    auctionDate?: string;
  }

  export interface AuctionOpportunity {
    label: string;
    address: string;
    zipCode: number;
    department: number;
    latitude: number;
    longitude: number;
    price?: number;
    auctionDate: string;
    propertyType?: string;
    description?: string;
  }
  ```

---

## Phase 6: Encheres Publiques Scraper Service

### 6.1 Create Service File
- [ ] Create `src/domains/auctions/services/encheres-publiques-scraper.service.ts`

### 6.2 Implement Core Methods
- [ ] Copy browser initialization from test-app
- [ ] Implement `fetchListingUrls(departmentId?: number)`:
  - [ ] Navigate to `/ventes/immobilier`
  - [ ] Handle cookie consent (`.fc-cta-consent`)
  - [ ] Extract listing URLs from cards (`[class*="card"]`)
  - [ ] Implement pagination logic
  - [ ] Return all URLs with metadata
- [ ] Implement `fetchListingDetails(url: string)`:
  - [ ] Navigate to detail page
  - [ ] Extract all property data
  - [ ] Parse price (convert "20 000 €" to number)
  - [ ] Parse location from URL
  - [ ] Extract auction date
  - [ ] Return typed `AuctionOpportunity`
- [ ] Implement `fetchListingDetailsBatch(urls: string[], batchSize = 10)`:
  - [ ] Process URLs in batches
  - [ ] Add 2-3 second delays between requests
  - [ ] Handle errors gracefully (skip failed, continue)
  - [ ] Return successful results

### 6.3 Implement Helper Methods
- [ ] `parseLocationFromUrl(url: string)`: Extract city and department
- [ ] `parsePrice(priceString: string)`: Convert "20 000 €" to number
- [ ] `closeBrowser()`: Clean up resources

### 6.4 Add Rate Limiting & Error Handling
- [ ] Implement rate limiting (2-3 seconds between requests)
- [ ] Add retry logic (3 attempts for network errors)
- [ ] Log all errors with context
- [ ] Ensure browser cleanup in finally blocks

---

## Phase 7: Repository Implementation

### 7.1 Create Repository File
- [ ] Create `src/domains/auctions/repositories/auctions-opportunity.repository.ts`

### 7.2 Implement Repository Methods
- [ ] Inject `DATABASE_CONNECTION`
- [ ] Implement `insertOpportunities(opportunities: AuctionOpportunity[], batchSize = 500)`:
  - [ ] Map `AuctionOpportunity` to `opportunities` schema:
    - `label`: Property title
    - `siret`: null
    - `address`: Full address
    - `zipCode`: Parsed number
    - `department`: Parsed number
    - `latitude`: From opportunity data
    - `longitude`: From opportunity data
    - `type`: `OpportunityType.AUCTION`
    - `status`: `'pending_review'`
    - `opportunityDate`: Auction date
  - [ ] Batch insert (500 records at a time)
  - [ ] Use `.onConflictDoNothing()` for idempotency
  - [ ] Log progress for each batch
  - [ ] Return total inserted count

---

## Phase 8: Processor Implementation

### 8.1 Create Processor File
- [ ] Create `src/domains/auctions/auctions.processor.ts`

### 8.2 Implement Processor
- [ ] Add `@Processor(SCRAPING_QUEUE, { concurrency: 1 })` decorator
- [ ] Extend `WorkerHost`
- [ ] Inject dependencies:
  - `EncheresPubliquesScraperService`
  - `AuctionsOpportunityRepository`
- [ ] Implement `process(job: Job<ScrapingJobData>)`:
  - [ ] Validate `jobName === 'auctions'`
  - [ ] Extract `departmentId` and `sinceDate`
  - [ ] Initialize browser
  - [ ] Fetch listing URLs (with pagination)
  - [ ] Filter by `sinceDate` if provided
  - [ ] Fetch details in batches (10 at a time)
  - [ ] Transform to opportunity format
  - [ ] Insert via repository (500 per batch)
  - [ ] Log summary (total found, inserted, errors)
  - [ ] Close browser in finally block
- [ ] Add error handling with try-catch
- [ ] Throw errors to trigger BullMQ retry

---

## Phase 9: Module Configuration

### 9.1 Create Auctions Module
- [ ] Create `src/domains/auctions/auctions.module.ts`
- [ ] Configure module:
  - [ ] Register `SCRAPING_QUEUE` with `BullModule.registerQueue()`
  - [ ] Add to Bull Board with `BullBoardModule.forFeature()`
  - [ ] Declare providers:
    - `AuctionsProcessor`
    - `EncheresPubliquesScraperService`
    - `AuctionsOpportunityRepository`
  - [ ] Export `BullModule`

---

## Phase 10: HTTP Controller

### 10.1 Create Controller
- [ ] Create `src/app.controller.ts`
- [ ] Inject `SCRAPING_QUEUE`
- [ ] Implement `@Post('jobs/auctions')` endpoint:
  - [ ] Accept `departmentId` (required) and `sinceDate` (optional)
  - [ ] Validate inputs:
    - departmentId: 1-95
    - sinceDate: ISO format YYYY-MM-DD
  - [ ] Enqueue job with data:
    ```typescript
    {
      jobName: 'auctions',
      departmentId,
      sinceDate,
    }
    ```
  - [ ] Return job ID and status
  - [ ] Use `@HttpCode(HttpStatus.ACCEPTED)` (202)

---

## Phase 11: Geocoding Support

### 11.1 Add Geocoding (if needed)
- [ ] Determine if property pages include coordinates
- [ ] If not, options:
  - [ ] Copy geocoding service from sourcing-worker
  - [ ] Use Google Maps API
  - [ ] Use external geocoding service
- [ ] Implement `geocodeAddress(address: string)` method
- [ ] Add to scraper service

---

## Phase 12: Testing & Validation

### 12.1 Local Testing
- [ ] Install dependencies: `pnpm install`
- [ ] Install Playwright browsers: `pnpm exec playwright install chromium`
- [ ] Run type check: `pnpm typecheck`
- [ ] Run linter: `pnpm lint:fix`
- [ ] Start worker: `pnpm dev`
- [ ] Access Bull Board: http://localhost:8081/queues

### 12.2 Integration Testing
- [ ] Test with small department (e.g., department 75 - Paris)
- [ ] POST to `/jobs/auctions` endpoint
- [ ] Monitor job in Bull Board
- [ ] Verify database inserts in `opportunities` table
- [ ] Check logs for errors
- [ ] Verify no memory leaks (browser cleanup)

### 12.3 Error Scenarios
- [ ] Test with invalid department ID
- [ ] Test with invalid date format
- [ ] Test with network errors (simulate)
- [ ] Test with missing pages (404s)
- [ ] Verify retry logic works
- [ ] Verify browser cleanup on errors

---

## Phase 13: Documentation

### 13.1 Create Documentation
- [ ] Create `packages/scraping-worker/README.md`:
  - Package overview
  - Installation instructions
  - Environment variables
  - API endpoints
  - Job data format
  - Development guide
- [ ] Update root monorepo README if needed

---

## Phase 14: Code Quality

### 14.1 Follow Project Guidelines
- [ ] No `any` types (use proper TypeScript types)
- [ ] Use OperationResult pattern where applicable
- [ ] Structured logging with context
- [ ] Return early pattern
- [ ] Proper error handling
- [ ] Alphabetical imports

### 14.2 Run Quality Checks
- [ ] `pnpm typecheck` - no errors
- [ ] `pnpm lint:fix` - no errors
- [ ] All imports sorted alphabetically
- [ ] No `any` types in codebase

---

## Completion Checklist

### Package Structure
- [ ] Package directory created
- [ ] Dependencies installed
- [ ] TypeScript configured
- [ ] NestJS configured

### Queue System
- [ ] Queue constant added to shared package
- [ ] Queue registered in app.module
- [ ] Bull Board configured
- [ ] Concurrency set to 1

### Auctions Domain
- [ ] Domain module created
- [ ] Processor implemented (concurrency=1)
- [ ] Scraper service implemented
- [ ] Repository implemented
- [ ] Types defined

### Scraper Features
- [ ] Cookie consent handling
- [ ] Pagination implemented
- [ ] Listing URL extraction
- [ ] Detail page extraction
- [ ] Rate limiting (2-3s delays)
- [ ] Batch processing (10 URLs)
- [ ] Error handling & retries
- [ ] Browser cleanup

### Database Integration
- [ ] Repository inserts to opportunities table
- [ ] Batch inserts (500 records)
- [ ] Idempotent inserts (onConflictDoNothing)
- [ ] Proper type mapping (OpportunityType.AUCTION)

### HTTP API
- [ ] POST endpoint created
- [ ] Input validation
- [ ] Job enqueueing
- [ ] Response with job ID

### Testing
- [ ] Local testing completed
- [ ] Integration testing completed
- [ ] Error scenarios tested
- [ ] Bull Board monitoring verified
- [ ] Database inserts verified

### Documentation
- [ ] README created
- [ ] API documented
- [ ] Development guide written

### Code Quality
- [ ] Type checking passes
- [ ] Linting passes
- [ ] No `any` types
- [ ] Follows project guidelines
- [ ] Proper error handling
- [ ] Structured logging

---

## Notes

### Key Decisions
- **Concurrency**: 1 (Playwright is resource-intensive, rate limiting required)
- **Batch Sizes**: 10 URLs for details, 500 records for DB inserts
- **Rate Limiting**: 2-3 seconds between detail page requests
- **Error Handling**: Skip individual failures, log and continue
- **Idempotency**: Use `onConflictDoNothing()` for duplicate prevention

### Dependencies to Review
- Geocoding: Determine if needed and implementation approach
- Image storage: Optional, can be added later
- Additional data fields: May need schema updates

### Future Enhancements
- [ ] Add cron job for automatic daily scraping
- [ ] Support additional job names (beyond 'auctions')
- [ ] Add scraping metrics and monitoring
- [ ] Implement scraping result caching
- [ ] Add webhook notifications for job completion
- [ ] Support filtering by property type
- [ ] Add image download and storage

---

## Estimated Effort

- **Files to Create**: ~15-20 files
- **Lines of Code**: ~1,500-2,000 lines
- **Time Estimate**: 4-6 hours for complete implementation
- **Testing Time**: 1-2 hours

---

## Progress Tracking

**Started**: [Date]
**Completed**: [Date]
**Status**: Not Started

### Current Phase:
### Completed Phases:
### Blocked Items:
