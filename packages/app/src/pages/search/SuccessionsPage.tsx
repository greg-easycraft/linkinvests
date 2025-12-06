import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback } from 'react'
import type { BaseFilters as BaseFiltersType } from '@/schemas/filters.schema'
import type { Succession } from '@/types'
import { OpportunitiesPage } from '@/components/opportunities/OpportunitiesPage'
import { BaseFilters } from '@/components/opportunities/OpportunityFilters'
import { useOpportunityData } from '@/hooks'
import { OpportunityType } from '@/types'
import { DEFAULT_SORT_OPTIONS } from '@/constants/sort-options'

export function SuccessionsPage(): React.ReactElement {
  const filters = useSearch({ from: '/search/successions' })
  const navigate = useNavigate({ from: '/search/successions' })

  const { data, count, isDataLoading, isCountLoading } =
    useOpportunityData<Succession>({
      opportunityType: OpportunityType.SUCCESSION,
      filters,
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

  const handleSortChange = useCallback(
    (sortBy: string, sortOrder: 'asc' | 'desc') => {
      handleFiltersChange({ ...filters, sortBy, sortOrder, page: 1 })
    },
    [filters, handleFiltersChange],
  )

  return (
    <OpportunitiesPage<Succession>
      data={data}
      count={count}
      isCountLoading={isCountLoading}
      isLoading={isDataLoading}
      opportunityType={OpportunityType.SUCCESSION}
      viewMode={filters.view ?? 'list'}
      onExport={handleExport}
      sortOptions={DEFAULT_SORT_OPTIONS}
      currentSortBy={filters.sortBy}
      currentSortOrder={filters.sortOrder}
      onSortChange={handleSortChange}
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
