"use client";

import { OpportunityType } from "@linkinvests/shared";
import type { ListingFilters as IListingFilters } from "~/types/filters";
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
  SellerTypeFilter
} from "~/components/filters";

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
      <div>
        <label className="text-sm font-medium mb-2 block font-heading">Sources</label>
        <SourcesInput
          value={filters.sources ?? []}
          onChange={(value) => onFiltersChange({ ...filters, sources: value })}
        />
      </div>
      <SellerTypeFilter
        value={filters.sellerType}
        onChange={(value) => onFiltersChange({ ...filters, sellerType: value })}
      />
      <RentalStatusFilter
        value={filters.isSoldRented}
        onChange={(value) => onFiltersChange({ ...filters, isSoldRented: value })}
      />

      <PropertyTypeFilter
        value={filters.propertyTypes}
        onChange={(value) => onFiltersChange({ ...filters, propertyTypes: value })}
        type="listing"
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
    />
  );
}