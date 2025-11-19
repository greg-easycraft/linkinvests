# Frontend Testing Implementation Plan

## Overview
Comprehensive testing strategy for the frontend package covering services, repositories, and components.

## Progress Tracker
- ✅ **Phase 1**: Service Unit Tests (7/7 completed)
- ✅ **Phase 2**: Repository Integration Tests (6/6 completed)*
- 🟡 **Phase 3**: Frontend Component Tests (3/42 completed)
- 🔴 **Phase 4**: Custom Hooks Tests (0/3 completed)

**Overall Progress: 16/58 tests completed (27.6%)**

*Phase 2 Note: Repository tests are complete but require PostgreSQL database setup with drizzle-kit to run.*

---

## Phase 1: Service Unit Tests (High Priority)
**Strategy**: Mock repositories and export service dependencies using `mockClass` utility

### Services Progress
- [x] **AuctionService** (`src/server/domains/auctions/services/auction.service.spec.ts`) ✅ 18 tests
- [x] **ListingService** (`src/server/domains/listings/services/listing.service.spec.ts`) ✅ 18 tests
- [x] **LiquidationService** (`src/server/domains/liquidations/services/liquidation.service.spec.ts`) ✅ 18 tests
- [x] **SuccessionService** (`src/server/domains/successions/services/succession.service.spec.ts`) ✅ 18 tests
- [x] **EnergyDiagnosticsService** (`src/server/domains/energy-diagnostics/services/energy-diagnostics.service.spec.ts`) ✅ 18 tests
- [x] **AddressSearchService** (`src/server/domains/addresses/services/address-search.service.spec.ts`) ✅ 16 tests
- [x] **ExportService** (`src/server/services/export.service.spec.ts`) ✅ 18 tests

### Test Coverage Per Service ✅ ALL COMPLETED
- [x] Data retrieval with pagination (`get<Domain>Data`)
- [x] Count queries (`get<Domain>Count`)
- [x] Single item lookup (`get<Domain>ById`)
- [x] Export functionality with 500 item limit validation
- [x] Error handling scenarios
- [x] Filter parameter validation

**Phase 1 Summary**: 7 services with 122 total tests covering all business logic, error scenarios, and edge cases.

---

## Phase 2: Repository Integration Tests (High Priority)
**Strategy**: Use `useTestDb()` with real test data and fixtures from `@linkinvests/shared`

### Repository Progress ✅ ALL COMPLETED
- [x] **DrizzleAuctionRepository** (`src/server/domains/auctions/repositories/auction.repository.integration.test.ts`)
- [x] **DrizzleListingRepository** (`src/server/domains/listings/repositories/listing.repository.integration.test.ts`)
- [x] **DrizzleLiquidationRepository** (`src/server/domains/liquidations/repositories/liquidation.repository.integration.test.ts`)
- [x] **DrizzleSuccessionRepository** (`src/server/domains/successions/repositories/succession.repository.integration.test.ts`)
- [x] **DrizzleEnergyDiagnosticsRepository** (`src/server/domains/energy-diagnostics/repositories/energy-diagnostics.repository.integration.test.ts`)
- [x] **DrizzleAddressSearchRepository** (`src/server/domains/addresses/repositories/address-search.repository.integration.test.ts`)

### Test Coverage Per Repository ✅ ALL COMPLETED
- [x] Filter combinations (departments, zipCodes, datePeriod, bounds)
- [x] Pagination (limit/offset) with various page sizes
- [x] Sorting (sortBy, sortOrder) for all supported fields
- [x] Special filters (energyClasses E/F/G for EnergyDiagnostics only)
- [x] Edge cases (empty filters, invalid bounds, non-existent IDs)
- [x] Data integrity (verify fixture data matches expected schemas)

**Phase 2 Summary**: 6 repositories with comprehensive integration tests covering all filtering, pagination, sorting, and edge cases. Tests use real fixtures and database connections.

