'use client';

import { OpportunityType } from "@linkinvests/shared";
import { getEnergyDiagnosticById, getEnergyDiagnosticsData, getEnergyDiagnosticsCount, exportEnergyDiagnostics } from "~/app/_actions/energy-sieves/queries";
import OpportunitiesPage from "../components/OpportunitiesPage";
import { EnergyDiagnosticFilters } from "../components/EnergyDiagnosticFilters";
import { useMutation } from "@tanstack/react-query";
import { useQueryParamFilters } from "~/hooks/useQueryParamFilters";
import { useOpportunityData } from "~/hooks/useOpportunityData";
import type { ExportFormat } from "~/server/services/export.service";
import type { OpportunityFilters } from "~/types/filters";

export default function EnergySievesPageContent(): React.ReactElement {
  // Use query param hook for filters and view type
  const { filters: appliedFilters, viewType, setFilters: setAppliedFilters, setViewType } =
    useQueryParamFilters(OpportunityType.ENERGY_SIEVE);

  // Use unified data fetching - single queries for both list and map views
  const {
    data,
    count,
    isCountLoading,
    isLoading
  } = useOpportunityData(
    OpportunityType.ENERGY_SIEVE,
    appliedFilters,
    getEnergyDiagnosticsData,
    getEnergyDiagnosticsCount
  );

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async ({ format, filters }: { format: ExportFormat; filters: OpportunityFilters }) => {
      return await exportEnergyDiagnostics(filters, format);
    },
  });

  return (
    <OpportunitiesPage
      data={data}
      count={count}
      isCountLoading={isCountLoading}
      isLoading={isLoading}
      getOpportunityById={getEnergyDiagnosticById}
      viewType={viewType}
      onViewTypeChange={setViewType}
      currentFilters={appliedFilters}
      onFiltersChange={setAppliedFilters}
      opportunityType={OpportunityType.ENERGY_SIEVE}
      exportMutation={exportMutation}
      FiltersComponent={EnergyDiagnosticFilters}
    />
  );
}