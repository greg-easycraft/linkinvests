import { useState } from 'react'
import { useLocation } from '@tanstack/react-router'
import type { BaseFilters as BaseFiltersType } from '@/schemas/filters.schema'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  DatePeriodFilter,
  DepartmentsFilter,
  OpportunityTypeFilter,
  ViewToggle,
  ZipCodeInput,
} from '@/components/filters'
import {
  SaveSearchModal,
  SavedSearchesSection,
} from '@/components/saved-searches'

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
  const location = useLocation()
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)

  const currentUrl = location.pathname + location.search

  const handleChange = <TKey extends keyof BaseFiltersType>(
    key: TKey,
    value: BaseFiltersType[TKey],
  ) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <Card className="p-4 space-y-4 h-full overflow-y-auto">
      {/* Type Selector */}
      <OpportunityTypeFilter currentPath={location.pathname} />

      <Separator />

      {/* Saved Searches */}
      <SavedSearchesSection
        onSaveCurrentSearch={() => setIsSaveModalOpen(true)}
      />

      <Separator />

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

      <ZipCodeInput
        value={filters.zipCodes}
        onValueChange={(v) => handleChange('zipCodes', v)}
      />

      <DatePeriodFilter
        value={filters.dateAfter}
        onValueChange={(v) => handleChange('dateAfter', v)}
        label="Période depuis"
      />

      <DatePeriodFilter
        value={filters.dateBefore}
        onValueChange={(v) => handleChange('dateBefore', v)}
        label="Période jusqu'à"
        placeholder="Jusqu'à maintenant"
      />

      {/* Save Search Modal */}
      <SaveSearchModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        currentUrl={currentUrl}
      />
    </Card>
  )
}
