# Listings Domain Implementation Plan

## Overview
Create a comprehensive listings domain in the scraping-worker package for scraping French notary real estate website (`immobilier.notaires.fr`), following the established auctions domain architecture patterns.

## Target Website
- **Main URL**: `https://www.immobilier.notaires.fr/fr/annonces-immobilieres-liste?typeBien=APP,MAI&typeTransaction=VENTE,VNI,VAE`
- **Cookie System**: tarteaucitron (button: `#tarteaucitronPersonalize2`)
- **Expected Content**: Property listings with pagination, individual detail pages

## Phase 1: Analysis & Setup
### ✅ 1.1 Architecture Analysis
- [x] Explored auctions domain structure and patterns
- [x] Understood service layer architecture and dependencies
- [x] Analyzed repository pattern and database integration
- [x] Reviewed type system and data flow

### ⏳ 1.2 Current State Analysis
- [ ] Examine current RealEstateListing type in `packages/shared/src/types/`
- [ ] Review database schema in `packages/db/`
- [ ] Understand current opportunity types and structure
- [ ] Analyze integration points in main app module

## Phase 2: Domain Structure Creation
### 2.1 Directory Structure
Create `packages/scraping-worker/src/domains/listings/` with:
- [ ] `listings.module.ts` - NestJS module configuration
- [ ] `index.ts` - Public exports
- [ ] `types/listings.types.ts` - Domain-specific types
- [ ] `services/` directory for all service classes
- [ ] `repositories/` directory for data access
- [ ] `cron/` directory for scheduled jobs
- [ ] `constants/` directory if needed
- [ ] `schemas/` directory for validation schemas

### 2.2 Type Definitions
- [ ] Create `RawListingOpportunity` (before geocoding)
- [ ] Create `ListingOpportunity` (after geocoding)
- [ ] Update `RealEstateListing` in shared package with notary-specific fields
- [ ] Define pagination and extraction types

## Phase 3: Service Layer Implementation
### 3.1 Browser Management
- [ ] Create `BrowserService` or adapt from auctions
- [ ] Implement tarteaucitron cookie consent handling
- [ ] Add French locale support
- [ ] Include screenshot capabilities for debugging

### 3.2 Main Orchestration Service
Create `ListingsScrapingService`:
- [ ] Receive and process BullMQ jobs
- [ ] Orchestrate the complete scraping workflow
- [ ] Collect quality metrics and statistics
- [ ] Handle error scenarios and logging
- [ ] Call repository for data persistence

### 3.3 Site-Specific Scraper
Create `NotaryScraperService`:
- [ ] Initialize browser and navigate to target URL
- [ ] Handle cookie consent automatically
- [ ] Coordinate listing extraction and detail scraping
- [ ] Manage batch processing and rate limiting
- [ ] Integrate with geocoding service
- [ ] Return processed opportunities

### 3.4 Listing Extraction
Create `ListingExtractorService`:
- [ ] Navigate to listings page
- [ ] Detect pagination type (infinite scroll vs page numbers)
- [ ] Extract all listing URLs from all pages
- [ ] Handle "Load More" buttons or page navigation
- [ ] Deduplicate URLs using Set
- [ ] Log progress and statistics

### 3.5 Detail Page Scraping
Create `DetailScraperService`:
- [ ] Navigate to individual listing pages
- [ ] Analyze HTML structure to determine extraction method
- [ ] Extract comprehensive property information:
  - [ ] Basic info (title, price, type, transaction type)
  - [ ] Property details (size, rooms, energy rating)
  - [ ] Description and features
  - [ ] Location and address
  - [ ] Contact information (notary office)
  - [ ] Images and photos
  - [ ] Legal information
- [ ] Handle missing or malformed data gracefully
- [ ] Implement rate limiting between requests

### 3.6 Geocoding Integration
- [ ] Create `ListingsGeocodingService` or reuse from auctions
- [ ] Integrate with French government API
- [ ] Handle rate limits and retry logic
- [ ] Process addresses in batches
- [ ] Validate coordinate accuracy

## Phase 4: Data Layer Implementation
### 4.1 Database Schema
Update `packages/db/`:
- [ ] Create or extend `opportunityListings` table schema
- [ ] Add indexes for performance (department, date, location)
- [ ] Include JSONB fields for complex data (notary contact)
- [ ] Handle array fields for images
- [ ] Add proper foreign key relationships

