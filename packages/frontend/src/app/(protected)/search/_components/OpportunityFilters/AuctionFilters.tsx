"use client";

import { OpportunityType } from "@linkinvests/shared";
import type { IAuctionFilters } from "~/types/filters";
import { BaseFilters } from "./BaseFilters";
import {
  PriceRangeFilter,
  ReservePriceRangeFilter,
  SquareFootageRangeFilter,
  RoomsRangeFilter,
  PropertyTypeFilter,
  OccupationStatusFilter,
  EnergyClassFilter,
} from "~/components/filters";
import { AUCTION_SORT_OPTIONS } from "~/constants/sort-options";

interface AuctionFiltersProps {
  filters: IAuctionFilters;
  onFiltersChange: (filters: IAuctionFilters) => void;
}

export function AuctionFilters({
  filters,
  onFiltersChange,
}: AuctionFiltersProps): React.ReactElement {

  const CustomFilters = (
    <>
      <OccupationStatusFilter
        value={filters.occupationStatuses}
        onChange={(value) => onFiltersChange({ ...filters, occupationStatuses: value })}
      />

      <PropertyTypeFilter
        value={filters.propertyTypes}
        onChange={(value) => onFiltersChange({ ...filters, propertyTypes: value })}
      />

      <PriceRangeFilter
        minValue={filters.minPrice}
        maxValue={filters.maxPrice}
        onMinChange={(value) => onFiltersChange({ ...filters, minPrice: value })}
        onMaxChange={(value) => onFiltersChange({ ...filters, maxPrice: value })}
      />

      <ReservePriceRangeFilter
        minValue={filters.minReservePrice}
        maxValue={filters.maxReservePrice}
        onMinChange={(value) => onFiltersChange({ ...filters, minReservePrice: value })}
        onMaxChange={(value) => onFiltersChange({ ...filters, maxReservePrice: value })}
      />

      <SquareFootageRangeFilter
        minValue={filters.minSquareFootage}
        maxValue={filters.maxSquareFootage}
        onMinChange={(value) => onFiltersChange({ ...filters, minSquareFootage: value })}
        onMaxChange={(value) => onFiltersChange({ ...filters, maxSquareFootage: value })}
      />

      <RoomsRangeFilter
        minValue={filters.minRooms}
        maxValue={filters.maxRooms}
        onMinChange={(value) => onFiltersChange({ ...filters, minRooms: value })}
        onMaxChange={(value) => onFiltersChange({ ...filters, maxRooms: value })}
      />
      <EnergyClassFilter
        value={filters.energyClasses}
        onChange={(value) => onFiltersChange({ ...filters, energyClasses: value })}
        type="all"
      />
    </>
  );

  return (
    <BaseFilters
      currentType={OpportunityType.AUCTION}
      filters={filters}
      onFiltersChange={onFiltersChange}
      ExtraFilters={CustomFilters}
      sortOptions={AUCTION_SORT_OPTIONS}
    />
  );
}