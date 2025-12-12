import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback, useMemo } from 'react'
import type { UnifiedSearchFilters } from '@/schemas/filters.schema'
import type { AllOpportunity, BaseOpportunity } from '@/types'
import type {SortOption} from '@/constants/sort-options';
import { OpportunitiesPage } from '@/components/opportunities/OpportunitiesPage'
import { UnifiedFilters } from '@/components/opportunities/OpportunityFilters'
import { useUnifiedOpportunityData } from '@/hooks'
import { OpportunityType } from '@/types'
import {
  AUCTION_SORT_OPTIONS,
  DEFAULT_SORT_OPTIONS,
  LISTING_SORT_OPTIONS
  
} from '@/constants/sort-options'
import { DEFAULT_PAGE_SIZE } from '@/constants'

// Get sort options based on selected types
function getSortOptions(selectedTypes: Array<OpportunityType>): Array<SortOption> {
  // If all types or no specific type, use default sort options
  if (selectedTypes.length === 0 || selectedTypes.length > 1) {
    return DEFAULT_SORT_OPTIONS
  }

  // Single type - use type-specific sort options
  const type = selectedTypes[0]
  switch (type) {
    case OpportunityType.AUCTION:
      return AUCTION_SORT_OPTIONS
    case OpportunityType.REAL_ESTATE_LISTING:
      return LISTING_SORT_OPTIONS
    default:
      return DEFAULT_SORT_OPTIONS
  }
}

export function UnifiedSearchPage(): React.ReactElement {
  const filters = useSearch({ from: '/search' })
  const navigate = useNavigate({ from: '/search' })

  const { data, count, isDataLoading, isCountLoading, isSingleType, selectedTypes } =
    useUnifiedOpportunityData({
      filters,
    })

  const sortOptions = useMemo(
    () => getSortOptions(selectedTypes),
    [selectedTypes],
  )

  // Determine opportunity type for display (single type or undefined for "all")
  const displayType = isSingleType ? selectedTypes[0] : undefined

  const handleFiltersChange = useCallback(
    (newFilters: UnifiedSearchFilters) => {
      navigate({
        to: '/search',
        search: newFilters,
      })
    },
    [navigate],
  )

  const handleExport = useCallback((format: 'csv' | 'xlsx') => {
    console.log('Exporting opportunities as', format)
    // TODO: Implement export functionality for unified search
  }, [])

  const handleSortChange = useCallback(
    (sortBy: string, sortOrder: 'asc' | 'desc') => {
      handleFiltersChange({ ...filters, sortBy, sortOrder, page: 1 })
    },
    [filters, handleFiltersChange],
  )

  const handlePageChange = useCallback(
    (page: number) => {
      handleFiltersChange({ ...filters, page })
    },
    [filters, handleFiltersChange],
  )

  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      handleFiltersChange({ ...filters, pageSize, page: 1 })
    },
    [filters, handleFiltersChange],
  )

  return (
    <OpportunitiesPage<BaseOpportunity | AllOpportunity>
      data={data}
      count={count}
      isCountLoading={isCountLoading}
      isLoading={isDataLoading}
      opportunityType={displayType}
      viewMode={filters.view ?? 'list'}
      onExport={handleExport}
      sortOptions={sortOptions}
      currentSortBy={filters.sortBy}
      currentSortOrder={filters.sortOrder}
      onSortChange={handleSortChange}
      currentPage={filters.page ?? 1}
      pageSize={filters.pageSize ?? DEFAULT_PAGE_SIZE}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      FiltersComponent={
        <UnifiedFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      }
    />
  )
}
