'use client';

import { OpportunityType } from "@linkinvests/shared";
import { getAuctionById, getAuctionsData, getAuctionsCount, exportAuctions } from "~/app/_actions/auctions/queries";
import OpportunitiesPage from "../_components/OpportunitiesPage";
import { AuctionFilters } from "../_components/OpportunityFilters/AuctionFilters";
import { useQueryParamFilters } from "~/hooks/useQueryParamFilters";
import { useOpportunityData } from "~/hooks/useOpportunityData";
import type { ExportFormat } from "~/server/services/export.service";
import { useCallback } from "react";
import { auctionFiltersSchema } from "~/utils/filters/filters.schema";

export default function AuctionsPageContent(): React.ReactElement {
  // Use query param hook for filters and view type
  const { filters: appliedFilters, setFilters: setAppliedFilters } =
    useQueryParamFilters(auctionFiltersSchema);
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

  const handleExport = useCallback(async (format: ExportFormat) => {
    const result = await exportAuctions(appliedFilters, format);
    return result;
  }, [appliedFilters]);

  return (
    <OpportunitiesPage
      data={data}
      count={count}
      isCountLoading={isCountLoading}
      isLoading={isLoading}
      getOpportunityById={getAuctionById}
      opportunityType={OpportunityType.AUCTION}
      onExport={handleExport}
      FiltersComponent={
        <AuctionFilters 
          filters={appliedFilters} 
          onFiltersChange={setAppliedFilters}
        />
      }
    />
  );
}