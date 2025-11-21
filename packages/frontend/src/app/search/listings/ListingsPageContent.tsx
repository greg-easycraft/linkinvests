'use client';

import { OpportunityType } from "@linkinvests/shared";
import { getListingById, getListingsData, getListingsCount, exportListings } from "~/app/_actions/listings/queries";
import OpportunitiesPage from "../_components/OpportunitiesPage";
import { ListingFilters } from "../_components/OpportunityFilters/ListingFilters";
import { useQueryParamFilters } from "~/hooks/useQueryParamFilters";
import { useOpportunityData } from "~/hooks/useOpportunityData";
import type { ExportFormat } from "~/server/services/export.service";
import { useCallback } from "react";
import { listingFiltersSchema } from "~/utils/filters/filters.schema";

export default function ListingsPageContent(): React.ReactElement {
  // Use query param hook for filters and view type
  const { currentFilters, debouncedFilters, setFilters: setAppliedFilters } =
    useQueryParamFilters(listingFiltersSchema);

  // Use unified data fetching - single queries for both list and map views
  const {
    data,
    count,
    isCountLoading,
    isDataLoading
  } = useOpportunityData(
    OpportunityType.REAL_ESTATE_LISTING,
    debouncedFilters,
    getListingsData,
    getListingsCount
  );

  const handleExport = useCallback(async (format: ExportFormat) => {
    const result = await exportListings(currentFilters, format);
    return result;
  }, [currentFilters]);

  return (
    <OpportunitiesPage
      data={data}
      count={count}
      isCountLoading={isCountLoading}
      isLoading={isDataLoading}
      getOpportunityById={getListingById}
      opportunityType={OpportunityType.REAL_ESTATE_LISTING}
      onExport={handleExport}
      FiltersComponent={
        <ListingFilters
          filters={currentFilters}
          onFiltersChange={setAppliedFilters}
        />
      }
    />
  );
}