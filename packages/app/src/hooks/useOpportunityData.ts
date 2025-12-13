import { useQuery } from '@tanstack/react-query'
import type { SearchResponse } from '@/api'
import type {
  BaseOpportunity,
  IOpportunityFilters,
  OpportunitiesDataQueryResult,
} from '@linkinvests/shared'
import {
  countAuctions,
  countEnergyDiagnostics,
  countLiquidations,
  countListings,
  countSuccessions,
  getAuctionById,
  getEnergyDiagnosticById,
  getLiquidationById,
  getListingById,
  getSuccessionById,
  searchAuctions,
  searchEnergyDiagnostics,
  searchLiquidations,
  searchListings,
  searchSuccessions,
} from '@/api'
import { OpportunityType } from '@linkinvests/shared'

// Opportunity types that have API support
type SupportedOpportunityType =
  | OpportunityType.AUCTION
  | OpportunityType.REAL_ESTATE_LISTING
  | OpportunityType.SUCCESSION
  | OpportunityType.LIQUIDATION
  | OpportunityType.ENERGY_SIEVE

const API_FUNCTIONS: Record<
  SupportedOpportunityType,
  {
    search: (filters: never) => Promise<SearchResponse<BaseOpportunity>>
    count: (filters: never) => Promise<number>
    getById: (id: string) => Promise<BaseOpportunity | null>
  }
> = {
  [OpportunityType.AUCTION]: {
    search: searchAuctions as (
      filters: never,
    ) => Promise<SearchResponse<BaseOpportunity>>,
    count: countAuctions as (filters: never) => Promise<number>,
    getById: getAuctionById as (id: string) => Promise<BaseOpportunity | null>,
  },
  [OpportunityType.REAL_ESTATE_LISTING]: {
    search: searchListings as (
      filters: never,
    ) => Promise<SearchResponse<BaseOpportunity>>,
    count: countListings as (filters: never) => Promise<number>,
    getById: getListingById as (id: string) => Promise<BaseOpportunity | null>,
  },
  [OpportunityType.SUCCESSION]: {
    search: searchSuccessions as (
      filters: never,
    ) => Promise<SearchResponse<BaseOpportunity>>,
    count: countSuccessions as (filters: never) => Promise<number>,
    getById: getSuccessionById as (
      id: string,
    ) => Promise<BaseOpportunity | null>,
  },
  [OpportunityType.LIQUIDATION]: {
    search: searchLiquidations as (
      filters: never,
    ) => Promise<SearchResponse<BaseOpportunity>>,
    count: countLiquidations as (filters: never) => Promise<number>,
    getById: getLiquidationById as (
      id: string,
    ) => Promise<BaseOpportunity | null>,
  },
  [OpportunityType.ENERGY_SIEVE]: {
    search: searchEnergyDiagnostics as (
      filters: never,
    ) => Promise<SearchResponse<BaseOpportunity>>,
    count: countEnergyDiagnostics as (filters: never) => Promise<number>,
    getById: getEnergyDiagnosticById as (
      id: string,
    ) => Promise<BaseOpportunity | null>,
  },
}

interface UseOpportunityDataOptions {
  opportunityType: SupportedOpportunityType
  filters: IOpportunityFilters
}

/**
 * Custom hook for fetching opportunity data from the API
 * Uses TanStack Query for caching and state management
 *
 * This hook:
 * - Fetches data from the API with server-side filtering
 * - Handles pagination via API
 * - Provides loading and error states
 */
export function useOpportunityData<T extends BaseOpportunity>({
  opportunityType,
  filters,
}: UseOpportunityDataOptions) {
  // Remove view from filters for query key (it doesn't affect data)
  const { view, ...filtersForQuery } = filters

  // Get API functions for this opportunity type
  const apiFunctions = API_FUNCTIONS[opportunityType]

  // Data query - fetches paginated data from API
  const dataQuery = useQuery({
    queryKey: [opportunityType.toLowerCase(), 'search', filtersForQuery],
    queryFn: async (): Promise<OpportunitiesDataQueryResult<T>> => {
      const response = (await apiFunctions.search(
        filtersForQuery as never,
      )) as SearchResponse<T>
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
    queryFn: async (): Promise<number> => {
      return apiFunctions.count(filtersForQuery as never)
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
 * Hook for fetching a single opportunity by ID from the API
 */
export function useOpportunityById<T extends BaseOpportunity>(
  opportunityType: SupportedOpportunityType,
  id: string | undefined,
) {
  const apiFunctions = API_FUNCTIONS[opportunityType]

  return useQuery({
    queryKey: [opportunityType.toLowerCase(), 'detail', id],
    queryFn: async (): Promise<T | null> => {
      if (!id) return null
      return (await apiFunctions.getById(id)) as T | null
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}
