'use client';

import { OpportunityType } from "@linkinvests/shared";
import { getSuccessionById, getSuccessionsData, getSuccessionsCount, exportSuccessions } from "~/app/_actions/successions/queries";
import OpportunitiesPage from "../components/OpportunitiesPage";
import { useMutation } from "@tanstack/react-query";
import { useQueryParamFilters } from "~/hooks/useQueryParamFilters";
import { useOpportunityData } from "~/hooks/useOpportunityData";
import type { ExportFormat } from "~/server/services/export.service";
import type { OpportunityFilters } from "~/types/filters";

export default function SuccessionsPageContent(): React.ReactElement {
  // Use query param hook for filters and view type
  const { filters: appliedFilters, viewType, setFilters: setAppliedFilters, setViewType } =
    useQueryParamFilters(OpportunityType.SUCCESSION);

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

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async ({ format, filters }: { format: ExportFormat; filters: OpportunityFilters }) => {
      return await exportSuccessions(filters, format);
    },
  });

  return (
    <OpportunitiesPage
      data={data}
      count={count}
      isCountLoading={isCountLoading}
      isLoading={isLoading}
      getOpportunityById={getSuccessionById}
      viewType={viewType}
      onViewTypeChange={setViewType}
      currentFilters={appliedFilters}
      onFiltersChange={setAppliedFilters}
      opportunityType={OpportunityType.SUCCESSION}
      exportMutation={exportMutation}
    />
  );
}