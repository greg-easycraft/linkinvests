'use client';

import { OpportunityType } from "@linkinvests/shared";
import { getAuctionById, getAuctionsData, getAuctionsCount, exportAuctions } from "~/app/_actions/auctions/queries";
import OpportunitiesPage from "../components/OpportunitiesPage";
import { AuctionFilters } from "../components/AuctionFilters";
import { useMutation } from "@tanstack/react-query";
import { useQueryParamFilters } from "~/hooks/useQueryParamFilters";
import { useOpportunityData } from "~/hooks/useOpportunityData";
import type { ExportFormat } from "~/server/services/export.service";
import type { OpportunityFilters } from "~/types/filters";

export default function AuctionsPageContent(): React.ReactElement {
  // Use query param hook for filters and view type
  const { filters: appliedFilters, viewType, setFilters: setAppliedFilters, setViewType } =
    useQueryParamFilters(OpportunityType.AUCTION);

  // Use unified data fetching - single queries for both list and map views
  const {
    data,
    count,
    isCountLoading,
    isLoading
  } = useOpportunityData(
    OpportunityType.AUCTION,
    appliedFilters,
    getAuctionsData,
    getAuctionsCount
  );


  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async ({ format, filters }: { format: ExportFormat; filters: OpportunityFilters }) => {
      return await exportAuctions(filters, format);
    },
  });

  return (
    <OpportunitiesPage
      data={data}
      count={count}
      isCountLoading={isCountLoading}
      isLoading={isLoading}
      getOpportunityById={getAuctionById}
      viewType={viewType}
      onViewTypeChange={setViewType}
      currentFilters={appliedFilters}
      onFiltersChange={setAppliedFilters}
      opportunityType={OpportunityType.AUCTION}
      exportMutation={exportMutation}
      FiltersComponent={AuctionFilters}
    />
  );
}