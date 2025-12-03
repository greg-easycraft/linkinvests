import { useQuery } from '@tanstack/react-query'
import type {
  BaseOpportunity,
  IOpportunityFilters,
  OpportunitiesDataQueryResult,
  OpportunityType,
} from '@/types'

interface UseOpportunityDataOptions<T extends BaseOpportunity> {
  opportunityType: OpportunityType
  filters: IOpportunityFilters
  getDummyData: () => T[]
  filterFn: (data: T[], filters: IOpportunityFilters) => T[]
  pageSize?: number
}

/**
 * Custom hook for fetching and filtering opportunity data
 * Uses TanStack Query for caching and state management
 *
 * This hook:
 * - Generates dummy data using the provided generator
 * - Filters data based on current filters
 * - Handles pagination
 * - Provides loading and error states
 */
export function useOpportunityData<T extends BaseOpportunity>({
  opportunityType,
  filters,
  getDummyData,
  filterFn,
  pageSize = 25,
}: UseOpportunityDataOptions<T>) {
  // Remove view from filters for query key (it shouldn't affect data)
  const filtersWithoutView = { ...filters }
  delete filtersWithoutView.view

  // Data query - fetches and filters all data
  const dataQuery = useQuery({
    queryKey: [opportunityType.toLowerCase(), 'data', filtersWithoutView],
    queryFn: async (): Promise<OpportunitiesDataQueryResult<T>> => {
      // Simulate network delay for realism
      await new Promise((resolve) =>
        setTimeout(resolve, 200 + Math.random() * 300),
      )

      // Get all dummy data
      const allData = getDummyData()

      // Apply filters
      const filteredData = filterFn(allData, filters)

      // Sort data
      const sortedData = sortData(
        filteredData,
        filters.sortBy,
        filters.sortOrder,
      )

      // Paginate
      const page = filters.page ?? 1
      const startIndex = (page - 1) * pageSize
      const paginatedData = sortedData.slice(startIndex, startIndex + pageSize)

      return {
        opportunities: paginatedData,
        total: filteredData.length,
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Count query - returns total count for pagination
  const countQuery = useQuery({
    queryKey: [opportunityType.toLowerCase(), 'count', filtersWithoutView],
    queryFn: async (): Promise<number> => {
      // Small delay for count
      await new Promise((resolve) => setTimeout(resolve, 100))

      const allData = getDummyData()
      const filteredData = filterFn(allData, filters)
      return filteredData.length
    },
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

/**
 * Sort data based on sort options
 */
function sortData<T extends BaseOpportunity>(
  data: T[],
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
): T[] {
  if (!sortBy) return data

  const sorted = [...data].sort((a, b) => {
    const aValue = getNestedValue(a, sortBy)
    const bValue = getNestedValue(b, sortBy)

    if (aValue === undefined || aValue === null) return 1
    if (bValue === undefined || bValue === null) return -1

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue)
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return aValue - bValue
    }

    // Handle dates
    if (sortBy.includes('Date') || sortBy.includes('date')) {
      const dateA = new Date(aValue as string).getTime()
      const dateB = new Date(bValue as string).getTime()
      return dateA - dateB
    }

    return 0
  })

  return sortOrder === 'desc' ? sorted.reverse() : sorted
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue<T>(obj: T, path: string): unknown {
  return path.split('.').reduce((acc: unknown, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, obj as unknown)
}

/**
 * Hook for fetching a single opportunity by ID
 */
export function useOpportunityById<T extends BaseOpportunity>(
  opportunityType: OpportunityType,
  id: string | undefined,
  getById: (id: string) => T | undefined,
) {
  return useQuery({
    queryKey: [opportunityType.toLowerCase(), 'detail', id],
    queryFn: async (): Promise<T | null> => {
      if (!id) return null

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 150))

      return getById(id) ?? null
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}
