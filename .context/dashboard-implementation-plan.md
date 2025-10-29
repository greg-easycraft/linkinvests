# Dashboard Implementation Plan

**Status:** In Progress
**Started:** 2025-10-28
**Last Updated:** 2025-10-28

## Overview
Implement a comprehensive dashboard for displaying opportunities with list view, map view, and multiple filtering options.

## Requirements
- List view with table displaying all opportunities
- Interactive map view with Mapbox showing opportunity locations
- Toggle between list and map views
- Filters: Type, Status, Location (department/zip), Date range
- Details sidebar for selected opportunity
- Reuse components from @packages/old-ui where applicable
- Follow coding guidelines and DDD architecture

---

## Phase 1: Dependencies & Setup

### 1.1 Install Dependencies
- [ ] Install core packages: `mapbox-gl`, `@tanstack/react-query`, `date-fns`
- [ ] Install form packages: `react-hook-form`, `@hookform/resolvers`, `zod`
- [ ] Install UI packages: `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`

### 1.2 ShadCN UI Setup
- [ ] Initialize ShadCN UI
- [ ] Add components: button, card, table, input, select, badge, tabs
- [ ] Add date components: calendar, popover for date range picker

### 1.3 React Query Configuration
- [ ] Create QueryClient provider
- [ ] Add to root layout.tsx
- [ ] Configure default options

**Status:** 🔄 In Progress

---

## Phase 2: Backend Layer (DDD Pattern)

### 2.1 Repository Layer
**Location:** `packages/frontend/src/server/domains/opportunities/repositories/`

- [ ] Create `IOpportunityRepository.ts` interface
  - `findAll(filters?: OpportunityFilters): Promise<Opportunity[]>`
  - `findById(id: number): Promise<Opportunity | null>`
  - `findByBounds(bounds: MapBounds, filters?: OpportunityFilters): Promise<Opportunity[]>`
  - `count(filters?: OpportunityFilters): Promise<number>`

- [ ] Create `DrizzleOpportunityRepository.ts` implementation
  - Implement filtering by type, status, department, zipCode, date range
  - Add pagination support
  - Add sorting support

### 2.2 Service Layer
**Location:** `packages/frontend/src/server/domains/opportunities/services/`

- [ ] Create `OpportunityService.ts`
  - Business logic for filtering
  - Data transformation
  - Validation

### 2.3 Dependency Injection
- [ ] Register OpportunityRepository in DI container
- [ ] Register OpportunityService in DI container

### 2.4 Server Actions
**Location:** `packages/frontend/src/app/_actions/opportunity/`

- [ ] Create `queries.ts`
  - `getOpportunities(filters)` - for list view
  - `getOpportunitiesByBounds(bounds, filters)` - for map view
  - `getOpportunityById(id)` - for details

**Status:** ⏳ Not Started

---

## Phase 3: Dashboard Components

### 3.1 Component Structure
**Location:** `packages/frontend/src/app/dashboard/components/`

#### OpportunityFilters.tsx (Client Component)
- [ ] Type filter (multi-select)
- [ ] Status filter (select)
- [ ] Department filter (select/input)
- [ ] Zip code filter (input)
- [ ] Date range picker (calendar)
- [ ] Reset filters button
- [ ] Apply filters button

#### OpportunityList.tsx (Client Component)
- [ ] Table with columns: Label, Type, Status, Address, Department, Date
- [ ] Sortable columns
- [ ] Pagination controls
- [ ] Row selection (highlights in map)
- [ ] Loading state
- [ ] Empty state

#### OpportunityMap.tsx (Client Component)
- [ ] Mapbox GL integration
- [ ] Markers for each opportunity
- [ ] Color-coding by opportunity type
- [ ] Marker clustering for performance
- [ ] Popup on marker hover
- [ ] Click to select (shows in sidebar)
- [ ] Bounds change triggers filter
- [ ] Loading state

#### OpportunitySidebar.tsx (Client Component)
- [ ] Display selected opportunity details
- [ ] Show all fields: label, siret, address, type, status, date
- [ ] Display location on mini-map or coordinates
- [ ] Close button
- [ ] Empty state when nothing selected

#### ViewToggle.tsx (Client Component)
- [ ] Tabs for List/Map view
- [ ] Preserves filters when switching
- [ ] Icon indicators

### 3.2 Dashboard Page
**Location:** `packages/frontend/src/app/dashboard/page.tsx`

- [ ] Server Component for initial data load
- [ ] Layout with filters, view toggle, main content area
- [ ] State management for selected opportunity
- [ ] State management for active view
- [ ] State management for filters

**Status:** ⏳ Not Started

---

## Phase 4: Features & Integration

### 4.1 List View Features
- [ ] Display all opportunities in table format
- [ ] Column sorting (client-side)
- [ ] Pagination (10, 25, 50 per page)
- [ ] Row hover effect
- [ ] Click row to show details in sidebar

