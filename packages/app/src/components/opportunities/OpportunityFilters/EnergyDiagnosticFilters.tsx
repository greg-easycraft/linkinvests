import { useLocation } from '@tanstack/react-router'
import type { EnergyDiagnosticFilters as EnergyDiagnosticFiltersType } from '@/schemas/filters.schema'
import type { EnergyClassType } from '@/types'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  DatePeriodFilter,
  DepartmentsFilter,
  EnergyClassFilter,
  OpportunityTypeFilter,
  ViewToggle,
  ZipCodeInput,
} from '@/components/filters'

interface EnergyDiagnosticFiltersProps {
  filters: EnergyDiagnosticFiltersType
  onFiltersChange: (filters: EnergyDiagnosticFiltersType) => void
}

export function EnergyDiagnosticFilters({
  filters,
  onFiltersChange,
}: EnergyDiagnosticFiltersProps): React.ReactElement {
  const location = useLocation()

  const handleChange = <TKey extends keyof EnergyDiagnosticFiltersType>(
    key: TKey,
    value: EnergyDiagnosticFiltersType[TKey],
  ) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <Card className="p-4 space-y-4 h-full overflow-y-auto">
      {/* Type Selector */}
      <OpportunityTypeFilter currentPath={location.pathname} />

      <Separator />

      {/* View Toggle */}
      <ViewToggle
        value={filters.view ?? 'list'}
        onValueChange={(v) => handleChange('view', v)}
      />

      <Separator />

      {/* Location Filters */}
      <DepartmentsFilter
        value={filters.departments}
        onValueChange={(v) => handleChange('departments', v)}
      />

      <ZipCodeInput
        value={filters.zipCodes}
        onValueChange={(v) => handleChange('zipCodes', v)}
      />

      <DatePeriodFilter
        value={filters.datePeriod}
        onValueChange={(v) => handleChange('datePeriod', v)}
      />

      <Separator />

      {/* Energy class filter - only E, F, G for energy sieves */}
      <EnergyClassFilter
        value={filters.energyClasses as Array<EnergyClassType> | undefined}
        onValueChange={(v) =>
          handleChange('energyClasses', v as typeof filters.energyClasses)
        }
        energySievesOnly
      />
    </Card>
  )
}
