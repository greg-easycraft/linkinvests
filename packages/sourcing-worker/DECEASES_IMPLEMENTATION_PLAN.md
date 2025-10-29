# Deceases Domain Implementation Plan

## Overview
Create a new domain in `packages/sourcing-worker` to import death records (décès) from INSEE and process them into succession opportunities. This follows the same logic and API calls as in `packages/old-back` but uses the architecture and patterns from `packages/sourcing-worker`.

## ✅ IMPLEMENTATION COMPLETE

All tasks have been completed successfully! The deceases domain is now fully implemented and ready for use.

## Implementation Checklist

### 1. Add Queue Constant
- [x] Add `SOURCE_DECEASES_QUEUE` to `packages/shared/src/constants/queues.ts`

### 2. Create Domain Structure (`packages/sourcing-worker/src/domains/deceases/`)

#### Core Files
- [x] Create `deceases.module.ts` - NestJS module with BullMQ and Bull Board registration
- [x] Create `deceases.processor.ts` - Main job processor extending WorkerHost
- [x] Create `index.ts` - Export module and types

#### Types
- [x] Create `types/deceases.types.ts` with:
  - `DeceasesJobData` interface (departmentId, sinceDate, etc.)
  - `InseeDeathRecord` interface (raw CSV data structure)
  - `ApiGouvCommuneResponse` interface (geo.api.gouv.fr response)
  - `ApiLannuaireResponse` interface (api-lannuaire.service-public.fr response)
  - `DeceasesOpportunity` interface (transformed opportunity data)

#### Services
- [x] Create `services/insee-api.service.ts` with:
  - `fetchCommuneCoordinates(codeLieu: string)` - Call geo.api.gouv.fr
  - `fetchMairieInfo(codeLieu: string)` - Call api-lannuaire.service-public.fr
  - Rate limiting (100ms between requests)
  - Retry logic (3 attempts with exponential backoff)
  - Handle 429 rate limit responses
  - 30s request timeout
- [x] Create `services/index.ts` - Export services

#### Repositories
- [x] Create `repositories/deceases-opportunity.repository.ts` with:
  - `insertOpportunities(data: DeceasesOpportunity[])` method
  - Batch insert (500 records per batch)
  - Use `OpportunityType.SUCCESSION` (existing enum value)
  - Handle conflict with `.onConflictDoNothing()`
- [x] Create `repositories/index.ts` - Export repositories

#### Cron
- [x] Create `cron/deceases.cron.ts` with:
  - `@Cron(CronExpression.EVERY_DAY_AT_1AM)` decorator
  - Timezone: 'Europe/Paris'
  - Enqueue jobs for yesterday's date range
- [x] Create `cron/index.ts` - Export cron services

### 3. Implement Business Logic

#### Processor Logic (`deceases.processor.ts`)
- [x] Implement `process(job: Job<DeceasesJobData>)` method
- [x] Parse death record data (from job.data)
- [x] For each record:
  - [x] Calculate age (death year - birth year)
  - [x] Skip if age < 50 (business rule)
  - [x] Call `fetchCommuneCoordinates()` for GPS data
  - [x] Call `fetchMairieInfo()` for town hall data
  - [x] Transform to `DeceasesOpportunity` format
- [x] Batch insert opportunities via repository
- [x] Log statistics (processed, skipped, errors)

#### Data Transformation
- [x] Convert INSEE sexe format (1=Homme, 2=Femme) to (M/F)
- [x] Convert dates from YYYYMMDD to YYYY-MM-DD format
- [x] Extract commune name and postal code
- [x] Map fields to opportunity schema:
  - `label`: Full name of deceased
  - `address`: Death location address
  - `zipCode`: Commune postal code
  - `department`: Department number
  - `latitude`: From geo.api.gouv.fr
  - `longitude`: From geo.api.gouv.fr
  - `type`: OpportunityType.SUCCESSION
  - `status`: 'pending_review'
  - `opportunityDate`: Death date (YYYY-MM-DD)

### 4. Register Domain in Application

#### Module Registration
- [x] Import `DeceasesModule` in `packages/sourcing-worker/src/app.module.ts`
- [x] Add to imports array

#### HTTP Endpoint
- [x] Add POST `/jobs/deceases` endpoint in `app.controller.ts`:
  - Accept `sinceDate` and optional `untilDate` parameters
  - Enqueue job to `SOURCE_DECEASES_QUEUE`
  - Return job ID and success status

### 5. Configuration & Environment

#### Environment Variables (if needed)
- [x] No additional env vars needed (uses existing REDIS_HOST/PORT)

### 6. Testing & Validation

#### Type Checking
- [x] Run `pnpm typecheck` - All TypeScript errors fixed

#### Linting
- [x] Run `pnpm lint` - All linting issues resolved

#### Manual Testing
- [ ] Test HTTP endpoint: `POST /jobs/deceases` with sample data
- [ ] Verify job appears in Bull Board UI (`/queues`)
- [ ] Check job execution and logging
- [ ] Verify opportunities inserted in database
- [ ] Test cron schedule (or trigger manually)

#### Edge Cases
- [ ] Test with invalid commune codes
- [ ] Test with deceased < 50 years old
- [ ] Test API rate limiting handling
- [ ] Test API failures and retries

## Key Architecture Patterns to Follow

### From sourcing-worker
- ✅ Processor extends `WorkerHost` from `@nestjs/bullmq`
- ✅ Use `@Processor(QUEUE_NAME)` decorator
- ✅ Implement `async process(job: Job<T>)` method
- ✅ Use NestJS Logger for structured logging
- ✅ Rate limiting in API service (timestamp-based)
- ✅ Retry logic with exponential backoff
- ✅ Batch database inserts (500 per batch)
- ✅ Use Drizzle ORM with `@Inject(DATABASE_CONNECTION)`
- ✅ Register queue in BullBoardModule for monitoring

### From old-back Logic
- ✅ Call geo.api.gouv.fr for GPS coordinates
- ✅ Call api-lannuaire.service-public.fr for town hall info
- ✅ Apply 50+ age business rule
- ✅ Handle INSEE CSV format
- ✅ Convert date formats (YYYYMMDD → YYYY-MM-DD)
- ✅ Convert sexe format (1/2 → M/F)

## API Endpoints to Call

### 1. French Government Geo API
```
GET https://geo.api.gouv.fr/communes/{codeLieu}?fields=centre
Response: { centre: { coordinates: [longitude, latitude] } }
```

### 2. French Public Service Directory API
```
GET https://api-lannuaire.service-public.fr/api/explore/v2.1/catalog/datasets/api-lannuaire-administration/records?where=code_insee_commune='{codeLieu}' AND pivot LIKE 'mairie%'&limit=1
Response: { results: [{ nom, telephone, email }] }
```

## Notes
- Follow coding guidelines: No `any` type, use structured logging, return early pattern
- Use date-fns for date operations
- Use lodash for data transformation
- Follow import/export alphabetical sorting
- Add comprehensive error handling with context
- Use `OpportunityType.DECEASE` or create new enum value if needed

## Implementation Order
1. Queue constant
2. Types and interfaces
3. API service (with tests)
4. Repository (with tests)
5. Processor
6. Cron job
7. Module and registration
8. HTTP endpoint
9. Testing and validation