### 4.2 Repository Implementation
Create `ListingsOpportunityRepository`:
- [ ] Implement abstract repository pattern
- [ ] Add batch insertion capabilities
- [ ] Handle conflict resolution (duplicate external IDs)
- [ ] Map scraped data to database schema
- [ ] Generate external IDs (e.g., "notary-{id}")

### 4.3 Type Updates
In `packages/shared/src/types/`:
- [ ] Extend or create listing-specific types
- [ ] Add notary-specific fields to RealEstateListing
- [ ] Ensure compatibility with existing frontend

## Phase 5: Integration & Automation
### 5.1 Module Registration
- [ ] Create comprehensive `listings.module.ts`
- [ ] Register all services with dependency injection
- [ ] Configure BullMQ queue integration
- [ ] Export necessary providers

### 5.2 Cron Job Implementation
Create `ListingsCron`:
- [ ] Schedule daily scraping (e.g., 3AM to avoid auctions)
- [ ] Add job to BullMQ queue with proper configuration
- [ ] Handle job options (retries, backoff, retention)
- [ ] Include comprehensive logging

### 5.3 Processor Integration
Update `scraping.processor.ts`:
- [ ] Add 'listings' job type handling
- [ ] Route to ListingsScrapingService
- [ ] Maintain single concurrency for stability
- [ ] Add proper error handling

### 5.4 App Module Integration
Update main `app.module.ts`:
- [ ] Import ListingsModule
- [ ] Ensure proper initialization order
- [ ] Verify no circular dependencies

## Phase 6: Testing & Validation
### 6.1 Unit Testing
- [ ] Test each service independently with mocks
- [ ] Test repository data transformations
- [ ] Test error scenarios and edge cases
- [ ] Ensure proper cleanup in all services

### 6.2 Integration Testing
- [ ] Test end-to-end scraping workflow
- [ ] Verify database operations
- [ ] Test BullMQ job processing
- [ ] Validate geocoding integration

### 6.3 Live Testing
- [ ] Run against actual notary website
- [ ] Verify cookie consent handling
- [ ] Test pagination and URL extraction
- [ ] Validate data quality and completeness
- [ ] Monitor performance and memory usage

### 6.4 Code Quality
- [ ] Run TypeScript type checking
- [ ] Fix all linting issues
- [ ] Ensure no `any` types used
- [ ] Follow established coding patterns

## Phase 7: Documentation & Deployment
### 7.1 Documentation
- [ ] Update README with listings domain information
- [ ] Document API interfaces and data flow
- [ ] Create troubleshooting guide
- [ ] Document configuration options

### 7.2 Deployment Preparation
- [ ] Verify all dependencies are properly declared
- [ ] Test Docker build if applicable
- [ ] Ensure environment variables are documented
- [ ] Validate production configuration

## Success Criteria
- ✅ Successfully extract property listings from notary website
- ✅ Handle cookie consent automatically
- ✅ Extract comprehensive property details from individual pages
- ✅ Store data in database following established patterns
- ✅ Integrate with existing scraping infrastructure
- ✅ Maintain code quality and type safety
- ✅ Pass all tests and validation checks

## Risk Mitigation
- **Website Changes**: Implement robust selectors and fallback strategies
- **Rate Limiting**: Respect website limits with appropriate delays
- **Data Quality**: Validate extracted data and handle missing fields
- **Performance**: Monitor memory usage and optimize for large datasets
- **Legal Compliance**: Ensure respectful scraping practices

## Estimated Timeline
- **Phase 1-2**: 1-2 days (analysis and setup)
- **Phase 3**: 3-4 days (core service implementation)
- **Phase 4**: 1-2 days (data layer)
- **Phase 5**: 1 day (integration)
- **Phase 6**: 2-3 days (testing and validation)
- **Phase 7**: 1 day (documentation)

**Total Estimated Time**: 9-13 days

## Next Steps
1. Start with Phase 1.2: Analyze current types and database schema
2. Proceed sequentially through phases
3. Update this plan as implementation progresses
4. Document any deviations or additional requirements discovered

---
**Created**: November 12, 2025
**Status**: In Progress
**Last Updated**: November 12, 2025