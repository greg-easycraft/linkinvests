'use client';

import { OpportunityType } from "@linkinvests/shared";
import { getEnergyDiagnosticById, getEnergyDiagnostics, getEnergyDiagnosticsForMap, exportEnergyDiagnostics } from "~/app/_actions/energy-sieves/queries";
import OpportunitiesPage from "../components/OpportunitiesPage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useQueryParamFilters } from "~/hooks/useQueryParamFilters";
import type { ExportFormat } from "~/server/services/export.service";
import type { OpportunityFilters } from "~/types/filters";

export default function EnergySievesPage(): React.ReactElement {
  // Use query param hook instead of useState for filters and view type
  const { filters: appliedFilters, viewType, setFilters: setAppliedFilters, setViewType } =
    useQueryParamFilters(OpportunityType.ENERGY_SIEVE);

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

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async ({ format, filters }: { format: ExportFormat; filters: OpportunityFilters }) => {
      return await exportEnergyDiagnostics(filters, format);
    },
  });

  return (
    <OpportunitiesPage
      listQueryResult={listQuery.data}
      mapQueryResult={mapQuery.data}
      isLoading={listQuery.isLoading || mapQuery.isLoading}
      getOpportunityById={getEnergyDiagnosticById}
      viewType={viewType}
      onViewTypeChange={setViewType}
      currentFilters={appliedFilters}
      onFiltersChange={setAppliedFilters}
      opportunityType={OpportunityType.ENERGY_SIEVE}
      exportMutation={exportMutation}
    />
  );
}