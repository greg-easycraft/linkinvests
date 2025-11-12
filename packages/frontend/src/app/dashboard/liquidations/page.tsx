'use client';
import type { OpportunityFilters as IOpportunityFilters } from "~/types/filters";

import { OpportunityType } from "@linkinvests/shared";
import { getLiquidationById, getLiquidations, getLiquidationsForMap, exportLiquidations } from "~/app/_actions/liquidations/queries";
import OpportunitiesPage from "../components/OpportunitiesPage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import type { ExportFormat } from "~/server/services/export.service";

type ViewType = "list" | "map";

export default function LiquidationsPage(): React.ReactElement {
  const [appliedFilters, setAppliedFilters] = useState<IOpportunityFilters>({});
  const [viewType, setViewType] = useState<ViewType>("list");

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
    mutationFn: async ({ format, filters }: { format: ExportFormat; filters: IOpportunityFilters }) => {
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
      onFiltersChange={setAppliedFilters}
      opportunityType={OpportunityType.LIQUIDATION}
      exportMutation={exportMutation}
    />
  );
}