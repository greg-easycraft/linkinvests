'use client';

import { OpportunityType } from "@linkinvests/shared";
import { getListingById, getListings, getListingsForMap, exportListings } from "~/app/_actions/listings/queries";
import OpportunitiesPage from "../components/OpportunitiesPage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useQueryParamFilters } from "~/hooks/useQueryParamFilters";
import type { ExportFormat } from "~/server/services/export.service";
import type { OpportunityFilters } from "~/types/filters";

export default function ListingsPageContent(): React.ReactElement {
  // Use query param hook instead of useState for filters and view type
  const { filters: appliedFilters, viewType, setFilters: setAppliedFilters, setViewType } =
    useQueryParamFilters(OpportunityType.REAL_ESTATE_LISTING);

  const listQuery = useQuery({
    queryKey: ['listings', "list", appliedFilters],
    queryFn: () => getListings(appliedFilters),
    enabled: viewType === "list",
  });

  // Query for map view - using type-specific query
  const mapQuery = useQuery({
    queryKey: ['listings', "map", appliedFilters],
    queryFn: () => getListingsForMap(appliedFilters),
    enabled: viewType === "map",
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async ({ format, filters }: { format: ExportFormat; filters: OpportunityFilters }) => {
      return await exportListings(filters, format);
    },
  });

  return (
    <OpportunitiesPage
      listQueryResult={listQuery.data}
      mapQueryResult={mapQuery.data}
      isLoading={listQuery.isLoading || mapQuery.isLoading}
      getOpportunityById={getListingById}
      viewType={viewType}
      onViewTypeChange={setViewType}
      currentFilters={appliedFilters}
      onFiltersChange={setAppliedFilters}
      opportunityType={OpportunityType.REAL_ESTATE_LISTING}
      exportMutation={exportMutation}
    />
  );
}