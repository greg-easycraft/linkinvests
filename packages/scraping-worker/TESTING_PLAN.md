# Scraping Worker Testing Plan

## Overview
Comprehensive testing implementation for the scraping-worker package. Currently at **0% test coverage**.

**Target**: 80%+ overall coverage, 100% for critical business logic.

## Implementation Progress

### 📋 Test Files to Create

#### High Priority - Critical Business Logic
- [ ] `src/domains/auctions/services/detail-scraper.service.spec.ts`
- [ ] `src/domains/auctions/services/geocoding.service.spec.ts`
- [ ] `src/domains/auctions/repositories/auctions-opportunity.repository.spec.ts`

#### Medium Priority - Integration Logic
- [ ] `src/domains/auctions/services/encheres-publiques-scraper.service.spec.ts`
- [ ] `src/domains/auctions/services/listing-extractor.service.spec.ts`
- [ ] `src/domains/auctions/auctions.processor.spec.ts`

#### Lower Priority - Infrastructure
- [ ] `src/domains/auctions/services/browser.service.spec.ts`
- [ ] `src/domains/auctions/cron/auctions.cron.spec.ts`

---

## Detailed Test Scenarios

### 1. DetailScraperService Tests 🎯 **CRITICAL**

**File**: `detail-scraper.service.spec.ts`

#### Test Scenarios:
- [ ] **JSON Extraction from Page**
  - Extract __NEXT_DATA__ from valid page
  - Handle missing __NEXT_DATA__ script tag
  - Handle malformed JSON

- [ ] **Apollo GraphQL Cache Parsing**
  - Parse lot data with `example.json` structure
  - Parse lot data with `example-address.json` structure
  - Handle missing lot references
  - Handle incomplete lot data

- [ ] **Address Extraction (3 Fallback Strategies)**
  - [ ] **Strategy 1: Address Object**
    - Extract from `adresse_physique.__ref`
    - Extract from `adresse.__ref`
    - Resolve address reference in data
  - [ ] **Strategy 2: Parse from Name**
    - Extract "située à Location" patterns
    - Extract "situé à Location" patterns
    - Handle multiple separators
    - Parse city and department
  - [ ] **Strategy 3: URL Fallback**
    - Extract city from URL slug
    - Extract department code from URL
    - Handle malformed URLs

- [ ] **Title Extraction**
  - Remove "située à" suffixes
  - Remove "situé à" suffixes
  - Handle titles without location suffixes
  - Preserve other content

- [ ] **Date Extraction Priority**
  - Use `fermeture_reelle_date` (primary)
  - Fall back to `encheres_fermeture_date`
  - Fall back to `fermeture_date`
  - Convert Unix timestamps correctly

- [ ] **Batch Processing**
  - Process multiple URLs with rate limiting
  - Handle individual URL failures
  - Maintain batch size limits
  - Add delays between requests

- [ ] **Error Handling**
  - Navigation failures
  - Missing data gracefully
  - Invalid JSON structures
  - Network timeouts

### 2. GeocodingService Tests 🎯 **CRITICAL**

**File**: `geocoding.service.spec.ts`

#### Test Scenarios:
- [ ] **Address Geocoding Success**
  - Valid address returns coordinates
  - Format address correctly for API
  - Parse API response properly
  - Validate confidence scores (>= 0.5)

- [ ] **Rate Limiting (40 req/sec)**
  - Enforce 25ms minimum delay between requests
  - Track request timing accurately
  - Handle concurrent requests properly

- [ ] **API Error Handling**
  - [ ] **429 Rate Limit Responses**
    - Read retry-after header
    - Wait specified time before retry
    - Fall back to default delay if no header
  - [ ] **Network Failures**
    - Retry 3 times with exponential backoff
    - Give up after max retries
    - Log failures appropriately

- [ ] **Low Confidence Handling**
  - Reject results with confidence < 0.5
  - Return null for low confidence
  - Log confidence warnings

- [ ] **Address Formatting**
  - Format complete addresses correctly
  - Handle partial addresses
  - Clean special characters
  - Add country if missing

