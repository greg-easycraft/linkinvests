"use client";

import { OpportunityType } from "@linkinvests/shared";
import type { IListingFilters } from "~/types/filters";
import { BaseFilters } from "./BaseFilters";
import {
  PriceRangeFilter,
  SquareFootageRangeFilter,
  LandAreaRangeFilter,
  RoomsRangeFilter,
  BedroomsRangeFilter,
  ConstructionYearRangeFilter,
  PropertyTypeFilter,
  RentalStatusFilter,
  EnergyClassFilter,
  SourcesInput,
  SellerTypeFilter,
  DivisibleFilter,
  WorksRequiredFilter
} from "~/components/filters";
import { LISTING_SORT_OPTIONS } from "~/constants/sort-options";

interface ListingFiltersProps {
  filters: IListingFilters;
  onFiltersChange: (filters: IListingFilters) => void;
}


export function ListingFilters({
  filters,
  onFiltersChange,
}: ListingFiltersProps): React.ReactElement {

  const CustomFilters = (
    <>
      <SourcesInput
        value={filters.sources ?? []}
        onChange={(value) => onFiltersChange({ ...filters, sources: value })}
      />
      <SellerTypeFilter
        value={filters.sellerType}
        onChange={(value) => onFiltersChange({ ...filters, sellerType: value })}
      />
      <RentalStatusFilter
        value={filters.isSoldRented}
        onChange={(value) => onFiltersChange({ ...filters, isSoldRented: value })}
      />

      <DivisibleFilter
        value={filters.isDivisible}
        onChange={(value) => onFiltersChange({ ...filters, isDivisible: value })}
      />

      <WorksRequiredFilter
        value={filters.hasWorksRequired}
        onChange={(value) => onFiltersChange({ ...filters, hasWorksRequired: value })}
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

      <SquareFootageRangeFilter
        minValue={filters.minSquareFootage}
        maxValue={filters.maxSquareFootage}
        onMinChange={(value) => onFiltersChange({ ...filters, minSquareFootage: value })}
        onMaxChange={(value) => onFiltersChange({ ...filters, maxSquareFootage: value })}
      />

      <LandAreaRangeFilter
        minValue={filters.minLandArea}
        maxValue={filters.maxLandArea}
        onMinChange={(value) => onFiltersChange({ ...filters, minLandArea: value })}
        onMaxChange={(value) => onFiltersChange({ ...filters, maxLandArea: value })}
      />

      <RoomsRangeFilter
        minValue={filters.minRooms}
        maxValue={filters.maxRooms}
        onMinChange={(value) => onFiltersChange({ ...filters, minRooms: value })}
        onMaxChange={(value) => onFiltersChange({ ...filters, maxRooms: value })}
      />

      <BedroomsRangeFilter
        minValue={filters.minBedrooms}
        maxValue={filters.maxBedrooms}
        onMinChange={(value) => onFiltersChange({ ...filters, minBedrooms: value })}
        onMaxChange={(value) => onFiltersChange({ ...filters, maxBedrooms: value })}
      />

      <ConstructionYearRangeFilter
        minValue={filters.minConstructionYear}
        maxValue={filters.maxConstructionYear}
        onMinChange={(value) => onFiltersChange({ ...filters, minConstructionYear: value })}
        onMaxChange={(value) => onFiltersChange({ ...filters, maxConstructionYear: value })}
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
      currentType={OpportunityType.REAL_ESTATE_LISTING}
      filters={filters}
      onFiltersChange={onFiltersChange}
      ExtraFilters={CustomFilters}
      sortOptions={LISTING_SORT_OPTIONS}
    />
  );
}