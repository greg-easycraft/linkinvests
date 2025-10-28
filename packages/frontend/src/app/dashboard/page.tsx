"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { OpportunityFilters } from "./components/OpportunityFilters";
import { OpportunityList } from "./components/OpportunityList";
import { OpportunityMap } from "./components/OpportunityMap";
import { OpportunitySidebar } from "./components/OpportunitySidebar";
import { ViewToggle } from "./components/ViewToggle";
import {
  getOpportunities,
  getOpportunitiesForMap,
} from "~/app/_actions/opportunity/queries";
import type { OpportunityFilters as IOpportunityFilters } from "~/types/filters";
import type { Opportunity } from "~/server/domains/opportunities/lib.types";
import Image from "next/image";

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
  const [isFiltersSidebarOpen, setIsFiltersSidebarOpen] = useState(true);

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
    <div className="flex h-screen overflow-hidden">


      {/* Toggle Button for Filters */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-r-md rounded-l-none"
        style={{ left: isFiltersSidebarOpen ? "303px" : "0" }}
        onClick={() => setIsFiltersSidebarOpen(!isFiltersSidebarOpen)}
      >
        {isFiltersSidebarOpen ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-[var(--secundary)] p-6">
          <div className="flex items-center justify-between">
            <a
              href="https://linkinvests.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Image
                src="/Logo-LinkInvests-white.svg"
                alt="LinkInvests Logo"
                width={150}
                height={30}
              />
            </a>
          </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 flex overflow-hidden bg-(--secundary)">
          {/* Collapsible Filters Sidebar */}
          <div
            className={`transition-all duration-300 ease-in-out border-r border-neutral-700 ${isFiltersSidebarOpen ? "w-80" : "w-0"
              }`}
          >
            {isFiltersSidebarOpen && (
              <div className="p-4">
                <OpportunityFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  onApply={handleApplyFilters}
                  onReset={handleResetFilters}
                />
              </div>
            )}
          </div>
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
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

              {viewType === "map" && mapQuery.data && (
                <OpportunityMap
                  opportunities={mapQuery.data.opportunities}
                  selectedId={selectedOpportunity?.id}
                  onSelect={handleSelectOpportunity}
                  isLimited={mapQuery.data.isLimited}
                  total={mapQuery.data.total}
                />
              )}

              {(listQuery.isLoading || mapQuery.isLoading) && (
                <div className="flex items-center justify-center h-96">
                  <div className="text-neutral-400">Chargement...</div>
                </div>
              )}
            </div>
          </div>

          {/* Details Sidebar */}
          <div className="w-96 border-l border-neutral-700 bg-(--secundary) overflow-y-auto p-4">
            <OpportunitySidebar
              opportunity={selectedOpportunity}
              onClose={handleCloseSidebar}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
