'use client';

import { OpportunityType } from "@linkinvests/shared";
import { getListingById, getListingsData, getListingsCount, exportListings } from "~/app/_actions/listings/queries";
import OpportunitiesPage from "../components/OpportunitiesPage";
import { ListingFilters } from "../components/OpportunityFilters/ListingFilters";
import { useMutation } from "@tanstack/react-query";
import { useQueryParamFilters } from "~/hooks/useQueryParamFilters";
import { useOpportunityData } from "~/hooks/useOpportunityData";
import type { ExportFormat } from "~/server/services/export.service";
import type { OpportunityFilters } from "~/types/filters";

export default function ListingsPageContent(): React.ReactElement {
  // Use query param hook for filters and view type
  const { filters: appliedFilters, viewType, setFilters: setAppliedFilters, setViewType } =
    useQueryParamFilters(OpportunityType.REAL_ESTATE_LISTING);

  // Use unified data fetching - single queries for both list and map views
  const {
    data,
    count,
    isCountLoading,
    isLoading
  } = useOpportunityData(
    OpportunityType.REAL_ESTATE_LISTING,
    appliedFilters,
    getListingsData,
    getListingsCount
  );

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async ({ format, filters }: { format: ExportFormat; filters: OpportunityFilters }) => {
      return await exportListings(filters, format);
    },
  });

  return (
    <OpportunitiesPage
      data={data}
      count={count}
      isCountLoading={isCountLoading}
      isLoading={isLoading}
      getOpportunityById={getListingById}
      viewType={viewType}
      onViewTypeChange={setViewType}
      currentFilters={appliedFilters}
      onFiltersChange={setAppliedFilters}
      opportunityType={OpportunityType.REAL_ESTATE_LISTING}
      exportMutation={exportMutation}
      FiltersComponent={ListingFilters}
    />
  );
}