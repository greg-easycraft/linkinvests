'use client';

import { OpportunityType } from "@linkinvests/shared";
import { getEnergyDiagnosticById, getEnergyDiagnosticsData, getEnergyDiagnosticsCount, exportEnergyDiagnostics } from "~/app/_actions/energy-sieves/queries";
import OpportunitiesPage from "../_components/OpportunitiesPage";
import { EnergyDiagnosticFilters } from "../_components/OpportunityFilters/EnergyDiagnosticFilters";
import { useQueryParamFilters } from "~/hooks/useQueryParamFilters";
import { useOpportunityData } from "~/hooks/useOpportunityData";
import type { ExportFormat } from "~/server/services/export.service";
import { useCallback } from "react";
import { energyDiagnosticFiltersSchema } from "~/utils/filters/filters.schema";

export default function EnergySievesPageContent(): React.ReactElement {
  // Use query param hook for filters and view type
  const { filters: appliedFilters, setFilters: setAppliedFilters } =
    useQueryParamFilters(energyDiagnosticFiltersSchema);

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

  const handleExport = useCallback(async (format: ExportFormat) => {
    const result = await exportEnergyDiagnostics(appliedFilters, format);
    return result;
  }, [appliedFilters]);

  return (
    <OpportunitiesPage
      data={data}
      count={count}
      isCountLoading={isCountLoading}
      isLoading={isLoading}
      getOpportunityById={getEnergyDiagnosticById}
      opportunityType={OpportunityType.ENERGY_SIEVE}
      onExport={handleExport}
      FiltersComponent={
        <EnergyDiagnosticFilters
          filters={appliedFilters}
          onFiltersChange={setAppliedFilters}
        />
      }
    />
  );
}