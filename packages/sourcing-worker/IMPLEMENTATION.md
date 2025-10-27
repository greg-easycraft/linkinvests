# BullMQ Integration Implementation Plan

## Overview
Implement BullMQ-based job queue system with Drizzle ORM database integration for the sourcing worker service.

---

## Implementation Checklist

### 1. Install Dependencies
- [ ] Add `bullmq` to package.json
- [ ] Add `ioredis` to package.json
- [ ] Add `@bull-board/api` to package.json
- [ ] Add `@bull-board/express` to package.json
- [ ] Add `@bull-board/api/bullMQAdapter` to package.json
- [ ] Add `drizzle-orm` to package.json
- [ ] Add `pg` to package.json
- [ ] Run `pnpm install`

### 2. Create Database Module
- [ ] Create `src/database/database.module.ts`
- [ ] Set up Drizzle connection to PostgreSQL using `pg` driver
- [ ] Import `domainSchema` from `@linkinvest/db`
- [ ] Create `DATABASE_CONNECTION` provider with Drizzle instance
- [ ] Export as global module for DI throughout the app
- [ ] Configure to use `DATABASE_URL` environment variable

### 3. Create BullMQ Module
- [ ] Create `src/bullmq/bullmq.module.ts`
- [ ] Set up Redis connection using ioredis
- [ ] Create provider for `SOURCE_FAILING_COMPANIES_REQUESTED` queue (no payload)
- [ ] Create provider for `SOURCE_COMPANY_BUILDINGS` queue (payload: `{ sourceFile: string }`)
- [ ] Export queues as global providers for DI
- [ ] Configure to use `REDIS_URL` environment variable

### 4. Create Worker Services
- [ ] Create `src/workers/failing-companies.worker.ts`
  - [ ] Inject database connection
  - [ ] Set up BullMQ Worker for `SOURCE_FAILING_COMPANIES_REQUESTED` queue
  - [ ] Add placeholder TODO comments for business logic
  - [ ] Implement job lifecycle logging (started, completed, failed)
- [ ] Create `src/workers/company-buildings.worker.ts`
  - [ ] Inject database connection
  - [ ] Set up BullMQ Worker for `SOURCE_COMPANY_BUILDINGS` queue
  - [ ] Add placeholder TODO comments for business logic
  - [ ] Implement job lifecycle logging (started, completed, failed)
- [ ] Create `src/workers/worker.module.ts` to register both workers

### 5. Create Queue Producer Service
- [ ] Create `src/bullmq/queue.service.ts`
- [ ] Make it an injectable service
- [ ] Inject both queues
- [ ] Implement `sourceFailingCompanies()` method
- [ ] Implement `sourceCompanyBuildings(sourceFile: string)` method

### 6. Set Up Bull Board Dashboard
- [ ] Create `src/bullmq/bull-board.setup.ts`
- [ ] Configure Bull Board with both queues
- [ ] Set up Express adapter
- [ ] Configure to mount at `/admin/queues` endpoint
- [ ] Return middleware for integration with NestJS

### 7. Update App Module
- [ ] Import DatabaseModule in `src/app.module.ts`
- [ ] Import BullMQModule in `src/app.module.ts`
- [ ] Import WorkerModule in `src/app.module.ts`
- [ ] Wire up Bull Board middleware in the module

### 8. Add Docker Configuration
- [ ] Create/update `docker-compose.yml` in project root
- [ ] Add Redis service configuration (port 6379)
- [ ] Add PostgreSQL service configuration (port 5432)
- [ ] Configure volume mounts for data persistence
- [ ] Set up health checks

### 9. Environment Configuration
- [ ] Add `REDIS_URL` to environment variables (default: `redis://localhost:6379`)
- [ ] Add `DATABASE_URL` to environment variables
- [ ] Create `.env.example` file with all required variables
- [ ] Document environment variables in README

### 10. Create Example Controller
- [ ] Update `src/app.controller.ts`
- [ ] Inject QueueService
- [ ] Add `POST /jobs/failing-companies` endpoint
- [ ] Add `POST /jobs/company-buildings` endpoint (with sourceFile in body)
- [ ] Add proper error handling and response formatting

### 11. Update Main Bootstrap
- [ ] Update `src/main.ts`
- [ ] Configure app to use Bull Board middleware
- [ ] Ensure proper error handling
- [ ] Add graceful shutdown handling for workers

### 12. Testing & Documentation
- [ ] Test Redis connection
- [ ] Test PostgreSQL connection
- [ ] Test job enqueueing via endpoints
- [ ] Test worker job processing
- [ ] Verify Bull Board dashboard is accessible
- [ ] Update README with setup instructions
- [ ] Document queue structure and job payloads

---

## Queue Definitions

### SOURCE_FAILING_COMPANIES_REQUESTED
- **Purpose**: Process sourcing of failing companies
- **Payload**: None (empty job)
- **Worker**: `failing-companies.worker.ts`

### SOURCE_COMPANY_BUILDINGS
- **Purpose**: Process sourcing of company buildings from a source file
- **Payload**: `{ sourceFile: string }`
- **Worker**: `company-buildings.worker.ts`

---

## Environment Variables

```env
# Redis Configuration
REDIS_URL=redis://localhost:6379

# PostgreSQL Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/linkinvest

# Application
PORT=8080
```

---

## Docker Services

### Redis
- Image: redis:7-alpine
- Port: 6379
- Purpose: Queue backend

### PostgreSQL
- Image: postgres:15-alpine
- Port: 5432
- Purpose: Application database

---

## Notes
- Workers run integrated in the same NestJS process
- Business logic to be implemented later (placeholder TODOs added)
- Bull Board provides monitoring UI at http://localhost:8080/admin/queues
