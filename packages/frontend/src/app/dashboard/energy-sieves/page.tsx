'use client';
import type { OpportunityFilters as IOpportunityFilters } from "~/types/filters";

import { OpportunityType } from "@linkinvests/shared";
import { getEnergyDiagnosticById, getEnergyDiagnostics, getEnergyDiagnosticsForMap } from "~/app/_actions/energy-sieves/queries";
import OpportunitiesPage from "../components/OpportunitiesPage";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

type ViewType = "list" | "map";

export default function EnergySievesPage(): React.ReactElement {
  const [appliedFilters, setAppliedFilters] = useState<IOpportunityFilters>({});
  const [viewType, setViewType] = useState<ViewType>("list");

  const listQuery = useQuery({
    queryKey: ['energy-sieves', "list", appliedFilters],
    queryFn: () => getEnergyDiagnostics(appliedFilters),
    enabled: viewType === "list",
  });

  // Query for map view - using type-specific query
  const mapQuery = useQuery({
    queryKey: ['energy-sieves', "map", appliedFilters],
    queryFn: () => getEnergyDiagnosticsForMap(appliedFilters),
    enabled: viewType === "map",
  });

  return (
    <OpportunitiesPage
      listQueryResult={listQuery.data}
      mapQueryResult={mapQuery.data}
      isLoading={listQuery.isLoading || mapQuery.isLoading}
      getOpportunityById={getEnergyDiagnosticById}
      viewType={viewType}
      onViewTypeChange={setViewType}
      onFiltersChange={setAppliedFilters}
      opportunityType={OpportunityType.ENERGY_SIEVE}
    />
  );
}