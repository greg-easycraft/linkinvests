import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback } from 'react'
import { OpportunitiesPage } from '@/components/opportunities/OpportunitiesPage'
import { ListingFilters } from '@/components/opportunities/OpportunityFilters'
import { useOpportunityData } from '@/hooks'
import { generateDummyListings, filterListings } from '@/data'
import { OpportunityType, type Listing } from '@/types'
import type { ListingFilters as ListingFiltersType } from '@/schemas/filters.schema'

export function ListingsPage(): React.ReactElement {
  const filters = useSearch({ from: '/search/listings' })
  const navigate = useNavigate({ from: '/search/listings' })

  const { data, count, isDataLoading, isCountLoading } =
    useOpportunityData<Listing>({
      opportunityType: OpportunityType.REAL_ESTATE_LISTING,
      filters,
      getDummyData: generateDummyListings,
      filterFn: filterListings,
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

  return (
    <OpportunitiesPage<Listing>
      data={data}
      count={count}
      isCountLoading={isCountLoading}
      isLoading={isDataLoading}
      opportunityType={OpportunityType.REAL_ESTATE_LISTING}
      viewMode={filters.view ?? 'list'}
      onExport={handleExport}
      FiltersComponent={
        <ListingFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      }
    />
  )
}
