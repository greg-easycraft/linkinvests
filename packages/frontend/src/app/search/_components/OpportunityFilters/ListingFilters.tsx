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
  FeaturesFilter,
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
        value={filters.priceRange}
        onChange={(value) => onFiltersChange({ ...filters, priceRange: value })}
      />

      <SquareFootageRangeFilter
        value={filters.squareFootageRange}
        onChange={(value) => onFiltersChange({ ...filters, squareFootageRange: value })}
      />

      <LandAreaRangeFilter
        value={filters.landAreaRange}
        onChange={(value) => onFiltersChange({ ...filters, landAreaRange: value })}
      />

      <RoomsRangeFilter
        value={filters.roomsRange}
        onChange={(value) => onFiltersChange({ ...filters, roomsRange: value })}
      />

      <BedroomsRangeFilter
        value={filters.bedroomsRange}
        onChange={(value) => onFiltersChange({ ...filters, bedroomsRange: value })}
      />

      <ConstructionYearRangeFilter
        value={filters.constructionYearRange}
        onChange={(value) => onFiltersChange({ ...filters, constructionYearRange: value })}
      />

      <EnergyClassFilter
        value={filters.energyClasses}
        onChange={(value) => onFiltersChange({ ...filters, energyClasses: value })}
        type="all"
      />

      <FeaturesFilter
        value={filters.features}
        onChange={(value) => onFiltersChange({ ...filters, features: value })}
      />

      <div>
        <label className="text-sm font-medium mb-2 block font-heading">Sources</label>
        <SourcesInput
          value={filters.sources ?? []}
          onChange={(value) => onFiltersChange({ ...filters, sources: value })}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block font-heading">Type de vendeur</label>
        <SellerTypeFilter
          value={filters.sellerType}
          onChange={(value) => onFiltersChange({ ...filters, sellerType: value })}
        />
      </div>
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