### 4.2 Map View Features
- [ ] Display opportunities as markers
- [ ] Color legend for opportunity types
- [ ] Zoom controls
- [ ] Fit bounds to show all filtered opportunities
- [ ] Click marker to show details in sidebar
- [ ] Sync with list view selection

### 4.3 Filter Integration
- [ ] Filters apply to both list and map view
- [ ] URL query params for shareable filtered views
- [ ] Filter counts (e.g., "Showing 45 of 120 opportunities")
- [ ] Loading states during filter application

### 4.4 Details Sidebar
- [ ] Opens when opportunity selected from list or map
- [ ] Responsive drawer on mobile
- [ ] Side panel on desktop
- [ ] Close button clears selection

**Status:** ⏳ Not Started

---

## Phase 5: Testing & Polish

### 5.1 Type Safety
- [ ] Run `pnpm typecheck`
- [ ] Fix all TypeScript errors
- [ ] Verify no `any` types used
- [ ] Check all return types are explicit

### 5.2 Code Quality
- [ ] Run `pnpm lint:fix`
- [ ] Fix all linting errors
- [ ] Verify component file sizes (<300 lines)
- [ ] Check proper imports (type imports where applicable)

### 5.3 Manual Testing
- [ ] Test all filter combinations
- [ ] Verify map interactions (zoom, pan, click)
- [ ] Test view switching (list ↔ map)
- [ ] Verify sidebar details display
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Check loading states
- [ ] Check empty states

### 5.4 Performance
- [ ] Verify marker clustering works on map
- [ ] Check pagination works smoothly
- [ ] Test with large datasets (1000+ opportunities)

**Status:** ⏳ Not Started

---

## Component Reuse from old-ui

### Direct Reuse (100%)
- [x] Table component from `modules/shared/react/components/ui/Table.tsx`
- [x] Button component from `modules/shared/react/components/ui/Button.tsx`
- [x] `cn()` utility function

### Adaptation Required (90%)
- [ ] MapsCard → OpportunityMap (change data model from Succession to Opportunity)
- [ ] MapSidebar → OpportunitySidebar (update data structure)
- [ ] MapSearchBar → integrate into OpportunityFilters

---

## Dependencies Inventory

### To Install
```bash
# Core
pnpm --filter @linkinvests/frontend add mapbox-gl
pnpm --filter @linkinvests/frontend add @tanstack/react-query
pnpm --filter @linkinvests/frontend add date-fns

# Forms
pnpm --filter @linkinvests/frontend add react-hook-form @hookform/resolvers zod

# UI Utilities
pnpm --filter @linkinvests/frontend add lucide-react
pnpm --filter @linkinvests/frontend add class-variance-authority clsx tailwind-merge

# Types
pnpm --filter @linkinvests/frontend add -D @types/mapbox-gl
```

### Already Available
- `@linkinvests/db` - Database access
- `@linkinvests/shared` - Shared types (OpportunityType enum)
- `next` - Framework
- `react` & `react-dom` - UI library
- `tailwindcss` - Styling

---

## Architecture Decisions

### Data Fetching Strategy
- Server Components for initial page load
- Server Actions for data fetching
- React Query for client-side caching and refetching
- No Redux (simpler state management with React hooks)

### Component Strategy
- Server Components by default
- Client Components only when needed (interactivity, hooks)
- ShadCN UI for consistency with coding guidelines
- Adapted old-ui components where beneficial

### Performance Optimizations
- Marker clustering on map for 100+ opportunities
- Pagination in list view
- Debounced search inputs
- React Query caching to reduce server load

---

## Notes & Decisions

- **Date Utility:** Using `date-fns` as per coding guidelines (not dayjs from old-ui)
- **UI Library:** ShadCN UI (Radix-based) for consistency
- **Map Library:** Mapbox GL (same as old-ui)
- **State Management:** React hooks + React Query (no Redux)
- **Form Handling:** React Hook Form + Zod validation

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Mapbox API key needed | Check for existing key in env vars or request from user |
| Large dataset performance | Implement marker clustering and pagination |
| Complex filter logic | Break into smaller, testable functions |
| Component file size | Refactor into smaller components if >300 lines |

---

## Success Criteria

- ✅ All filters working (type, status, location, date range)
- ✅ List view displays all opportunities with sorting/pagination
- ✅ Map view shows markers with proper color-coding
- ✅ Toggle between views preserves filters
- ✅ Sidebar shows selected opportunity details
- ✅ No TypeScript errors (`pnpm typecheck` passes)
- ✅ No linting errors (`pnpm lint:fix` clean)
- ✅ Follows all coding guidelines (no `any`, proper imports, etc.)
- ✅ Responsive on mobile, tablet, desktop

---

## Timeline Estimate

- **Phase 1:** ~30 minutes (setup)
- **Phase 2:** ~2 hours (backend layer)
- **Phase 3:** ~3 hours (components)
- **Phase 4:** ~2 hours (integration)
- **Phase 5:** ~1 hour (testing)

**Total:** ~8-9 hours of development time
