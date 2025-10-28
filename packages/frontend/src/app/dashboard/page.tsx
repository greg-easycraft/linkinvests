"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { OpportunityFilters } from "./components/OpportunityFilters";
import { OpportunityList } from "./components/OpportunityList";
import { OpportunityMap } from "./components/OpportunityMap";
import { OpportunitySidebar } from "./components/OpportunitySidebar";
import { ViewToggle } from "./components/ViewToggle";
import {
  getOpportunities,
  getOpportunitiesForMap,
} from "~/app/_actions/opportunity/queries";
import type { OpportunityFilters as IOpportunityFilters } from "~/server/domains/opportunities/types/filters";
import type { Opportunity } from "~/server/domains/opportunities/repositories/IOpportunityRepository";

type ViewType = "list" | "map";

export default function DashboardPage(): React.ReactElement {
  const [viewType, setViewType] = useState<ViewType>("list");
  const [filters, setFilters] = useState<IOpportunityFilters>({
    limit: 25,
    offset: 0,
  });
  const [appliedFilters, setAppliedFilters] = useState<IOpportunityFilters>(filters);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(
    null,
  );

  // Query for list view
  const listQuery = useQuery({
    queryKey: ["opportunities", "list", appliedFilters],
    queryFn: () => getOpportunities(appliedFilters),
    enabled: viewType === "list",
  });

  // Query for map view
  const mapQuery = useQuery({
    queryKey: ["opportunities", "map", appliedFilters],
    queryFn: () => getOpportunitiesForMap(appliedFilters),
    enabled: viewType === "map",
  });

  const handleApplyFilters = useCallback((): void => {
    setAppliedFilters({ ...filters, offset: 0 });
    setSelectedOpportunity(null);
  }, [filters]);

  const handleResetFilters = useCallback((): void => {
    const resetFilters: IOpportunityFilters = {
      limit: 25,
      offset: 0,
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setSelectedOpportunity(null);
  }, []);

  const handlePageChange = useCallback(
    (page: number): void => {
      const pageSize = filters.limit ?? 25;
      const newOffset = (page - 1) * pageSize;
      const newFilters = { ...appliedFilters, offset: newOffset };
      setFilters(newFilters);
      setAppliedFilters(newFilters);
    },
    [filters.limit, appliedFilters],
  );

  const handleSelectOpportunity = useCallback((opportunity: Opportunity): void => {
    setSelectedOpportunity(opportunity);
  }, []);

  const handleCloseSidebar = useCallback((): void => {
    setSelectedOpportunity(null);
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Tableau de bord des opportunités</h1>
        <p className="text-neutral-600">
          Consultez et filtrez les opportunités d'investissement en France
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Filters Sidebar */}
        <div className="col-span-12 lg:col-span-3">
          <OpportunityFilters
            filters={filters}
            onFiltersChange={setFilters}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* Main Content */}
        <div className="col-span-12 lg:col-span-6">
          <div className="space-y-4">
            <ViewToggle value={viewType} onValueChange={setViewType} />

            {viewType === "list" && listQuery.data && (
              <OpportunityList
                data={listQuery.data}
                selectedId={selectedOpportunity?.id}
                onSelect={handleSelectOpportunity}
                onPageChange={handlePageChange}
                isLoading={listQuery.isLoading}
              />
            )}

            {viewType === "map" && (
              <OpportunityMap
                opportunities={mapQuery.data ?? []}
                selectedId={selectedOpportunity?.id}
                onSelect={handleSelectOpportunity}
              />
            )}

            {(listQuery.isLoading || mapQuery.isLoading) && (
              <div className="flex items-center justify-center h-96">
                <div className="text-neutral-500">Chargement...</div>
              </div>
            )}
          </div>
        </div>

        {/* Details Sidebar */}
        <div className="col-span-12 lg:col-span-3">
          <OpportunitySidebar
            opportunity={selectedOpportunity}
            onClose={handleCloseSidebar}
          />
        </div>
      </div>
    </div>
  );
}
