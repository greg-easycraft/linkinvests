'use client';

import { OpportunityType } from "@linkinvests/shared";
import { getLiquidationById, getLiquidations, getLiquidationsForMap, exportLiquidations } from "~/app/_actions/liquidations/queries";
import OpportunitiesPage from "../components/OpportunitiesPage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useQueryParamFilters } from "~/hooks/useQueryParamFilters";
import type { ExportFormat } from "~/server/services/export.service";
import type { OpportunityFilters } from "~/types/filters";

export default function LiquidationsPageContent(): React.ReactElement {
  // Use query param hook instead of useState for filters and view type
  const { filters: appliedFilters, viewType, setFilters: setAppliedFilters, setViewType } =
    useQueryParamFilters(OpportunityType.LIQUIDATION);

  const listQuery = useQuery({
    queryKey: ['liquidations', "list", appliedFilters],
    queryFn: () => getLiquidations(appliedFilters),
    enabled: viewType === "list",
  });

  // Query for map view - using type-specific query
  const mapQuery = useQuery({
    queryKey: ['liquidations', "map", appliedFilters],
    queryFn: () => getLiquidationsForMap(appliedFilters),
    enabled: viewType === "map",
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async ({ format, filters }: { format: ExportFormat; filters: OpportunityFilters }) => {
      return await exportLiquidations(filters, format);
    },
  });

  return (
    <OpportunitiesPage
      listQueryResult={listQuery.data}
      mapQueryResult={mapQuery.data}
      isLoading={listQuery.isLoading || mapQuery.isLoading}
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