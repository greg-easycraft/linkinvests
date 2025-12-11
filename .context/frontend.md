# Frontend Guidelines

## Overview

This document outlines the frontend-specific coding standards and best practices for React components, hooks, and client-side development. These guidelines complement the general coding guidelines and focus on frontend-specific patterns and optimizations.

**Package**: `@packages/app` (Vite SPA)

### Technology Stack

- **Framework**: React 19 with TypeScript 5.7+
- **Build Tool**: Vite 7
- **Routing**: TanStack Router v1
- **Server State**: TanStack Query v5 (React Query)
- **Forms**: React Hook Form + Zod
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/ui (Radix UI primitives)
- **Authentication**: Better Auth client
- **Testing**: Vitest + Testing Library

## Component Organization

### Single Responsibility Principle
- **One Purpose**: Each component should have one clear purpose
- **Composition over Inheritance**: Use component composition instead of complex inheritance
- **Props Interface**: Define clear prop interfaces for all components
- **Default Props**: Use default parameters instead of defaultProps for better TypeScript support

### Component Refactoring Patterns
- **Folder Structure**: Break down large components into focused sub-components within dedicated folders
- **Main Orchestrator**: Use an `index.tsx` file to orchestrate all sub-components
- **Consistent Naming**: Use descriptive names that clearly indicate the component's purpose
- **Shared Logic**: Extract shared logic into custom hooks or utility functions

```typescript
// Good - Refactored component structure
// /src/components/opportunities/OpportunitiesPage/
// ├── index.tsx                 (Main orchestrator)
// ├── FiltersSidebar.tsx        (Filter controls)
// ├── OpportunitiesList.tsx     (List view)
// ├── OpportunitiesMap.tsx      (Map view)
// └── Pagination.tsx            (Pagination controls)

// Main orchestrator component
export function OpportunitiesPage<T extends BaseOpportunity>({
  opportunityType,
  filters,
}: OpportunitiesPageProps<T>) {
  const { data, count, isDataLoading } = useOpportunityData({
    opportunityType,
    filters,
  })

  return (
    <div className="flex">
      <FiltersSidebar filters={filters} />
      <main className="flex-1">
        {filters.view === 'list' ? (
          <OpportunitiesList data={data} isLoading={isDataLoading} />
        ) : (
          <OpportunitiesMap data={data} />
        )}
        <Pagination count={count} filters={filters} />
      </main>
    </div>
  )
}
```

### Component Decomposition Guidelines
- **Logical Separation**: Break components based on logical UI sections (header, content, footer)
- **Reusability**: Extract components that could be reused in other contexts
- **Complexity Threshold**: Refactor when components exceed 200-300 lines
- **State Management**: Keep state management in the main orchestrator component
- **Props Drilling**: Avoid deep props drilling by using context or state lifting

```typescript
// Good - Clear component with defined props
interface OpportunityCardProps {
  opportunity: BaseOpportunity
  onSelect?: (opportunity: BaseOpportunity) => void
  isSelected?: boolean
  className?: string
}

export function OpportunityCard({
  opportunity,
  onSelect,
  isSelected = false,
  className,
}: OpportunityCardProps) {
  return (
    <div className={cn('opportunity-card', { selected: isSelected }, className)}>
      <h3>{opportunity.label}</h3>
      <p>{opportunity.address}</p>
      {onSelect && (
        <button onClick={() => onSelect(opportunity)}>View Details</button>
      )}
    </div>
  )
}

// Avoid - Unclear props and responsibilities
export function OpportunityCard(props: any) {
  return <div>{props.children}</div>
}
```

### Component Structure
- **Export Order**: Export components at the bottom of the file
- **Type Definitions**: Define interfaces before component implementation
- **Helper Functions**: Keep helper functions outside the component when possible
- **Conditional Rendering**: Use early returns for conditional rendering

```typescript
// Good - Well-structured component
interface UserProfileProps {
  user: User
  onEdit?: () => void
  showActions?: boolean
}

function formatUserDisplayName(user: User): string {
  return `${user.name}`.trim()
}

export function UserProfile({ user, onEdit, showActions = true }: UserProfileProps) {
  if (!user) return null

  const displayName = formatUserDisplayName(user)

  return (
    <div className="user-profile">
      <h2>{displayName}</h2>
      <p>{user.email}</p>
      {showActions && onEdit && <button onClick={onEdit}>Edit Profile</button>}
    </div>
  )
}
```

## Routing with TanStack Router

### Route Definition