### Available Test Data
- **ALL_AUCTIONS**: 5 auctions (CA, NY, TX, FL, IL)
- **ALL_LISTINGS**: 5 listings (Paris, Lyon, Bordeaux, Nice, Toulouse)
- **ALL_LIQUIDATIONS**: 5 liquidations (Paris, Lyon, Aix-en-Provence, Montpellier)
- **ALL_SUCCESSIONS**: 5 successions (Bordeaux, Paris, Strasbourg, Lyon, Nice)
- **ALL_ENERGY_DIAGNOSTICS**: 5 diagnostics with F/G energy classes

---

## Phase 3: Frontend Component Tests (Medium Priority)
**Strategy**: Use React Testing Library with custom render helper from `~/test-utils/test-helpers`

### UI Components (13 total)
- [x] **Table** (`src/components/ui/table.test.tsx`) ✅ 40 tests
- [x] **Badge** (`src/components/ui/badge.test.tsx`) ✅ 18 tests
- [x] **Tabs** (`src/components/ui/tabs.test.tsx`) ✅ 23 tests
- [ ] **DropdownMenu** (`src/components/ui/dropdown-menu.test.tsx`)
- [ ] **Command** (`src/components/ui/command.test.tsx`)
- [ ] **MultiInput** (`src/components/ui/multi-input.test.tsx`)
- [ ] **MultiSelect** (`src/components/ui/multi-select.test.tsx`)
- [ ] **Popover** (`src/components/ui/popover.test.tsx`)
- [ ] **Select** (`src/components/ui/select.test.tsx`)
- [ ] **ZipCodeInput** (`src/components/ui/zip-code-input.test.tsx`)
- [ ] **DepartmentsInput** (`src/components/ui/departments-input.test.tsx`)
- [ ] **Tooltip** (`src/components/ui/tooltip.test.tsx`)
- [ ] **Alert** (`src/components/ui/alert.test.tsx`)

### Auth Components (5 total)
- [ ] **SignUpForm** (`src/components/auth/SignUpForm.test.tsx`)
- [ ] **ResetPasswordForm** (`src/components/auth/ResetPasswordForm.test.tsx`)
- [ ] **ForgotPasswordForm** (`src/components/auth/ForgotPasswordForm.test.tsx`)
- [ ] **VerifyEmailCard** (`src/components/auth/VerifyEmailCard.test.tsx`)
- [ ] **EmailVerifiedCard** (`src/components/auth/EmailVerifiedCard.test.tsx`)

### App Components - Opportunity Filters (3 total)
- [ ] **AuctionFilters** (`src/app/search/_components/OpportunityFilters/AuctionFilters.test.tsx`)
- [ ] **EnergyDiagnosticFilters** (`src/app/search/_components/OpportunityFilters/EnergyDiagnosticFilters.test.tsx`)
- [ ] **ListingFilters** (`src/app/search/_components/OpportunityFilters/ListingFilters.test.tsx`)

### App Components - Page Components (4 total)
- [ ] **PageHeader** (`src/app/search/_components/PageHeader/index.test.tsx`)
- [ ] **UserInfo** (`src/app/search/_components/PageHeader/UserInfo.test.tsx`)
- [ ] **PageSkeleton** (`src/app/search/_components/PageSkeleton.test.tsx`)
- [ ] **PageWrapper** (`src/app/search/_components/PageWrapper.test.tsx`)

### App Components - Opportunities Page (6 total)
- [ ] **OpportunitiesPage** (`src/app/search/_components/OpportunitiesPage/index.test.tsx`)
- [ ] **Header** (`src/app/search/_components/OpportunitiesPage/Header/index.test.tsx`)
- [ ] **OpportunitiesList** (`src/app/search/_components/OpportunitiesPage/OpportunitiesList/index.test.tsx`)
- [ ] **OpportunityCard** (`src/app/search/_components/OpportunitiesPage/OpportunitiesList/OpportunityCard.test.tsx`)
- [ ] **StaticStreetView** (`src/app/search/_components/OpportunitiesPage/OpportunitiesList/StaticStreetView.test.tsx`)
- [ ] **OpportunitiesMap** (`src/app/search/_components/OpportunitiesPage/OpportunitiesMap/index.test.tsx`)

