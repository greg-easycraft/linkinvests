"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { OpportunityFilters } from "./OpportunityFilters";
import { OpportunityList } from "./OpportunityList";
import { OpportunityMap } from "./OpportunityMap";
import { OpportunityDetailsModal } from "./OpportunityDetailsModal";
import type { OpportunityFilters as IOpportunityFilters } from "~/types/filters";
import { Auction, BaseOpportunity, EnergyDiagnostic, Liquidation, type Opportunity, OpportunityType, Succession } from "@linkinvests/shared";
import { OpportunityListSkeleton } from "./OpportunityList/OpportunityListSkeleton";
import { MapSkeleton } from "./OpportunityMap/MapSkeleton";
import { MapEmptyState } from "./OpportunityMap/MapEmptyState";
import { OpportunitiesListQueryResult, OpportunitiesMapQueryResult } from "~/types/query-result";
import { PageHeader } from "./PageHeader";

type ViewType = "list" | "map";

// Map OpportunityType enum values back to URL segments
const TYPE_TO_URL_MAPPING: Record<OpportunityType, string> = {
  [OpportunityType.AUCTION]: 'auctions',
  [OpportunityType.SUCCESSION]: 'successions',
  [OpportunityType.LIQUIDATION]: 'liquidations',
  [OpportunityType.ENERGY_SIEVE]: 'energy-sieves',
  [OpportunityType.REAL_ESTATE_LISTING]: 'real-estate-listings', // Not implemented yet
  [OpportunityType.DIVORCE]: 'divorces', // Not implemented yet
};

type OpportunitiesPageProps<T extends BaseOpportunity> = {
  viewType: ViewType;
  onViewTypeChange: (viewType: ViewType) => void;
  onFiltersChange: (filters: IOpportunityFilters) => void;
  isLoading: boolean;
  listQueryResult?: OpportunitiesListQueryResult<T>;
  mapQueryResult?: OpportunitiesMapQueryResult<T>;
  getOpportunityById: (id: string) => Promise<T | null>;
}

type AuctionsPageProps = OpportunitiesPageProps<Auction> & {
  opportunityType: OpportunityType.AUCTION;
}

type SuccessionsPageProps = OpportunitiesPageProps<Succession> & {
  opportunityType: OpportunityType.SUCCESSION;
}

type LiquidationsPageProps = OpportunitiesPageProps<Liquidation> & {
  opportunityType: OpportunityType.LIQUIDATION;
}

type EnergySievesPageProps = OpportunitiesPageProps<EnergyDiagnostic> & {
  opportunityType: OpportunityType.ENERGY_SIEVE;
}

type PageProps = AuctionsPageProps | SuccessionsPageProps | LiquidationsPageProps | EnergySievesPageProps;

export default function OpportunitiesPage({ 
  viewType,
  opportunityType, 
  listQueryResult, 
  mapQueryResult, 
  isLoading, 
  onFiltersChange,
  onViewTypeChange
}: PageProps): React.ReactElement {
  const [filters, setFilters] = useState<IOpportunityFilters>({
    types: [opportunityType], // Set the type from URL
    limit: 25,
    offset: 0,
  });
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersSidebarOpen, setIsFiltersSidebarOpen] = useState(true);

  const router = useRouter();

  // Update filters when URL type changes
  useEffect(() => {
    const newFilters = {
      limit: 25,
      offset: 0,
      types: [opportunityType]
    };
    setFilters(newFilters);
  }, [opportunityType]);

  const handleApplyFilters = useCallback((): void => {
    onFiltersChange({ ...filters, offset: 0 });
    setSelectedOpportunity(null);
  }, [filters]);

  const handleResetFilters = useCallback((): void => {
    const resetFilters: IOpportunityFilters = {
      types: [opportunityType], // Keep the current type
      limit: 25,
      offset: 0,
    };
    setFilters(resetFilters);
    onFiltersChange(resetFilters);
    setSelectedOpportunity(null);
  }, [opportunityType]);

  const handlePageChange = useCallback(
    (page: number): void => {
      const pageSize = filters.limit ?? 25;
      const newOffset = (page - 1) * pageSize;
      const newFilters = { ...filters, offset: newOffset };
      setFilters(newFilters);
      onFiltersChange(newFilters);
    },
    [filters.limit, filters],
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
       <PageHeader />

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
                  onViewTypeChange={onViewTypeChange}
                  currentType={opportunityType}
                  onTypeChange={handleTypeChange}
                />
              </div>
            )}
          </div>
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden p-6">
            <div className="flex-1 overflow-hidden">
              {viewType === "list" && listQueryResult && (
                <div className="h-full overflow-y-auto rounded-md">
                  <OpportunityList
                    type={opportunityType}
                    data={listQueryResult}
                    selectedId={selectedOpportunity?.id}
                    onSelect={handleSelectOpportunity}
                    onPageChange={handlePageChange}
                    filters={filters}
                  />
                </div>
              )}

              {viewType === "map" && mapQueryResult && (
                <div className="relative w-full h-full">
                  <OpportunityMap
                    type={opportunityType}
                    opportunities={mapQueryResult.opportunities}
                    selectedId={selectedOpportunity?.id}
                    onSelect={handleSelectOpportunity}
                    isLimited={mapQueryResult.isLimited}
                    total={mapQueryResult.total}
                  />
                  {mapQueryResult.opportunities.length === 0 && <MapEmptyState />}
                </div>
              )}

              {viewType === "map" && isLoading && (
                <MapSkeleton />
              )}
              {viewType === "list" && isLoading && (
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
