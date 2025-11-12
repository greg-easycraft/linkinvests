"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { OpportunityFilters } from "../components/OpportunityFilters";
import { OpportunityList } from "../components/OpportunityList";
import { OpportunityMap } from "../components/OpportunityMap";
import { OpportunityDetailsModal } from "../components/OpportunityDetailsModal";
import { UserInfo } from "../components/PageHeader/UserInfo";
import {
  getOpportunitiesByType,
  getOpportunitiesForMapByType,
} from "~/app/_actions/opportunity/queries";
import type { OpportunityFilters as IOpportunityFilters } from "~/types/filters";
import { type Opportunity, OpportunityType } from "@linkinvests/shared";
import Image from "next/image";
import { OpportunityListSkeleton } from "../components/OpportunityList/OpportunityListSkeleton";
import { MapSkeleton } from "../components/OpportunityMap/MapSkeleton";
import { MapEmptyState } from "../components/OpportunityMap/MapEmptyState";
import { notFound } from "next/navigation";

type ViewType = "list" | "map";

// Map URL segments to OpportunityType enum values
const TYPE_URL_MAPPING: Record<string, OpportunityType> = {
  'auctions': OpportunityType.AUCTION,
  'successions': OpportunityType.SUCCESSION,
  'liquidations': OpportunityType.LIQUIDATION,
  'energy-sieves': OpportunityType.ENERGY_SIEVE,
};

// Map OpportunityType enum values back to URL segments
const TYPE_TO_URL_MAPPING: Record<OpportunityType, string> = {
  [OpportunityType.AUCTION]: 'auctions',
  [OpportunityType.SUCCESSION]: 'successions',
  [OpportunityType.LIQUIDATION]: 'liquidations',
  [OpportunityType.ENERGY_SIEVE]: 'energy-sieves',
  [OpportunityType.REAL_ESTATE_LISTING]: 'real-estate-listings', // Not implemented yet
  [OpportunityType.DIVORCE]: 'divorces', // Not implemented yet
};

// Removed unused interface - params are accessed via useParams hook

export default function TypedDashboardPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const typeParam = params?.type as string;

  // Validate and get opportunity type from URL parameter
  const opportunityType = TYPE_URL_MAPPING[typeParam];
  if (!opportunityType) {
    notFound();
  }

  const [viewType, setViewType] = useState<ViewType>("list");
  const [filters, setFilters] = useState<IOpportunityFilters>({
    types: [opportunityType], // Set the type from URL
    limit: 25,
    offset: 0,
  });
  const [appliedFilters, setAppliedFilters] = useState<IOpportunityFilters>(filters);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersSidebarOpen, setIsFiltersSidebarOpen] = useState(true);

  // Update filters when URL type changes
  useEffect(() => {
    const newFilters = {
      limit: 25,
      offset: 0,
      types: [opportunityType]
    };
    setFilters(newFilters);
    setAppliedFilters(newFilters);
  }, [opportunityType]);

  // Query for list view - using type-specific query
  const listQuery = useQuery({
    queryKey: ["opportunities", "list", opportunityType, appliedFilters],
    queryFn: () => getOpportunitiesByType(opportunityType, appliedFilters),
    enabled: viewType === "list",
  });

  // Query for map view - using type-specific query
  const mapQuery = useQuery({
    queryKey: ["opportunities", "map", opportunityType, appliedFilters],
    queryFn: () => getOpportunitiesForMapByType(opportunityType, appliedFilters),
    enabled: viewType === "map",
  });

  const handleApplyFilters = useCallback((): void => {
    setAppliedFilters({ ...filters, offset: 0 });
    setSelectedOpportunity(null);
  }, [filters]);

  const handleResetFilters = useCallback((): void => {
    const resetFilters: IOpportunityFilters = {
      types: [opportunityType], // Keep the current type
      limit: 25,
      offset: 0,
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setSelectedOpportunity(null);
  }, [opportunityType]);

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
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback((): void => {
    setSelectedOpportunity(null);
    setIsModalOpen(false);
  }, []);

  const handleToggleSidebar = useCallback((): void => {
    setIsFiltersSidebarOpen(!isFiltersSidebarOpen);
    // Trigger map resize after sidebar animation completes
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300); // Match the transition duration
  }, [isFiltersSidebarOpen]);

  // Handle type change - navigate to new URL
  const handleTypeChange = useCallback((newType: OpportunityType): void => {
    const newUrlSegment = TYPE_TO_URL_MAPPING[newType];
    if (newUrlSegment) {
      router.push(`/dashboard/${newUrlSegment}`);
    }
  }, [router]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Toggle Button for Filters */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-r-md rounded-l-none"
        style={{ left: isFiltersSidebarOpen ? "303px" : "0" }}
        onClick={handleToggleSidebar}
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
        <div className="border-b border-[var(--secundary)] px-6 py-3">
          <div className="flex items-center justify-between">
            <a
              href="https://linkinvests.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Image
                src="/logo.svg"
                alt="LinkInvests Logo"
                width={20}
                height={20}
              />
            </a>
            <UserInfo />
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
              <div className="p-4 h-full">
                <OpportunityFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  onApply={handleApplyFilters}
                  onReset={handleResetFilters}
                  viewType={viewType}
                  onViewTypeChange={setViewType}
                  currentType={opportunityType}
                  onTypeChange={handleTypeChange}
                />
              </div>
            )}
          </div>
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden p-6">
            <div className="flex-1 overflow-hidden">
              {viewType === "list" && listQuery.data && (
                <div className="h-full overflow-y-auto rounded-md">
                  <OpportunityList
                    type={opportunityType}
                    data={listQuery.data}
                    selectedId={selectedOpportunity?.id}
                    onSelect={handleSelectOpportunity}
                    onPageChange={handlePageChange}
                    filters={appliedFilters}
                  />
                </div>
              )}

              {viewType === "map" && mapQuery.data && (
                <div className="relative w-full h-full">
                  <OpportunityMap
                    type={opportunityType}
                    opportunities={mapQuery.data.opportunities}
                    selectedId={selectedOpportunity?.id}
                    onSelect={handleSelectOpportunity}
                    isLimited={mapQuery.data.isLimited}
                    total={mapQuery.data.total}
                  />
                  {mapQuery.data.opportunities.length === 0 && <MapEmptyState />}
                </div>
              )}

              {viewType === "map" && mapQuery.isLoading && (
                <MapSkeleton />
              )}
              {viewType === "list" && listQuery.isLoading && (
                <OpportunityListSkeleton />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Opportunity Details Modal */}
      <OpportunityDetailsModal
        type={opportunityType}
        opportunity={selectedOpportunity}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
