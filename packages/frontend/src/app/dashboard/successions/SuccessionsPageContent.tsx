'use client';

import { OpportunityType } from "@linkinvests/shared";
import { getSuccessionById, getSuccessions, getSuccessionsForMap, exportSuccessions } from "~/app/_actions/successions/queries";
import OpportunitiesPage from "../components/OpportunitiesPage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useQueryParamFilters } from "~/hooks/useQueryParamFilters";
import type { ExportFormat } from "~/server/services/export.service";
import type { OpportunityFilters } from "~/types/filters";

export default function SuccessionsPageContent(): React.ReactElement {
  // Use query param hook instead of useState for filters and view type
  const { filters: appliedFilters, viewType, setFilters: setAppliedFilters, setViewType } =
    useQueryParamFilters(OpportunityType.SUCCESSION);

  const listQuery = useQuery({
    queryKey: ['successions', "list", appliedFilters],
    queryFn: () => getSuccessions(appliedFilters),
    enabled: viewType === "list",
  });

  // Query for map view - using type-specific query
  const mapQuery = useQuery({
    queryKey: ['successions', "map", appliedFilters],
    queryFn: () => getSuccessionsForMap(appliedFilters),
    enabled: viewType === "map",
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async ({ format, filters }: { format: ExportFormat; filters: OpportunityFilters }) => {
      return await exportSuccessions(filters, format);
    },
  });

  return (
    <OpportunitiesPage
      listQueryResult={listQuery.data}
      mapQueryResult={mapQuery.data}
      isLoading={listQuery.isLoading || mapQuery.isLoading}
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