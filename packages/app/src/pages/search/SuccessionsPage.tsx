import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback } from 'react'
import { OpportunitiesPage } from '@/components/opportunities/OpportunitiesPage'
import { BaseFilters } from '@/components/opportunities/OpportunityFilters'
import { useOpportunityData } from '@/hooks'
import { generateDummySuccessions, filterSuccessions } from '@/data'
import { OpportunityType, type Succession } from '@/types'
import type { BaseFilters as BaseFiltersType } from '@/schemas/filters.schema'

export function SuccessionsPage(): React.ReactElement {
  const filters = useSearch({ from: '/search/successions' })
  const navigate = useNavigate({ from: '/search/successions' })

  const { data, count, isDataLoading, isCountLoading } =
    useOpportunityData<Succession>({
      opportunityType: OpportunityType.SUCCESSION,
      filters,
      getDummyData: generateDummySuccessions,
      filterFn: filterSuccessions,
    })

  const handleFiltersChange = useCallback(
    (newFilters: BaseFiltersType) => {
      navigate({
        to: '/search/successions',
        search: newFilters,
      })
    },
    [navigate],
  )

  const handleExport = useCallback((format: 'csv' | 'xlsx') => {
    console.log('Exporting successions as', format)
    // TODO: Implement export functionality
  }, [])

  return (
    <OpportunitiesPage<Succession>
      data={data}
      count={count}
      isCountLoading={isCountLoading}
      isLoading={isDataLoading}
      opportunityType={OpportunityType.SUCCESSION}
      viewMode={filters.view ?? 'list'}
      onExport={handleExport}
      FiltersComponent={
        <BaseFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          title="Filtres successions"
        />
      }
    />
  )
}
