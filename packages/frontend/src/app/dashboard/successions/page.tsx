'use client';
import type { OpportunityFilters as IOpportunityFilters } from "~/types/filters";

import { OpportunityType } from "@linkinvests/shared";
import { getSuccessionById, getSuccessions, getSuccessionsForMap } from "~/app/_actions/successions/queries";
import OpportunitiesPage from "../components/OpportunitiesPage";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

type ViewType = "list" | "map";

export default function SuccessionsPage(): React.ReactElement {
  const [appliedFilters, setAppliedFilters] = useState<IOpportunityFilters>({});
  const [viewType, setViewType] = useState<ViewType>("list");

  const listQuery = useQuery({
    queryKey: ['successions', "list", appliedFilters],
    queryFn: () => getSuccessions(appliedFilters),
    enabled: viewType === "list",
  });

  // Query for map view - using type-specific query
  const mapQuery = useQuery({
    queryKey: ['successions', "map", appliedFilters],
    queryFn: () => getSuccessionsForMap(appliedFilters),
    enabled: viewType === "map",
  });

  return (
    <OpportunitiesPage
      listQueryResult={listQuery.data}
      mapQueryResult={mapQuery.data}
      isLoading={listQuery.isLoading || mapQuery.isLoading}
      getOpportunityById={getSuccessionById}
      viewType={viewType}
      onViewTypeChange={setViewType}
      onFiltersChange={setAppliedFilters}
      opportunityType={OpportunityType.SUCCESSION}
    />
  );
}