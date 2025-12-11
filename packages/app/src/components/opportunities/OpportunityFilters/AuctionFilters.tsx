import { useState } from 'react'
import { useLocation } from '@tanstack/react-router'
import type { AuctionFilters as AuctionFiltersType } from '@/schemas/filters.schema'
import type { EnergyClassType } from '@/types'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  DatePeriodFilter,
  DepartmentsFilter,
  EnergyClassFilter,
  OccupationStatusFilter,
  OpportunityTypeFilter,
  PriceRangeFilter,
  PropertyTypeFilter,
  RoomsRangeFilter,
  SquareFootageRangeFilter,
  ViewToggle,
  ZipCodeInput,
} from '@/components/filters'
import {
  SaveSearchModal,
  SavedSearchesSection,
} from '@/components/saved-searches'

interface AuctionFiltersProps {
  filters: AuctionFiltersType
  onFiltersChange: (filters: AuctionFiltersType) => void
}

export function AuctionFilters({
  filters,
  onFiltersChange,
}: AuctionFiltersProps): React.ReactElement {
  const location = useLocation()
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const currentUrl = location.href

  const handleChange = <TKey extends keyof AuctionFiltersType>(
    key: TKey,
    value: AuctionFiltersType[TKey],
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

      <Separator />

      {/* Property Filters */}
      <PropertyTypeFilter
        value={filters.propertyTypes}
        onValueChange={(v) => handleChange('propertyTypes', v)}
      />

      <PriceRangeFilter
        label="Prix actuel"
        minPrice={filters.minPrice}
        maxPrice={filters.maxPrice}
        onMinPriceChange={(v) => handleChange('minPrice', v)}
        onMaxPriceChange={(v) => handleChange('maxPrice', v)}
      />

      <PriceRangeFilter
        label="Prix de réserve"
        minPrice={filters.minReservePrice}
        maxPrice={filters.maxReservePrice}
        onMinPriceChange={(v) => handleChange('minReservePrice', v)}
        onMaxPriceChange={(v) => handleChange('maxReservePrice', v)}
      />

      <SquareFootageRangeFilter
        minSquareFootage={filters.minSquareFootage}
        maxSquareFootage={filters.maxSquareFootage}
        onMinChange={(v) => handleChange('minSquareFootage', v)}
        onMaxChange={(v) => handleChange('maxSquareFootage', v)}
      />

      <RoomsRangeFilter
        minRooms={filters.minRooms}
        maxRooms={filters.maxRooms}
        onMinChange={(v) => handleChange('minRooms', v)}
        onMaxChange={(v) => handleChange('maxRooms', v)}
      />

      <Separator />

      {/* Additional Filters */}
      <OccupationStatusFilter
        value={filters.occupationStatuses}
        onValueChange={(v) => handleChange('occupationStatuses', v)}
      />

      <EnergyClassFilter
        value={filters.energyClasses as Array<EnergyClassType> | undefined}
        onValueChange={(v) => handleChange('energyClasses', v)}
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
