'use client';
import type { OpportunityFilters as IOpportunityFilters } from "~/types/filters";

import { OpportunityType } from "@linkinvests/shared";
import { getListingById, getListings, getListingsForMap, exportListings } from "~/app/_actions/listings/queries";
import OpportunitiesPage from "../components/OpportunitiesPage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import type { ExportFormat } from "~/server/services/export.service";

type ViewType = "list" | "map";

export default function ListingsPage(): React.ReactElement {
  const [appliedFilters, setAppliedFilters] = useState<IOpportunityFilters>({});
  const [viewType, setViewType] = useState<ViewType>("list");

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
    mutationFn: async ({ format, filters }: { format: ExportFormat; filters: IOpportunityFilters }) => {
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
      onFiltersChange={setAppliedFilters}
      opportunityType={OpportunityType.REAL_ESTATE_LISTING}
      exportMutation={exportMutation}
    />
  );
}