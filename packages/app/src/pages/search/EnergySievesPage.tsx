import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback } from 'react'
import { OpportunitiesPage } from '@/components/opportunities/OpportunitiesPage'
import { EnergyDiagnosticFilters } from '@/components/opportunities/OpportunityFilters'
import { useOpportunityData } from '@/hooks'
import { generateDummyEnergySieves, filterEnergySieves } from '@/data'
import { OpportunityType, type EnergyDiagnostic } from '@/types'
import type { EnergyDiagnosticFilters as EnergyDiagnosticFiltersType } from '@/schemas/filters.schema'

export function EnergySievesPage(): React.ReactElement {
  const filters = useSearch({ from: '/search/energy-sieves' })
  const navigate = useNavigate({ from: '/search/energy-sieves' })

  const { data, count, isDataLoading, isCountLoading } =
    useOpportunityData<EnergyDiagnostic>({
      opportunityType: OpportunityType.ENERGY_SIEVE,
      filters,
      getDummyData: generateDummyEnergySieves,
      filterFn: filterEnergySieves,
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

  return (
    <OpportunitiesPage<EnergyDiagnostic>
      data={data}
      count={count}
      isCountLoading={isCountLoading}
      isLoading={isDataLoading}
      opportunityType={OpportunityType.ENERGY_SIEVE}
      viewMode={filters.view ?? 'list'}
      onExport={handleExport}
      FiltersComponent={
        <EnergyDiagnosticFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      }
    />
  )
}
