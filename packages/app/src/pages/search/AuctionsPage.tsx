import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback } from 'react'
import type { AuctionFilters as AuctionFiltersType } from '@/schemas/filters.schema'
import type {Auction} from '@/types';
import { OpportunitiesPage } from '@/components/opportunities/OpportunitiesPage'
import { AuctionFilters } from '@/components/opportunities/OpportunityFilters'
import { useOpportunityData } from '@/hooks'
import { filterAuctions, generateDummyAuctions } from '@/data'
import {  OpportunityType } from '@/types'

export function AuctionsPage(): React.ReactElement {
  const filters = useSearch({ from: '/search/auctions' })
  const navigate = useNavigate({ from: '/search/auctions' })

  const { data, count, isDataLoading, isCountLoading } =
    useOpportunityData<Auction>({
      opportunityType: OpportunityType.AUCTION,
      filters,
      getDummyData: generateDummyAuctions,
      filterFn: filterAuctions,
    })

  const handleFiltersChange = useCallback(
    (newFilters: AuctionFiltersType) => {
      navigate({
        to: '/search/auctions',
        search: newFilters,
      })
    },
    [navigate],
  )

  const handleExport = useCallback((format: 'csv' | 'xlsx') => {
    console.log('Exporting auctions as', format)
    // TODO: Implement export functionality
  }, [])

  return (
    <OpportunitiesPage<Auction>
      data={data}
      count={count}
      isCountLoading={isCountLoading}
      isLoading={isDataLoading}
      opportunityType={OpportunityType.AUCTION}
      viewMode={filters.view ?? 'list'}
      onExport={handleExport}
      FiltersComponent={
        <AuctionFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      }
    />
  )
}
