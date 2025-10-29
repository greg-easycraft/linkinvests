# Auction Scraper Enhancement - Implementation Plan

## Overview
Enhance the auction scraper with image storage, AI-powered property extraction, improved lazy loading, and daily automated scraping for all French departments.

## Status: Planning Phase
Last Updated: 2025-10-29

---

## Phase 1: Database Schema Updates ⏳

### Objectives
- Add new fields to support property details, pricing, venue info, and images
- Create Drizzle migration

### Tasks
- [ ] Add new columns to `opportunity` table:
  - `price` (numeric, nullable)
  - `property_type` (text, nullable) - e.g., "Maison", "Appartement"
  - `description` (text, nullable)
  - `square_footage` (numeric, nullable)
  - `auction_venue` (text, nullable) - where the auction takes place
  - `images` (text[], nullable) - array of S3 URLs
- [ ] Create Drizzle migration file in `/packages/db/src/migrations/`
- [ ] Test migration locally
- [ ] Update TypeScript types in domain.schema.ts

### Files to Modify
- `/packages/db/src/schema/domain.schema.ts`
- `/packages/db/src/migrations/[timestamp]_add_auction_details.ts` (new)

### Estimated Time: 1 hour

---

## Phase 2: S3 Image Storage Setup ⏳

### Objectives
- Copy S3 storage implementation from sourcing-worker
- Configure for auction images (main image only)
- Set up proper S3 key structure

### Tasks
- [ ] Create `/packages/scraping-worker/src/storage/` directory
- [ ] Copy `s3.service.ts` from sourcing-worker
- [ ] Create `storage.module.ts` with S3Service provider
- [ ] Add @aws-sdk/client-s3 dependency: `pnpm add @aws-sdk/client-s3`
- [ ] Import StorageModule in app.module.ts
- [ ] Add environment variables to `.env`:
  - AWS_REGION
  - AWS_S3_BUCKET
  - AWS_ACCESS_KEY_ID
  - AWS_SECRET_ACCESS_KEY
- [ ] Test S3 connection and upload

### Key Structure
```
auctions/dept-{departmentId}/{auctionId}/main-image.jpg
```

### Files to Create/Modify
- `/packages/scraping-worker/src/storage/s3.service.ts` (new)
- `/packages/scraping-worker/src/storage/storage.module.ts` (new)
- `/packages/scraping-worker/src/app.module.ts` (modify)
- `/packages/scraping-worker/.env` (modify)
- `/packages/scraping-worker/package.json` (add dependency)

### Estimated Time: 1.5 hours

---

## Phase 3: AI-Powered Property Extraction ⏳

### Objectives
- Use OpenAI API (direct, not Genkit) to extract property details from auction text
- Extract: square footage, full address, auction venue location

### Tasks
- [ ] Add openai package: `pnpm add openai`
- [ ] Create `/packages/scraping-worker/src/domains/auctions/services/ai-extraction.service.ts`
- [ ] Implement extraction method with GPT-4 prompt
- [ ] Handle cases where data is missing or unclear
- [ ] Add retry logic for API failures
- [ ] Add OPENAI_API_KEY to `.env`
- [ ] Integrate with detail-scraper.service.ts
- [ ] Add logging for extraction results

### AI Prompt Strategy
```
Extract the following from this French auction description:
1. Square footage (surface) in m²
2. Complete property address
3. Auction venue (where the auction takes place)

Return JSON format. If information is missing, return null.
```

### Files to Create/Modify
- `/packages/scraping-worker/src/domains/auctions/services/ai-extraction.service.ts` (new)
- `/packages/scraping-worker/src/domains/auctions/services/detail-scraper.service.ts` (modify)
- `/packages/scraping-worker/src/domains/auctions/auctions.module.ts` (modify)
- `/packages/scraping-worker/.env` (modify)
- `/packages/scraping-worker/package.json` (add dependency)

### Estimated Time: 2 hours

---

## Phase 4: Enhanced Lazy Loading ⏳

### Objectives
- Increase scroll limit to capture all available listings
- Keep smart stopping logic (no new content after 2 scrolls)

### Tasks
- [ ] Update `extractAllListingsWithPagination` method
- [ ] Change maxScrolls default from 10 to 50
- [ ] Keep existing smart stopping logic (2 consecutive empty scrolls)
- [ ] Add more detailed logging per scroll
- [ ] Test with different departments to verify all listings captured

### Files to Modify
- `/packages/scraping-worker/src/domains/auctions/services/listing-extractor.service.ts`
- `/packages/scraping-worker/src/domains/auctions/services/encheres-publiques-scraper.service.ts` (update maxScrolls call)

### Estimated Time: 30 minutes

---

## Phase 5: Daily Cron Job (All Departments) ⏳

### Objectives
- Schedule daily scraping at 2 AM Paris time
- Create 95 separate jobs (one per department)
- Handle failures gracefully

