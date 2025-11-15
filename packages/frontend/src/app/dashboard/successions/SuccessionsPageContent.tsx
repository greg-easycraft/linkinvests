'use client';

import { OpportunityType } from "@linkinvests/shared";
import { getSuccessionById, getSuccessionsData, getSuccessionsCount, exportSuccessions } from "~/app/_actions/successions/queries";
import OpportunitiesPage from "../components/OpportunitiesPage";
import { BaseFilters } from "../components/OpportunityFilters/BaseFilters";
import { useQueryParamFilters } from "~/hooks/useQueryParamFilters";
import { useOpportunityData } from "~/hooks/useOpportunityData";
import type { ExportFormat } from "~/server/services/export.service";
import { useCallback } from "react";
import { baseFiltersSchema } from "~/utils/filters/filters.schema";

export default function SuccessionsPageContent(): React.ReactElement {
  // Use query param hook for filters and view type
  const { filters: appliedFilters, setFilters: setAppliedFilters } =
    useQueryParamFilters(baseFiltersSchema);

  // Use unified data fetching - single queries for both list and map views
  const {
    data,
    count,
    isCountLoading,
    isLoading
  } = useOpportunityData(
    OpportunityType.SUCCESSION,
    appliedFilters,
    getSuccessionsData,
    getSuccessionsCount
  );

  const handleExport = useCallback(async (format: ExportFormat) => {
    const result = await exportSuccessions(appliedFilters, format);
    return result;
  }, [appliedFilters]);

  return (
    <OpportunitiesPage
      data={data}
      count={count}
      isCountLoading={isCountLoading}
      isLoading={isLoading}
      getOpportunityById={getSuccessionById}
      opportunityType={OpportunityType.SUCCESSION}
      onExport={handleExport}
      FiltersComponent={
        <BaseFilters
          currentType={OpportunityType.SUCCESSION}
          filters={appliedFilters}
          onFiltersChange={setAppliedFilters}
        />
      }
    />
  );
}