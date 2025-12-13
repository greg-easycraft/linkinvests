import { useQuery } from '@tanstack/react-query'
import type { SearchResponse } from '@/api'
import type {
  AllOpportunity,
  BaseOpportunity,
  IAllOpportunitiesFilters,
  OpportunitiesDataQueryResult,
} from '@linkinvests/shared'
import type { UnifiedSearchFilters } from '@/schemas/filters.schema'
import { OpportunityType } from '@linkinvests/shared'
import {
  countAllOpportunities,
  countAuctions,
  countEnergyDiagnostics,
  countLiquidations,
  countListings,
  countSuccessions,
  searchAllOpportunities,
  searchAuctions,
  searchEnergyDiagnostics,
  searchLiquidations,
  searchListings,
  searchSuccessions,
} from '@/api'

// Opportunity types that have API support
type SupportedOpportunityType =
  | OpportunityType.AUCTION
  | OpportunityType.REAL_ESTATE_LISTING
  | OpportunityType.SUCCESSION
  | OpportunityType.LIQUIDATION
  | OpportunityType.ENERGY_SIEVE

const SINGLE_TYPE_API: Record<
  SupportedOpportunityType,
  {
    search: (filters: never) => Promise<SearchResponse<BaseOpportunity>>
    count: (filters: never) => Promise<number>
  }
> = {
  [OpportunityType.AUCTION]: {
    search: searchAuctions as (
      filters: never,
    ) => Promise<SearchResponse<BaseOpportunity>>,
    count: countAuctions as (filters: never) => Promise<number>,
  },
  [OpportunityType.REAL_ESTATE_LISTING]: {
    search: searchListings as (
      filters: never,
    ) => Promise<SearchResponse<BaseOpportunity>>,
    count: countListings as (filters: never) => Promise<number>,
  },
  [OpportunityType.SUCCESSION]: {
    search: searchSuccessions as (
      filters: never,
    ) => Promise<SearchResponse<BaseOpportunity>>,
    count: countSuccessions as (filters: never) => Promise<number>,
  },
  [OpportunityType.LIQUIDATION]: {
    search: searchLiquidations as (
      filters: never,
    ) => Promise<SearchResponse<BaseOpportunity>>,
    count: countLiquidations as (filters: never) => Promise<number>,
  },
  [OpportunityType.ENERGY_SIEVE]: {
    search: searchEnergyDiagnostics as (
      filters: never,
    ) => Promise<SearchResponse<BaseOpportunity>>,
    count: countEnergyDiagnostics as (filters: never) => Promise<number>,
  },
}

interface UseUnifiedOpportunityDataOptions {
  filters: UnifiedSearchFilters
}

/**
 * Custom hook for fetching opportunity data with multi-type support
 *
 * This hook:
 * - When single type is selected: queries the type-specific API
 * - When multiple types or no types selected: queries the all-opportunities API
 * - Handles pagination via API
 * - Provides loading and error states
 */
export function useUnifiedOpportunityData({
  filters,
}: UseUnifiedOpportunityDataOptions) {
  // Remove view from filters for query key (it doesn't affect data)
  const { view, types, ...baseFiltersForQuery } = filters

  const selectedTypes = types ?? []
  const isSingleType = selectedTypes.length === 1

  const singleType = isSingleType
    ? (selectedTypes[0] as SupportedOpportunityType)
    : null

  // Build query key
  const queryKey = isSingleType
    ? [singleType?.toLowerCase(), 'search', baseFiltersForQuery]
    : [
        'all-opportunities',
        'search',
        { types: selectedTypes, ...baseFiltersForQuery },
      ]

  const countQueryKey = isSingleType
    ? [singleType?.toLowerCase(), 'count', baseFiltersForQuery]
    : [
        'all-opportunities',
        'count',
        { types: selectedTypes, ...baseFiltersForQuery },
      ]

  // Data query - fetches paginated data from appropriate API
  const dataQuery = useQuery({
    queryKey,
    queryFn: async (): Promise<
      OpportunitiesDataQueryResult<BaseOpportunity | AllOpportunity>
    > => {
      if (isSingleType && singleType) {
        // Query single type API
        const apiFunctions = SINGLE_TYPE_API[singleType]
        const response = await apiFunctions.search(baseFiltersForQuery as never)
        return {
          opportunities: response.opportunities,
          total: response.opportunities.length,
        }
      } else {
        // Query unified API
        const apiFilters = {
          ...baseFiltersForQuery,
          types: selectedTypes.length > 0 ? selectedTypes : undefined,
        } as IAllOpportunitiesFilters
        const response = await searchAllOpportunities(apiFilters)
        return {
          opportunities: response.opportunities,
          total: response.opportunities.length,
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Count query - returns total count for pagination
  const countQuery = useQuery({
    queryKey: countQueryKey,
    queryFn: async (): Promise<number> => {
      if (isSingleType && singleType) {
        const apiFunctions = SINGLE_TYPE_API[singleType]
        return apiFunctions.count(baseFiltersForQuery as never)
      } else {
        const apiFilters = {
          ...baseFiltersForQuery,
          types: selectedTypes.length > 0 ? selectedTypes : undefined,
        } as IAllOpportunitiesFilters
        return countAllOpportunities(apiFilters)
      }
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
    isSingleType,
    selectedTypes,
    refetch: () => {
      dataQuery.refetch()
      countQuery.refetch()
    },
  }
}