### Tasks
- [ ] Create `/packages/scraping-worker/src/domains/auctions/cron/auctions.cron.ts`
- [ ] Implement @Cron decorator with CronExpression.EVERY_DAY_AT_2AM
- [ ] Set timezone to 'Europe/Paris'
- [ ] Loop through departments 1-95 and enqueue jobs
- [ ] Add error handling to continue on individual job failures
- [ ] Register cron in auctions.module.ts
- [ ] Test cron scheduling (use @Cron('*/5 * * * * *') for testing)
- [ ] Add logging for cron execution

### Files to Create/Modify
- `/packages/scraping-worker/src/domains/auctions/cron/auctions.cron.ts` (new)
- `/packages/scraping-worker/src/domains/auctions/auctions.module.ts` (modify)

### Estimated Time: 1 hour

---

## Phase 6: Repository & Processor Updates ⏳

### Objectives
- Update repository to handle new fields
- Integrate image upload in scraping flow
- Integrate AI extraction in scraping flow
- Update processor logging

### Tasks
- [ ] Update `AuctionOpportunity` type in types.ts with new fields
- [ ] Update `insertOpportunities` method in repository to handle new columns
- [ ] Modify detail-scraper to:
  - Download main image from listing
  - Upload to S3
  - Call AI extraction service
  - Include S3 URL and AI results in opportunity object
- [ ] Update processor logging to show:
  - Images uploaded count
  - AI extractions successful count
  - Failed geocoding count
- [ ] Handle graceful degradation (continue if image upload or AI fails)

### Files to Modify
- `/packages/scraping-worker/src/domains/auctions/types/auction.types.ts`
- `/packages/scraping-worker/src/domains/auctions/repositories/auctions-opportunity.repository.ts`
- `/packages/scraping-worker/src/domains/auctions/services/detail-scraper.service.ts`
- `/packages/scraping-worker/src/domains/auctions/auctions.processor.ts`

### Estimated Time: 2 hours

---

## Testing Plan

### Unit Tests
- [ ] Test AI extraction service with sample auction descriptions
- [ ] Test S3 upload with mock files
- [ ] Test enhanced lazy loading logic
- [ ] Test cron job scheduling (mock BullMQ queue)

### Integration Tests
- [ ] Test full scraping flow with new fields
- [ ] Test database insertion with new columns
- [ ] Test S3 upload and URL generation
- [ ] Verify AI extraction results quality

### Manual Testing
- [ ] Run scraper for single department (e.g., Paris - 75)
- [ ] Verify all new fields populated in database
- [ ] Check S3 bucket for uploaded images
- [ ] Verify AI-extracted data quality
- [ ] Test cron with short interval (every 5 minutes)
- [ ] Monitor Bull Board for job success rates

### Commands
```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint:fix

# Run tests
pnpm test

# Manual test run
# 1. Start worker: pnpm dev
# 2. Enqueue job via Bull Board or API
# 3. Monitor logs
```

---

## Environment Variables Required

Add to `/packages/scraping-worker/.env`:
```env
# S3 Configuration
AWS_REGION=eu-west-3
AWS_S3_BUCKET=linkinvest-auctions
AWS_ACCESS_KEY_ID=your_key_here
AWS_SECRET_ACCESS_KEY=your_secret_here

# OpenAI Configuration
OPENAI_API_KEY=sk-...
```

---

## Success Metrics

### Performance
- ✅ All listings captured (smart stopping works correctly)
- ✅ Scraping completes within reasonable time (<10 min per department)
- ✅ Cron successfully runs daily for all 95 departments

### Data Quality
- ✅ >90% of opportunities have main image uploaded
- ✅ >80% of opportunities have AI-extracted fields populated
- ✅ Geocoding success rate maintained (currently ~16/16)
- ✅ No duplicate opportunities created

### Reliability
- ✅ Failed jobs retry successfully (BullMQ)
- ✅ Cron continues even if individual department jobs fail
- ✅ Browser cleanup happens even on errors

---

## Known Issues & Considerations

### Current Issues
1. ✅ Fixed: Pagination logic replaced with lazy loading (completed)
2. ✅ Fixed: URL structure updated to use department names (completed)

### New Considerations
1. **Rate Limiting**: OpenAI API has rate limits - may need to batch or throttle
2. **S3 Costs**: Monitor storage costs for images
3. **AI Extraction Quality**: May need prompt tuning based on actual results
4. **Geocoding Failures**: Some addresses may still fail - consider fallback strategies
5. **Large Departments**: Paris, Lyon may have many listings - monitor scraping time

---

## Rollback Plan

If issues arise:
1. Keep existing scraper running (no changes to current flow)
2. New fields are nullable - won't break existing data
3. Can disable cron by commenting out @Cron decorator
4. Can disable AI/S3 by skipping those service calls

---

## Next Steps

1. ✅ Review this plan with stakeholders
2. ⏳ Execute Phase 1: Database Schema Updates
3. Continue through phases sequentially
4. Test thoroughly after each phase
5. Deploy to production after all phases complete

---

## Progress Tracking

**Completed Phases:** 0/6
**Current Phase:** Planning
**Blockers:** None
**Start Date:** 2025-10-29
**Target Completion:** TBD
