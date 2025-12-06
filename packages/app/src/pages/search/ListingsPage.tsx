import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback } from 'react'
import type { ListingFilters as ListingFiltersType } from '@/schemas/filters.schema'
import type { Listing } from '@/types'
import { OpportunitiesPage } from '@/components/opportunities/OpportunitiesPage'
import { ListingFilters } from '@/components/opportunities/OpportunityFilters'
import { useOpportunityData } from '@/hooks'
import { OpportunityType } from '@/types'
import { LISTING_SORT_OPTIONS } from '@/constants/sort-options'
import { DEFAULT_PAGE_SIZE } from '@/constants'

export function ListingsPage(): React.ReactElement {
  const filters = useSearch({ from: '/search/listings' })
  const navigate = useNavigate({ from: '/search/listings' })

  const { data, count, isDataLoading, isCountLoading } =
    useOpportunityData<Listing>({
      opportunityType: OpportunityType.REAL_ESTATE_LISTING,
      filters,
    })

  const handleFiltersChange = useCallback(
    (newFilters: ListingFiltersType) => {
      navigate({
        to: '/search/listings',
        search: newFilters,
      })
    },
    [navigate],
  )

  const handleExport = useCallback((format: 'csv' | 'xlsx') => {
    console.log('Exporting listings as', format)
    // TODO: Implement export functionality
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
    <OpportunitiesPage<Listing>
      data={data}
      count={count}
      isCountLoading={isCountLoading}
      isLoading={isDataLoading}
      opportunityType={OpportunityType.REAL_ESTATE_LISTING}
      viewMode={filters.view ?? 'list'}
      onExport={handleExport}
      sortOptions={LISTING_SORT_OPTIONS}
      currentSortBy={filters.sortBy}
      currentSortOrder={filters.sortOrder}
      onSortChange={handleSortChange}
      currentPage={filters.page ?? 1}
      pageSize={filters.pageSize ?? DEFAULT_PAGE_SIZE}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      FiltersComponent={
        <ListingFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      }
    />
  )
}