```typescript
// main.tsx
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'
import { zodSearchValidator } from '@tanstack/router-zod-adapter'
import type { RouterContext } from '@/router'

// Root route with context
const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

// Protected route with search params validation
const searchListingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search/listings',
  validateSearch: zodSearchValidator(listingFiltersSchema),
  beforeLoad: requireAuth,
  component: ListingsPage,
})

// Detail route with path params
const listingDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/listings/$listingId',
  beforeLoad: requireAuth,
  component: ListingDetailPage,
})

// Build route tree
const routeTree = rootRoute.addChildren([
  searchListingsRoute,
  listingDetailRoute,
  // ...more routes
])

// Create router with context
const router = createRouter({
  routeTree,
  context: { auth },
  defaultPreload: 'intent',
  scrollRestoration: true,
})
```

### Route Guards

```typescript
// router/guards.ts
import { redirect } from '@tanstack/react-router'
import type { RouterContext } from './context'

export function requireAuth({ context }: { context: RouterContext }) {
  if (!context.auth.isAuthenticated && !context.auth.isLoading) {
    throw redirect({ to: '/auth/sign-in' })
  }
  if (context.auth.isBanned && !context.auth.isLoading) {
    throw redirect({ to: '/auth/banned' })
  }
}

export function requireGuest({ context }: { context: RouterContext }) {
  if (context.auth.isAuthenticated && !context.auth.isLoading) {
    throw redirect({ to: '/search/auctions' })
  }
}

export function requireAdmin({ context }: { context: RouterContext }) {
  requireAuth({ context })
  if (!context.auth.isAdmin && !context.auth.isLoading) {
    throw redirect({ to: '/search/auctions' })
  }
}
```

### Using Search Params

```typescript
// In page component
import { useSearch, useNavigate } from '@tanstack/react-router'

export function ListingsPage() {
  // Type-safe search params from route validation
  const filters = useSearch({ from: '/search/listings' })
  const navigate = useNavigate()

  const handleFilterChange = (newFilters: Partial<ListingFilters>) => {
    navigate({
      to: '/search/listings',
      search: { ...filters, ...newFilters },
    })
  }

  return <OpportunitiesPage filters={filters} onFilterChange={handleFilterChange} />
}
```

## State Management

### Server State with TanStack Query

```typescript
// hooks/useOpportunityData.ts
import { useQuery } from '@tanstack/react-query'

export function useOpportunityData<T extends BaseOpportunity>({
  opportunityType,
  filters,
}: UseOpportunityDataOptions) {
  // Remove view from filters for query key (it doesn't affect data)
  const { view, ...filtersForQuery } = filters

  // Data query - fetches paginated data from API
  const dataQuery = useQuery({
    queryKey: [opportunityType.toLowerCase(), 'search', filtersForQuery],
    queryFn: async () => {
      const response = await searchOpportunities(opportunityType, filtersForQuery)
      return {
        opportunities: response.opportunities,
        total: response.opportunities.length,
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Count query - returns total count for pagination
  const countQuery = useQuery({
    queryKey: [opportunityType.toLowerCase(), 'count', filtersForQuery],
    queryFn: () => countOpportunities(opportunityType, filtersForQuery),
    staleTime: 5 * 60 * 1000,
  })

  return {
    data: dataQuery.data,
    count: countQuery.data,
    isDataLoading: dataQuery.isLoading,
    isCountLoading: countQuery.isLoading,
    isError: dataQuery.isError || countQuery.isError,
    error: dataQuery.error || countQuery.error,
    refetch: () => {
      dataQuery.refetch()
      countQuery.refetch()
    },
  }
}
```

### Query Client Configuration

```typescript
// main.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

// In app
<QueryClientProvider client={queryClient}>
  <AuthProvider>
    <InnerApp />
    <ReactQueryDevtools initialIsOpen={false} />
  </AuthProvider>
</QueryClientProvider>
```

### Client State with React Context

```typescript
// components/providers/auth-provider.tsx
import { createContext, useContext } from 'react'
import { useSession } from '@/lib/auth-client'

interface AuthContextValue {
  session: Session | null
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isBanned: boolean
  banReason: string | null
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending: isLoading } = useSession()

  const user = session?.user ?? null
  const isAdmin = user !== null && user.role === 'admin'
  const isBanned = user !== null && user.banned === true

  const value: AuthContextValue = {
    session: session ?? null,
    user,
    isLoading,
    isAuthenticated: user !== null,
    isAdmin,
    isBanned,
    banReason: user?.banReason ?? null,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

## API Integration

### API Client

```typescript
// api/client.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST'
  body?: unknown
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body } = options

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(
      errorData.message || `HTTP error ${response.status}`,
      response.status,
      errorData.code,
    )
  }

  return response.json() as Promise<T>
}
```

### Domain-specific API Modules

```typescript
// api/listings.api.ts
import { apiRequest } from './client'
import type { Listing, ListingFilters } from '@linkinvests/shared'