- [ ] **Batch Processing**
  - Process array of opportunities
  - Skip already geocoded items
  - Handle mixed success/failure
  - Maintain original order

- [ ] **Edge Cases**
  - Empty address strings
  - Null/undefined addresses
  - Very long addresses
  - International addresses

### 3. AuctionsOpportunityRepository Tests 🎯 **CRITICAL**

**File**: `auctions-opportunity.repository.spec.ts`

#### Test Scenarios:
- [ ] **Batch Insertion**
  - Insert opportunities in batches of 500
  - Handle partial batches (< 500 items)
  - Process empty arrays gracefully
  - Maintain insertion order

- [ ] **Upsert Logic**
  - Insert new opportunities
  - Update existing on conflict (externalId + type)
  - Preserve existing data on conflict
  - Handle unique constraint violations

- [ ] **Data Transformation**
  - [ ] **External ID Creation**
    - Format: "encheres-publiques-{auctionId}"
    - Handle numeric and string IDs
    - Validate ID format
  - [ ] **Date Mapping**
    - Map `auctionDate` → `opportunityDate`
    - Preserve date format and timezone
  - [ ] **Contact Data Creation**
    - Transform auction venue to contact data
    - Handle missing venue information
    - Structure contact object correctly
  - [ ] **Extra Data Handling**
    - Add URL to extraData object
    - Preserve existing extraData
    - Handle null extraData

- [ ] **Database Operations**
  - Mock database connection properly
  - Verify SQL query structure
  - Test transaction handling
  - Handle database connection failures

- [ ] **Error Handling**
  - Database constraint violations
  - Network connection issues
  - Invalid data formats
  - Null/undefined inputs

### 4. EncheresPubliquesScraperService Tests

**File**: `encheres-publiques-scraper.service.spec.ts`

#### Test Scenarios:
- [ ] **Service Orchestration**
  - Initialize browser successfully
  - Navigate to listings page
  - Handle cookie consent
  - Coordinate all sub-services
  - Return enriched opportunities

- [ ] **Error Propagation**
  - Browser initialization failures
  - Navigation failures
  - Service errors bubble up correctly
  - Cleanup on errors

- [ ] **Resource Management**
  - Browser cleanup in finally block
  - Handle cleanup failures
  - Prevent resource leaks

- [ ] **Integration Flow**
  - Call ListingExtractorService correctly
  - Pass URLs to DetailScraperService
  - Send opportunities to GeocodingService
  - Return final enriched data

### 5. ListingExtractorService Tests

**File**: `listing-extractor.service.spec.ts`

#### Test Scenarios:
- [ ] **URL Extraction**
  - Extract auction URLs from page
  - Filter out invalid URLs
  - Handle missing links
  - Validate URL format

- [ ] **Pagination with Lazy Loading**
  - Scroll to trigger lazy loading
  - Stop after 2 scrolls with no new content
  - Track content changes between scrolls
  - Respect maximum scroll limit

- [ ] **Smart Scrolling**
  - Random delays (2-3 seconds) between scrolls
  - Detect when new content loads
  - Handle infinite scroll pages
  - Stop early when no more content

- [ ] **URL Deduplication**
  - Remove duplicate URLs
  - Preserve order of first occurrence
  - Handle case-insensitive duplicates

- [ ] **Edge Cases**
  - Pages with no listings
  - Single page (no pagination)
  - Failed lazy loading
  - JavaScript disabled scenarios

### 6. AuctionsProcessor Tests

**File**: `auctions.processor.spec.ts`

#### Test Scenarios:
- [ ] **Job Processing**
  - Validate job name is "scrape-auctions"
  - Reject invalid job names
  - Process job successfully
  - Return completion status

- [ ] **Workflow Orchestration**
  - Call scraper service
  - Call geocoding service
  - Call repository for persistence
  - Collect processing statistics

- [ ] **Statistics Collection**
  - Count total opportunities found
  - Count successfully geocoded
  - Count successfully persisted
  - Log final statistics

