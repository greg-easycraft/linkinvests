"use client";

import { OpportunityType } from "@linkinvests/shared";
import type { AuctionFilters as IAuctionFilters } from "~/types/filters";
import { BaseFilters } from "./BaseFilters";
import {
  PriceRangeFilter,
  ReservePriceRangeFilter,
  SquareFootageRangeFilter,
  RoomsRangeFilter,
  PropertyTypeFilter,
  RentalStatusFilter,
  AuctionTypeFilter,
} from "~/components/filters";

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
      <AuctionTypeFilter
        value={filters.auctionTypes}
        onChange={(value) => onFiltersChange({ ...filters, auctionTypes: value })}
      />

      <RentalStatusFilter
        value={filters.isSoldRented}
        onChange={(value) => onFiltersChange({ ...filters, isSoldRented: value })}
      />

      <PropertyTypeFilter
        value={filters.propertyTypes}
        onChange={(value) => onFiltersChange({ ...filters, propertyTypes: value })}
        type="auction"
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
    </>
  );

  return (
    <BaseFilters
      currentType={OpportunityType.AUCTION}
      filters={filters}
      onFiltersChange={onFiltersChange}
      ExtraFilters={CustomFilters}
    />
  );
}