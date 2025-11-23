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
        value={filters.priceRange}
        onChange={(value) => onFiltersChange({ ...filters, priceRange: value })}
      />

      <ReservePriceRangeFilter
        value={filters.reservePriceRange}
        onChange={(value) => onFiltersChange({ ...filters, reservePriceRange: value })}
      />

      <SquareFootageRangeFilter
        value={filters.squareFootageRange}
        onChange={(value) => onFiltersChange({ ...filters, squareFootageRange: value })}
      />

      <RoomsRangeFilter
        value={filters.roomsRange}
        onChange={(value) => onFiltersChange({ ...filters, roomsRange: value })}
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