'use client';

import { OpportunityType } from "@linkinvests/shared";
import { getLiquidationById, getLiquidationsData, getLiquidationsCount, exportLiquidations } from "~/app/_actions/liquidations/queries";
import OpportunitiesPage from "../_components/OpportunitiesPage";
import { BaseFilters } from "../_components/OpportunityFilters/BaseFilters";
import { useQueryParamFilters } from "~/hooks/useQueryParamFilters";
import { useOpportunityData } from "~/hooks/useOpportunityData";
import type { ExportFormat } from "~/server/services/export.service";
import { useCallback } from "react";
import { baseFiltersSchema } from "~/utils/filters/filters.schema";

export default function LiquidationsPageContent(): React.ReactElement {
  // Use query param hook for filters and view type
  const { currentFilters, debouncedFilters, setFilters: setAppliedFilters } =
    useQueryParamFilters(baseFiltersSchema);

  // Use unified data fetching - single queries for both list and map views
  const {
    data,
    count,
    isCountLoading,
    isDataLoading
  } = useOpportunityData(
    OpportunityType.LIQUIDATION,
    debouncedFilters,
    getLiquidationsData,
    getLiquidationsCount
  );

  const handleExport = useCallback(async (format: ExportFormat) => {
    const result = await exportLiquidations(debouncedFilters, format);
    return result;
  }, [debouncedFilters]);

  return (
    <OpportunitiesPage
      data={data}
      count={count}
      isCountLoading={isCountLoading}
      isLoading={isDataLoading}
      getOpportunityById={getLiquidationById}
      opportunityType={OpportunityType.LIQUIDATION}
      onExport={handleExport}
      FiltersComponent={
        <BaseFilters
          currentType={OpportunityType.LIQUIDATION}
          filters={currentFilters}
          onFiltersChange={setAppliedFilters}
        />
      }
    />
  );
}