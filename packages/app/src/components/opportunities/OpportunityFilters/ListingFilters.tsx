import { useLocation } from '@tanstack/react-router'
import type { ListingFilters as ListingFiltersType } from '@/schemas/filters.schema'
import type { EnergyClassType } from '@/types'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  DatePeriodFilter,
  DepartmentsFilter,
  EnergyClassFilter,
  OpportunityTypeFilter,
  PriceRangeFilter,
  PropertyTypeFilter,
  RoomsRangeFilter,
  SquareFootageRangeFilter,
  ViewToggle,
  ZipCodeInput,
} from '@/components/filters'

interface ListingFiltersProps {
  filters: ListingFiltersType
  onFiltersChange: (filters: ListingFiltersType) => void
}

export function ListingFilters({
  filters,
  onFiltersChange,
}: ListingFiltersProps): React.ReactElement {
  const location = useLocation()

  const handleChange = <TKey extends keyof ListingFiltersType>(
    key: TKey,
    value: ListingFiltersType[TKey],
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

      {/* Property Filters */}
      <PropertyTypeFilter
        value={filters.propertyTypes}
        onValueChange={(v) => handleChange('propertyTypes', v)}
      />

      <PriceRangeFilter
        minPrice={filters.minPrice}
        maxPrice={filters.maxPrice}
        onMinPriceChange={(v) => handleChange('minPrice', v)}
        onMaxPriceChange={(v) => handleChange('maxPrice', v)}
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
      <EnergyClassFilter
        value={filters.energyClasses as Array<EnergyClassType> | undefined}
        onValueChange={(v) => handleChange('energyClasses', v)}
      />
    </Card>
  )
}
