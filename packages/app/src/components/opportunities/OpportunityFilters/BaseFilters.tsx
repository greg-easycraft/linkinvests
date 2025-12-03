import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  ViewToggle,
  DepartmentsFilter,
  DatePeriodFilter,
} from '@/components/filters'
import type { BaseFilters as BaseFiltersType } from '@/schemas/filters.schema'

interface BaseFiltersProps {
  filters: BaseFiltersType
  onFiltersChange: (filters: BaseFiltersType) => void
  title?: string
}

/**
 * Base filters component used for opportunity types without specific filters
 * (Successions, Liquidations)
 */
export function BaseFilters({
  filters,
  onFiltersChange,
  title,
}: BaseFiltersProps): React.ReactElement {
  const handleChange = <K extends keyof BaseFiltersType>(
    key: K,
    value: BaseFiltersType[K],
  ) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <Card className="p-4 space-y-4 h-full overflow-y-auto">
      {title && (
        <>
          <h2 className="font-semibold">{title}</h2>
          <Separator />
        </>
      )}

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
    </Card>
  )
}