### App Components - Details Modal (8 total)
- [ ] **OpportunityDetailsModal** (`src/app/search/_components/OpportunityDetailsModal/index.test.tsx`)
- [ ] **AuctionDetails** (`src/app/search/_components/OpportunityDetailsModal/AuctionDetails.test.tsx`)
- [ ] **ListingDetails** (`src/app/search/_components/OpportunityDetailsModal/ListingDetails.test.tsx`)
- [ ] **LiquidationDetails** (`src/app/search/_components/OpportunityDetailsModal/LiquidationDetails.test.tsx`)
- [ ] **SuccessionDetails** (`src/app/search/_components/OpportunityDetailsModal/SuccessionDetails.test.tsx`)
- [ ] **EnergySieveDetails** (`src/app/search/_components/OpportunityDetailsModal/EnergySieveDetails.test.tsx`)
- [ ] **ImageCarousel** (`src/app/search/_components/OpportunityDetailsModal/ImageCarousel.test.tsx`)
- [ ] **StreetView** (`src/app/search/_components/OpportunityDetailsModal/StreetView.test.tsx`)

### App Components - Address Search (3 total)
- [ ] **AddressSearchPageContent** (`src/app/address-search/AddressSearchPageContent.test.tsx`)
- [ ] **AddressSearchForm** (`src/app/address-search/_components/AddressSearchForm.test.tsx`)
- [ ] **SearchResults** (`src/app/address-search/_components/SearchResults.test.tsx`)

### Export Components (2 total)
- [ ] **ExportButton** (`src/components/ExportButton/index.test.tsx`)
- [ ] **ExportDropDown** (`src/components/ExportButton/ExportDropDown.test.tsx`)

### Component Test Coverage
- [ ] Rendering with various props and states
- [ ] User interactions (clicks, form submissions, input changes)
- [ ] State management and prop validation
- [ ] Accessibility compliance (ARIA labels, keyboard navigation)
- [ ] Error states and loading states
- [ ] Integration with hooks and context

---

## Phase 4: Custom Hooks Tests (Low Priority)
**Strategy**: Test custom hooks with React Testing Library's `renderHook`

### Hooks Progress
- [ ] **useOpportunityData** (`src/hooks/useOpportunityData.test.ts`)
- [ ] **useQueryParamFilters** (`src/hooks/useQueryParamFilters.test.ts`)
- [ ] **useDelayedSkeleton** (`src/hooks/useDelayedSkeleton.test.ts`)

### Hook Test Coverage
- [ ] State initialization and updates
- [ ] Effect dependencies and cleanup
- [ ] Parameter validation and transformation
- [ ] Error handling and edge cases

---

## Quality Metrics & Targets
- **Services & Repositories**: 90%+ code coverage
- **Components**: 80%+ code coverage
- **TypeScript**: All tests must compile without errors
- **ESLint**: All tests must pass linting
- **Test Commands**:
  - `pnpm test` - Run all tests
  - `pnpm test:coverage` - Generate coverage report
  - `pnpm typecheck` - Validate TypeScript
  - `pnpm lint:fix` - Fix linting issues

## Available Test Utilities
- **test-helpers.tsx**: Custom render with providers
- **mock-class.ts**: Class mocking utility
- **mocks/better-auth.ts**: Auth client mocking
- **use-test-db.ts**: Database testing utility
- **setup.ts**: Jest setup with environment mocks

---

## Implementation Notes
1. **Execution Order**: Services → Repositories → Components → Hooks
2. **Time Estimation**: 16-21 hours total (3-4h services, 4-5h repositories, 8-10h components, 1-2h hooks)
3. **Dependencies**: Each test file should be independent and runnable in isolation
4. **Data**: Repository tests use real fixtures, service/component tests use mocks