import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  ViewToggle,
  DepartmentsFilter,
  DatePeriodFilter,
  EnergyClassFilter,
} from '@/components/filters'
import type { EnergyDiagnosticFilters as EnergyDiagnosticFiltersType } from '@/schemas/filters.schema'

interface EnergyDiagnosticFiltersProps {
  filters: EnergyDiagnosticFiltersType
  onFiltersChange: (filters: EnergyDiagnosticFiltersType) => void
}

export function EnergyDiagnosticFilters({
  filters,
  onFiltersChange,
}: EnergyDiagnosticFiltersProps): React.ReactElement {
  const handleChange = <K extends keyof EnergyDiagnosticFiltersType>(
    key: K,
    value: EnergyDiagnosticFiltersType[K],
  ) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <Card className="p-4 space-y-4 h-full overflow-y-auto">
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

      <DatePeriodFilter
        value={filters.datePeriod}
        onValueChange={(v) => handleChange('datePeriod', v)}
      />

      <Separator />

      {/* Energy class filter - only E, F, G for energy sieves */}
      <EnergyClassFilter
        value={
          filters.energyClasses as
            | import('@/types').EnergyClassType[]
            | undefined
        }
        onValueChange={(v) =>
          handleChange('energyClasses', v as typeof filters.energyClasses)
        }
        energySievesOnly
      />
    </Card>
  )
}