export interface SearchResponse<T> {
  opportunities: T[]
  page: number
  pageSize: number
}

export async function searchListings(
  filters: ListingFilters,
): Promise<SearchResponse<Listing>> {
  return apiRequest<SearchResponse<Listing>>('/listings/search', {
    method: 'POST',
    body: filters,
  })
}

export async function countListings(filters: ListingFilters): Promise<number> {
  const response = await apiRequest<{ count: number }>('/listings/count', {
    method: 'POST',
    body: filters,
  })
  return response.count
}

export async function getListingById(id: string): Promise<Listing | null> {
  try {
    return await apiRequest<Listing>(`/listings/${id}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }
    throw error
  }
}
```

## React Hooks Guidelines

### Custom Hooks
- **Single Purpose**: Each custom hook should have one clear responsibility
- **Hook Naming**: Custom hooks should start with 'use'
- **Hook Composition**: Compose multiple simple hooks instead of one complex hook
- **Return Objects**: Return objects with descriptive property names

```typescript
// Good - Custom hook with clear purpose
export function useOpportunityById<T extends BaseOpportunity>(
  opportunityType: OpportunityType,
  id: string | undefined,
) {
  return useQuery({
    queryKey: [opportunityType.toLowerCase(), 'detail', id],
    queryFn: async () => {
      if (!id) return null
      return getOpportunityById(opportunityType, id) as Promise<T | null>
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Good - Composed hooks
export function useOpportunityManagement(opportunityType: OpportunityType, id: string) {
  const { data, isLoading, error } = useOpportunityById(opportunityType, id)
  const [isEditing, setIsEditing] = useState(false)

  const startEditing = useCallback(() => setIsEditing(true), [])
  const stopEditing = useCallback(() => setIsEditing(false), [])

  return {
    opportunity: data,
    isLoading,
    error,
    isEditing,
    startEditing,
    stopEditing,
  }
}
```

### Hook Dependencies
- **Complete Dependencies**: Always include all dependencies in useEffect dependency arrays
- **Stable References**: Use useCallback and useMemo for stable references
- **Dependency Analysis**: Use ESLint rules to catch missing dependencies

```typescript
// Good - Complete dependencies
export function useFilteredData(items: Item[], searchTerm: string) {
  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [items, searchTerm]) // All dependencies included

  return filteredItems
}
```

## Local State Management

### Local State First
- **Start Local**: Use local state when possible
- **Lift When Needed**: Lift state up only when multiple components need it
- **URL State**: Use URL search params for filterable/shareable state
- **State Location**: Keep state as close to where it's used as possible

```typescript
// Good - Local state for component-specific data
export function FilterForm() {
  const [formData, setFormData] = useState<FilterFormData>({
    department: '',
    priceRange: [0, 1000000],
    propertyType: [],
  })

  const handleInputChange = (field: keyof FilterFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form>
      <DepartmentSelect
        value={formData.department}
        onChange={(value) => handleInputChange('department', value)}
      />
      <PriceRangeSlider
        value={formData.priceRange}
        onChange={(value) => handleInputChange('priceRange', value)}
      />
    </form>
  )
}
```

### Immutable Updates
- **Always Immutable**: Never mutate state directly
- **Spread Operator**: Use spread operator for object updates
- **Array Methods**: Use immutable array methods (map, filter, concat)

```typescript
// Good - Immutable state updates
const [items, setItems] = useState<Item[]>([])

const addItem = (newItem: Item) => {
  setItems((prev) => [...prev, newItem])
}

const updateItem = (id: string, updates: Partial<Item>) => {
  setItems((prev) =>
    prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
  )
}

const removeItem = (id: string) => {
  setItems((prev) => prev.filter((item) => item.id !== id))
}
```

## Error Handling

### Component Error Handling
- **Early Returns**: Use early returns for error states
- **Loading States**: Always handle loading states
- **Empty States**: Provide meaningful empty state UI
- **User-Friendly Messages**: Show clear, actionable error messages

```typescript
// Good - Component with comprehensive error handling
export function OpportunitiesList() {
  const { data, isDataLoading, isError, error } = useOpportunityData({
    opportunityType: OpportunityType.LISTING,
    filters,
  })

  if (isDataLoading) return <LoadingSpinner />
  if (isError) return <ErrorMessage message="Failed to load opportunities" error={error} />
  if (!data?.opportunities.length)
    return <EmptyState message="No opportunities found" />

  return (
    <div className="opportunities-list">
      {data.opportunities.map((opportunity) => (
        <OpportunityCard key={opportunity.id} opportunity={opportunity} />
      ))}
    </div>
  )
}
```

## Performance Optimization

### React.memo and Memoization
- **React.memo**: Use for expensive components that re-render frequently
- **useMemo**: Use for expensive calculations
- **useCallback**: Use for stable function references
- **Dependency Arrays**: Be careful with dependency arrays in memoized functions

```typescript
// Good - Optimized component
export const OpportunityCard = React.memo(function OpportunityCard({
  opportunity,
  onSelect,
}: OpportunityCardProps) {
  const handleSelect = useCallback(() => {
    onSelect?.(opportunity)
  }, [opportunity, onSelect])

  const formattedDate = useMemo(() => {
    return format(new Date(opportunity.opportunityDate), 'MMM dd, yyyy')
  }, [opportunity.opportunityDate])

  return (
    <div className="opportunity-card" onClick={handleSelect}>
      <h3>{opportunity.label}</h3>
      <p>{opportunity.address}</p>
      <span>{formattedDate}</span>
    </div>
  )
})
```

### Code Splitting and Lazy Loading
- **Route-Level Splitting**: Vite handles code splitting automatically per route
- **Component-Level Splitting**: Lazy load large components
- **Dynamic Imports**: Use dynamic imports for conditional loading
- **Loading States**: Provide loading states for lazy-loaded components

```typescript
// Good - Lazy loading with loading state
import { lazy, Suspense } from 'react'

const AdminDashboard = lazy(() => import('./AdminDashboard'))

export function AdminPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AdminDashboard />
    </Suspense>
  )
}
```

### Bundle Optimization
- **Tree Shaking**: Use named imports for better tree shaking
- **Dynamic Imports**: Use dynamic imports for large dependencies
- **Bundle Analysis**: Regularly analyze bundle size

```typescript
// Good - Tree-shakable imports
import { format, addDays } from 'date-fns'
import { groupBy, pick } from 'lodash-es'

// Avoid - Default imports (prevents tree-shaking)
import * as dateFns from 'date-fns'
import _ from 'lodash'
```

## Form Handling

### React Hook Form with Zod Validation

```typescript
// Good - Form with React Hook Form and Zod validation
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const filterFormSchema = z.object({
  department: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  propertyTypes: z.array(z.string()).optional(),
})

type FilterFormData = z.infer<typeof filterFormSchema>

export function FilterForm({ onSubmit }: { onSubmit: (data: FilterFormData) => void }) {
  const {
    formState: { errors, isDirty, isSubmitting, isValid },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<FilterFormData>({
    resolver: zodResolver(filterFormSchema),
    defaultValues: {
      department: '',
      minPrice: undefined,
      maxPrice: undefined,
      propertyTypes: [],
    },
    mode: 'onChange',
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Input id="department" {...register('department')} placeholder="Enter department" />
        {errors.department && (
          <span className="text-sm text-red-500">{errors.department.message}</span>
        )}
      </div>

      <Button type="submit" disabled={!isValid || isSubmitting}>
        {isSubmitting ? 'Applying...' : 'Apply Filters'}
      </Button>
    </form>
  )
}
```

## Accessibility Guidelines

### Semantic HTML
- **Appropriate Elements**: Use semantic HTML elements for content structure
- **Heading Hierarchy**: Maintain proper heading hierarchy (h1, h2, h3, etc.)
- **Landmark Elements**: Use landmark elements (main, nav, aside, etc.)
- **Form Elements**: Use proper form elements with labels

```typescript
// Good - Semantic HTML structure
export function OpportunityDetailPage({ opportunity }: { opportunity: Opportunity }) {
  return (
    <main>
      <header>
        <h1>{opportunity.label}</h1>
        <nav aria-label="Opportunity navigation">
          <a href="#details">Details</a>
          <a href="#location">Location</a>
        </nav>
      </header>

      <section id="details" aria-labelledby="details-heading">
        <h2 id="details-heading">Details</h2>
        <p>{opportunity.description}</p>
      </section>

      <section id="location" aria-labelledby="location-heading">
        <h2 id="location-heading">Location</h2>
        <OpportunityMap opportunity={opportunity} />
      </section>
    </main>
  )
}
```

### ARIA Labels and Roles
- **ARIA Labels**: Provide ARIA labels for interactive elements
- **ARIA Descriptions**: Use aria-describedby for additional context
- **Role Attributes**: Use role attributes when semantic HTML isn't sufficient
- **Live Regions**: Use aria-live for dynamic content updates

### Keyboard Navigation
- **Tab Order**: Ensure logical tab order through interactive elements
- **Focus Management**: Manage focus appropriately in dynamic content
- **Keyboard Shortcuts**: Provide keyboard shortcuts for common actions

## UI Component Library Guidelines

### Shadcn/ui with Radix UI

**ShadCN UI** is the standard for building UI components in this project. Components are located in `src/components/ui/`.

#### Adding New Components

```bash
# Add a new component
npx shadcn@latest add button

# Add multiple components
npx shadcn@latest add card dialog tabs
```

#### Component Usage

```typescript
// Good - Import from ui components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default" size="lg">
          Click me
        </Button>
      </CardContent>
    </Card>
  )
}
```

#### Available Components
- Form elements: `button`, `input`, `textarea`, `select`, `checkbox`, `label`
- Layout: `card`, `tabs`, `accordion`, `table`
- Overlays: `dialog`, `alert-dialog`, `dropdown-menu`, `popover`
- Feedback: `alert`, `badge`, `progress`, `tooltip`

## Testing Guidelines

### Component Testing with Vitest

```typescript
// Good - Comprehensive component test
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { OpportunityCard } from './OpportunityCard'

describe('OpportunityCard', () => {
  const mockOpportunity = {
    id: '1',
    label: 'Test Property',
    address: '123 Test Street',
    opportunityDate: '2024-01-01',
  }

  it('renders opportunity information correctly', () => {
    render(<OpportunityCard opportunity={mockOpportunity} />)

    expect(screen.getByText('Test Property')).toBeInTheDocument()
    expect(screen.getByText('123 Test Street')).toBeInTheDocument()
  })

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn()
    render(<OpportunityCard opportunity={mockOpportunity} onSelect={onSelect} />)

    fireEvent.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalledWith(mockOpportunity)
  })
})
```

### Hook Testing

```typescript
// Good - Hook testing with renderHook
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi } from 'vitest'
import { useOpportunityData } from './useOpportunityData'

describe('useOpportunityData', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('fetches opportunity data successfully', async () => {
    const { result } = renderHook(
      () =>
        useOpportunityData({
          opportunityType: OpportunityType.LISTING,
          filters: {},
        }),
      { wrapper },
    )

    expect(result.current.isDataLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isDataLoading).toBe(false)
    })

    expect(result.current.data).toBeDefined()
  })
})
```

## Project Structure

```
src/
├── api/              # API client and domain-specific API modules
│   ├── client.ts
│   ├── auctions.api.ts
│   ├── listings.api.ts
│   └── index.ts
├── components/
│   ├── auth/         # Authentication components
│   ├── filters/      # Filter components
│   ├── opportunities/ # Opportunity-related components
│   ├── providers/    # React context providers
│   └── ui/           # Shadcn/ui base components
├── hooks/            # Custom React hooks
├── lib/              # Utilities (auth-client, utils)
├── pages/            # Page components
│   ├── search/       # Search pages
│   ├── opportunities/ # Detail pages
│   └── admin/        # Admin pages
├── router/           # Routing configuration and guards
├── schemas/          # Zod schemas for validation
├── types/            # TypeScript types
├── constants/        # Constants
├── main.tsx          # App entry point
└── styles.css        # Global styles
```

## Scripts

```bash
# Development
pnpm dev              # Start dev server on port 3000

# Production
pnpm build            # Build for production
pnpm serve            # Preview production build

# Testing
pnpm test             # Run tests with Vitest

# Code Quality
pnpm lint             # ESLint
pnpm format           # Prettier
pnpm check            # Prettier + ESLint fix
```

## Conclusion

These frontend guidelines ensure our React components are maintainable, accessible, and performant. When developing frontend components, prioritize:

1. **Component Clarity** over complexity
2. **Type Safety** with TypeScript and Zod
3. **Performance** with proper memoization and code splitting
4. **Accessibility** for all users
5. **Testing** for reliability
6. **URL State** for shareable, bookmarkable pages
