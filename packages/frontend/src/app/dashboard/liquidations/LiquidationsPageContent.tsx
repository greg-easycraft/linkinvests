'use client';

import { OpportunityType } from "@linkinvests/shared";
import { getLiquidationById, getLiquidationsData, getLiquidationsCount, exportLiquidations } from "~/app/_actions/liquidations/queries";
import OpportunitiesPage from "../components/OpportunitiesPage";
import { useMutation } from "@tanstack/react-query";
import { useQueryParamFilters } from "~/hooks/useQueryParamFilters";
import { useOpportunityData } from "~/hooks/useOpportunityData";
import type { ExportFormat } from "~/server/services/export.service";
import type { OpportunityFilters } from "~/types/filters";

export default function LiquidationsPageContent(): React.ReactElement {
  // Use query param hook for filters and view type
  const { filters: appliedFilters, viewType, setFilters: setAppliedFilters, setViewType } =
    useQueryParamFilters(OpportunityType.LIQUIDATION);

  // Use unified data fetching - single queries for both list and map views
  const {
    data,
    count,
    isCountLoading,
    isLoading
  } = useOpportunityData(
    OpportunityType.LIQUIDATION,
    appliedFilters,
    getLiquidationsData,
    getLiquidationsCount
  );

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async ({ format, filters }: { format: ExportFormat; filters: OpportunityFilters }) => {
      return await exportLiquidations(filters, format);
    },
  });

  return (
    <OpportunitiesPage
      data={data}
      count={count}
      isCountLoading={isCountLoading}
      isLoading={isLoading}
      getOpportunityById={getLiquidationById}
      viewType={viewType}
      onViewTypeChange={setViewType}
      currentFilters={appliedFilters}
      onFiltersChange={setAppliedFilters}
      opportunityType={OpportunityType.LIQUIDATION}
      exportMutation={exportMutation}
    />
  );
}