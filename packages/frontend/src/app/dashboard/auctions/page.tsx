'use client';

import { OpportunityType } from "@linkinvests/shared";
import { getAuctionById, getAuctions, getAuctionsForMap, exportAuctions } from "~/app/_actions/auctions/queries";
import OpportunitiesPage from "../components/OpportunitiesPage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useQueryParamFilters } from "~/hooks/useQueryParamFilters";
import type { ExportFormat } from "~/server/services/export.service";
import type { OpportunityFilters } from "~/types/filters";

export default function AuctionsPage(): React.ReactElement {
  // Use query param hook instead of useState for filters and view type
  const { filters: appliedFilters, viewType, setFilters: setAppliedFilters, setViewType } =
    useQueryParamFilters(OpportunityType.AUCTION);

  const listQuery = useQuery({
    queryKey: ['auctions', "list", appliedFilters],
    queryFn: () => getAuctions(appliedFilters),
    enabled: viewType === "list",
  });

  // Query for map view - using type-specific query
  const mapQuery = useQuery({
    queryKey: ['auctions', "map", appliedFilters],
    queryFn: () => getAuctionsForMap(appliedFilters),
    enabled: viewType === "map",
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async ({ format, filters }: { format: ExportFormat; filters: OpportunityFilters }) => {
      return await exportAuctions(filters, format);
    },
  });

  return (
    <OpportunitiesPage
      listQueryResult={listQuery.data}
      mapQueryResult={mapQuery.data}
      isLoading={listQuery.isLoading || mapQuery.isLoading}
      getOpportunityById={getAuctionById}
      viewType={viewType}
      onViewTypeChange={setViewType}
      currentFilters={appliedFilters}
      onFiltersChange={setAppliedFilters}
      opportunityType={OpportunityType.AUCTION}
      exportMutation={exportMutation}
    />
  );
}
