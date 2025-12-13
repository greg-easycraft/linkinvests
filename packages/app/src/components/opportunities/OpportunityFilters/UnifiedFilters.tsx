import { useMemo, useState } from 'react'
import { useLocation } from '@tanstack/react-router'
import type { UnifiedSearchFilters } from '@/schemas/filters.schema'
import type { EnergyClassType } from '@linkinvests/shared'
import { OpportunityType } from '@linkinvests/shared'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  DatePeriodFilter,
  DepartmentsFilter,
  EnergyClassFilter,
  OccupationStatusFilter,
  OpportunityTypeMultiSelect,
  PriceRangeFilter,
  PropertyTypeFilter,
  RoomsRangeFilter,
  SquareFootageRangeFilter,
  ZipCodeInput,
} from '@/components/filters'
import {
  SaveSearchModal,
  SavedSearchesSection,
} from '@/components/saved-searches'

// Define which filters are available for each opportunity type
const FILTER_AVAILABILITY: Record<OpportunityType, Set<string>> = {
  [OpportunityType.AUCTION]: new Set([
    'propertyTypes',
    'squareFootage',
    'price',
    'reservePrice',
    'energyClass',
    'rooms',
    'occupationStatus',
  ]),
  [OpportunityType.REAL_ESTATE_LISTING]: new Set([
    'propertyTypes',
    'squareFootage',
    'price',
    'energyClass',
    'rooms',
  ]),
  [OpportunityType.ENERGY_SIEVE]: new Set(['squareFootage', 'energyClass']),
  [OpportunityType.SUCCESSION]: new Set([]), // base only
  [OpportunityType.LIQUIDATION]: new Set([]), // base only
  [OpportunityType.DIVORCE]: new Set([]), // base only
}

/**
 * Get available filters based on intersection of selected types
 */
function getAvailableFilters(types: Array<OpportunityType>): Set<string> {
  // Empty array means all types = base filters only
  if (types.length === 0) {
    return new Set()
  }

  // Single type = all filters for that type
  if (types.length === 1) {
    return FILTER_AVAILABILITY[types[0]]
  }

  // Multiple types = intersection
  return types.reduce((intersection, type, index) => {
    if (index === 0) return new Set(FILTER_AVAILABILITY[type])
    const typeFilters = FILTER_AVAILABILITY[type]
    return new Set([...intersection].filter((f) => typeFilters.has(f)))
  }, new Set<string>())
}

interface UnifiedFiltersProps {
  filters: UnifiedSearchFilters
  onFiltersChange: (filters: UnifiedSearchFilters) => void
}

export function UnifiedFilters({
  filters,
  onFiltersChange,
}: UnifiedFiltersProps): React.ReactElement {
  const location = useLocation()
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)

  const currentUrl = location.pathname + location.search

  const selectedTypes = filters.types ?? []
  const isSingleType = selectedTypes.length === 1
  const availableFilters = useMemo(
    () => getAvailableFilters(selectedTypes),
    [selectedTypes],
  )

  const handleChange = <TKey extends keyof UnifiedSearchFilters>(
    key: TKey,
    value: UnifiedSearchFilters[TKey],
  ) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const handleTypesChange = (types: Array<OpportunityType> | undefined) => {
    // When types change, we need to clear filters that are no longer applicable
    const newTypes = types ?? []
    const newAvailableFilters = getAvailableFilters(newTypes)

    const cleanedFilters: UnifiedSearchFilters = {
      ...filters,
      types,
    }

    // Clear filters that are no longer available
    if (!newAvailableFilters.has('price')) {
      cleanedFilters.minPrice = undefined
      cleanedFilters.maxPrice = undefined
    }
    if (!newAvailableFilters.has('reservePrice')) {
      cleanedFilters.minReservePrice = undefined
      cleanedFilters.maxReservePrice = undefined
    }
    if (!newAvailableFilters.has('squareFootage')) {
      cleanedFilters.minSquareFootage = undefined
      cleanedFilters.maxSquareFootage = undefined
    }
    if (!newAvailableFilters.has('rooms')) {
      cleanedFilters.minRooms = undefined
      cleanedFilters.maxRooms = undefined
    }
    if (!newAvailableFilters.has('energyClass')) {
      cleanedFilters.energyClasses = undefined
    }
    if (!newAvailableFilters.has('propertyTypes')) {
      cleanedFilters.propertyTypes = undefined
    }
    if (!newAvailableFilters.has('occupationStatus')) {
      cleanedFilters.occupationStatuses = undefined
    }

    onFiltersChange(cleanedFilters)
  }

  return (
    <Card className="p-4 space-y-4 h-full overflow-y-auto">
      {/* Type Multi-Selector */}
      <OpportunityTypeMultiSelect
        selectedTypes={selectedTypes}
        onTypesChange={handleTypesChange}
      />

      <Separator />

      {/* Saved Searches */}
      <SavedSearchesSection
        onSaveCurrentSearch={() => setIsSaveModalOpen(true)}
      />

      <Separator />

      {/* Base Filters - Always shown */}
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

      {/* Conditional Filters based on type intersection */}
      {availableFilters.size > 0 && <Separator />}

      {availableFilters.has('propertyTypes') && (
        <PropertyTypeFilter
          value={filters.propertyTypes}
          onValueChange={(v) => handleChange('propertyTypes', v)}
        />
      )}

      {availableFilters.has('price') && (
        <PriceRangeFilter
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onMinPriceChange={(v) => handleChange('minPrice', v)}
          onMaxPriceChange={(v) => handleChange('maxPrice', v)}
        />
      )}

      {availableFilters.has('reservePrice') && isSingleType && (
        <PriceRangeFilter
          label="Prix de réserve"
          minPrice={filters.minReservePrice}
          maxPrice={filters.maxReservePrice}
          onMinPriceChange={(v) => handleChange('minReservePrice', v)}
          onMaxPriceChange={(v) => handleChange('maxReservePrice', v)}
        />
      )}

      {availableFilters.has('squareFootage') && (
        <SquareFootageRangeFilter
          minSquareFootage={filters.minSquareFootage}
          maxSquareFootage={filters.maxSquareFootage}
          onMinChange={(v) => handleChange('minSquareFootage', v)}
          onMaxChange={(v) => handleChange('maxSquareFootage', v)}
        />
      )}

      {availableFilters.has('rooms') && (
        <RoomsRangeFilter
          minRooms={filters.minRooms}
          maxRooms={filters.maxRooms}
          onMinChange={(v) => handleChange('minRooms', v)}
          onMaxChange={(v) => handleChange('maxRooms', v)}
        />
      )}

      {availableFilters.has('occupationStatus') && isSingleType && (
        <OccupationStatusFilter
          value={filters.occupationStatuses}
          onValueChange={(v) => handleChange('occupationStatuses', v)}
        />
      )}

      {availableFilters.has('energyClass') && (
        <EnergyClassFilter
          value={filters.energyClasses as Array<EnergyClassType> | undefined}
          onValueChange={(v) => handleChange('energyClasses', v)}
        />
      )}

      {/* Save Search Modal */}
      <SaveSearchModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        currentUrl={currentUrl}
      />
    </Card>
  )
}
