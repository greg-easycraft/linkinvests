import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback } from 'react'
import type { EnergyDiagnosticFilters as EnergyDiagnosticFiltersType } from '@/schemas/filters.schema'
import type { EnergyDiagnostic } from '@/types'
import { OpportunitiesPage } from '@/components/opportunities/OpportunitiesPage'
import { EnergyDiagnosticFilters } from '@/components/opportunities/OpportunityFilters'
import { useOpportunityData } from '@/hooks'
import { OpportunityType } from '@/types'
import { DEFAULT_SORT_OPTIONS } from '@/constants/sort-options'
import { DEFAULT_PAGE_SIZE } from '@/constants'

export function EnergySievesPage(): React.ReactElement {
  const filters = useSearch({ from: '/search/energy-sieves' })
  const navigate = useNavigate({ from: '/search/energy-sieves' })

  const { data, count, isDataLoading, isCountLoading } =
    useOpportunityData<EnergyDiagnostic>({
      opportunityType: OpportunityType.ENERGY_SIEVE,
      filters,
    })

  const handleFiltersChange = useCallback(
    (newFilters: EnergyDiagnosticFiltersType) => {
      navigate({
        to: '/search/energy-sieves',
        search: newFilters,
      })
    },
    [navigate],
  )

  const handleExport = useCallback((format: 'csv' | 'xlsx') => {
    console.log('Exporting energy sieves as', format)
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
    <OpportunitiesPage<EnergyDiagnostic>
      data={data}
      count={count}
      isCountLoading={isCountLoading}
      isLoading={isDataLoading}
      opportunityType={OpportunityType.ENERGY_SIEVE}
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
        <EnergyDiagnosticFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      }
    />
  )
}
