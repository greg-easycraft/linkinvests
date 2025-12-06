import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback } from 'react'
import type { BaseFilters as BaseFiltersType } from '@/schemas/filters.schema'
import type { Liquidation } from '@/types'
import { OpportunitiesPage } from '@/components/opportunities/OpportunitiesPage'
import { BaseFilters } from '@/components/opportunities/OpportunityFilters'
import { useOpportunityData } from '@/hooks'
import { OpportunityType } from '@/types'
import { DEFAULT_SORT_OPTIONS } from '@/constants/sort-options'
import { DEFAULT_PAGE_SIZE } from '@/constants'

export function LiquidationsPage(): React.ReactElement {
  const filters = useSearch({ from: '/search/liquidations' })
  const navigate = useNavigate({ from: '/search/liquidations' })

  const { data, count, isDataLoading, isCountLoading } =
    useOpportunityData<Liquidation>({
      opportunityType: OpportunityType.LIQUIDATION,
      filters,
    })

  const handleFiltersChange = useCallback(
    (newFilters: BaseFiltersType) => {
      navigate({
        to: '/search/liquidations',
        search: newFilters,
      })
    },
    [navigate],
  )

  const handleExport = useCallback((format: 'csv' | 'xlsx') => {
    console.log('Exporting liquidations as', format)
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
    <OpportunitiesPage<Liquidation>
      data={data}
      count={count}
      isCountLoading={isCountLoading}
      isLoading={isDataLoading}
      opportunityType={OpportunityType.LIQUIDATION}
      viewMode={filters.view ?? 'list'}
      onExport={handleExport}
      sortOptions={DEFAULT_SORT_OPTIONS}
      currentSortBy={filters.sortBy}
      currentSortOrder={filters.sortOrder}
      onSortChange={handleSortChange}
      currentPage={filters.page ?? 1}
      pageSize={filters.pageSize ?? DEFAULT_PAGE_SIZE}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      FiltersComponent={
        <BaseFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          title="Filtres liquidations"
        />
      }
    />
  )
}