- [ ] **Error Handling**
  - Handle scraper failures
  - Handle geocoding failures
  - Handle repository failures
  - Log errors appropriately

### 7. BrowserService Tests

**File**: `browser.service.spec.ts`

#### Test Scenarios:
- [ ] **Browser Initialization**
  - Launch Chromium browser
  - Configure stealth settings
  - Set viewport size
  - Handle launch failures

- [ ] **Page Navigation**
  - Navigate to valid URLs
  - Handle invalid URLs
  - Set navigation timeout
  - Retry on failures

- [ ] **Cookie Consent Handling**
  - Detect cookie consent modals
  - Click accept buttons
  - Handle missing modals
  - Handle multiple modal types

- [ ] **Content Waiting**
  - Wait for DOM load events
  - Handle timeout scenarios
  - Wait for specific elements
  - Custom timeout values

- [ ] **Resource Management**
  - Close browser properly
  - Handle page cleanup
  - Prevent memory leaks
  - Error cleanup

### 8. AuctionsCron Tests

**File**: `auctions.cron.spec.ts`

#### Test Scenarios:
- [ ] **Job Scheduling**
  - Enqueue scraping job correctly
  - Configure job options (retries, backoff)
  - Handle queue connection failures
  - Log job creation

- [ ] **Cron Configuration**
  - Verify schedule timing (2 AM Paris)
  - Handle timezone correctly
  - Prevent duplicate jobs

- [ ] **Error Handling**
  - Handle queue unavailable
  - Log scheduling failures
  - Graceful degradation

---

## Testing Framework Setup

### Dependencies Used
- **Jest**: v30.0.0 (Test framework)
- **@nestjs/testing**: v11.0.1 (NestJS test utilities)
- **ts-jest**: v29.2.5 (TypeScript transformer)

### Mock Strategies

#### External Dependencies
- **Playwright Browser**: Mock Page, Browser, BrowserContext objects
- **French Geocoding API**: Mock fetch responses with realistic data
- **Database Connection**: Mock Drizzle ORM operations
- **BullMQ Queue**: Mock job enqueuing and processing

#### Test Data
- Use `example.json` for opportunities without address objects
- Use `example-address.json` for opportunities with address objects
- Create additional mock data for edge cases

---

## Validation Checklist

### Test Execution
- [ ] All tests pass: `pnpm test`
- [ ] Generate coverage report: `pnpm test:cov`
- [ ] Coverage target achieved: 80%+ overall
- [ ] Critical paths: 100% coverage

### Code Quality
- [ ] TypeScript compilation: `pnpm typecheck`
- [ ] Linting compliance: `pnpm lint:fix`
- [ ] No console warnings in tests
- [ ] Proper test isolation

### Test Quality
- [ ] All test scenarios implemented
- [ ] Realistic test data used
- [ ] Edge cases covered
- [ ] Error scenarios tested
- [ ] Proper mocking strategies
- [ ] Clean test setup/teardown

---

## Success Metrics

### Coverage Targets
- **Overall Coverage**: 80%+
- **Critical Services**: 100%
  - DetailScraperService (JSON parsing, address extraction)
  - GeocodingService (rate limiting, retry logic)
  - AuctionsOpportunityRepository (database operations)

### Test Quality Metrics
- **Total Test Cases**: 100+ individual test scenarios
- **Mock Coverage**: All external dependencies mocked
- **Data Coverage**: Both example JSON files utilized
- **Error Coverage**: All error paths tested

---

## Implementation Notes

### Priority Order
1. **Week 1**: Critical business logic (DetailScraper, Geocoding, Repository)
2. **Week 2**: Integration logic (Scraper orchestration, ListingExtractor, Processor)
3. **Week 3**: Infrastructure (Browser, Cron) + validation

### Key Testing Patterns
- Mock external APIs completely
- Use provided JSON examples for realistic scenarios
- Test both success and failure paths
- Ensure proper cleanup in all tests
- Follow existing project testing conventions

---

*Last Updated: [Date will be updated as implementation progresses]*