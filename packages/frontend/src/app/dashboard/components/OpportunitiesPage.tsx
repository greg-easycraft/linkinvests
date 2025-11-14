"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { OpportunityFilters } from "./OpportunityFilters";
import { OpportunityList } from "./OpportunityList";
import { OpportunityMap } from "./OpportunityMap";
import { OpportunityDetailsModal } from "./OpportunityDetailsModal";
import type { OpportunityFilters as IOpportunityFilters } from "~/types/filters";
import { Auction, BaseOpportunity, EnergyDiagnostic, Liquidation, Listing, type Opportunity, OpportunityType, Succession } from "@linkinvests/shared";
import { OpportunityListSkeleton } from "./OpportunityList/OpportunityListSkeleton";
import { MapSkeleton } from "./OpportunityMap/MapSkeleton";
import { MapEmptyState } from "./OpportunityMap/MapEmptyState";
import { OpportunitiesListQueryResult, OpportunitiesMapQueryResult } from "~/types/query-result";
import { PageHeader } from "./PageHeader";
import type { ExportFormat } from "~/server/services/export.service";
import type { UseMutationResult } from "@tanstack/react-query";
import { useDelayedSkeleton } from "~/hooks/useDelayedSkeleton";

type ViewType = "list" | "map";

// Map OpportunityType enum values back to URL segments
const TYPE_TO_URL_MAPPING: Record<OpportunityType, string> = {
  [OpportunityType.AUCTION]: 'auctions',
  [OpportunityType.SUCCESSION]: 'successions',
  [OpportunityType.LIQUIDATION]: 'liquidations',
  [OpportunityType.ENERGY_SIEVE]: 'energy-sieves',
  [OpportunityType.REAL_ESTATE_LISTING]: 'listings',
  [OpportunityType.DIVORCE]: 'divorces', // Not implemented yet
};

type ExportMutationResult = {
  success: boolean;
  error?: string;
  blob?: Blob;
};

type FiltersComponentProps = {
  filters: IOpportunityFilters;
  onFiltersChange: (filters: IOpportunityFilters) => void;
  onFiltersApply: (filters: IOpportunityFilters) => void;
  onReset: () => void;
  viewType: ViewType;
  onViewTypeChange: (viewType: ViewType) => void;
  currentType: OpportunityType;
  onTypeChange: (type: OpportunityType) => void;
};

type OpportunitiesPageProps<T extends BaseOpportunity> = {
  viewType: ViewType;
  onViewTypeChange: (viewType: ViewType) => void;
  currentFilters: IOpportunityFilters; // Current filters from query params
  onFiltersChange: (filters: IOpportunityFilters) => void;
  isLoading: boolean;
  listQueryResult?: OpportunitiesListQueryResult<T>;
  mapQueryResult?: OpportunitiesMapQueryResult<T>;
  getOpportunityById: (id: string) => Promise<T | null>;
  exportMutation: UseMutationResult<ExportMutationResult, Error, { format: ExportFormat; filters: IOpportunityFilters }>;
  FiltersComponent?: React.ComponentType<FiltersComponentProps>;
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

type ListingsPageProps = OpportunitiesPageProps<Listing> & {
  opportunityType: OpportunityType.REAL_ESTATE_LISTING;
}

type PageProps = AuctionsPageProps | SuccessionsPageProps | LiquidationsPageProps | EnergySievesPageProps | ListingsPageProps;

export default function OpportunitiesPage({
  viewType,
  opportunityType,
  currentFilters,
  listQueryResult,
  mapQueryResult,
  isLoading,
  onFiltersChange,
  onViewTypeChange,
  exportMutation,
  FiltersComponent = OpportunityFilters
}: PageProps): React.ReactElement {
  // Use delayed skeleton to prevent flashing when data loads quickly
  const showSkeleton = useDelayedSkeleton(isLoading);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersSidebarOpen, setIsFiltersSidebarOpen] = useState(true);

  const router = useRouter();

  const handleApplyFilters = useCallback((filtersToApply: IOpportunityFilters): void => {
    onFiltersChange({ ...filtersToApply, offset: 0 });
    setSelectedOpportunity(null);
  }, [onFiltersChange]);

  const handleResetFilters = useCallback((): void => {
    const resetFilters: IOpportunityFilters = {
      types: [opportunityType], // Keep the current type
      limit: 25,
      offset: 0,
    };
    onFiltersChange(resetFilters);
    setSelectedOpportunity(null);
  }, [opportunityType, onFiltersChange]);

  const handlePageChange = useCallback(
    (page: number): void => {
      const pageSize = currentFilters.limit ?? 25;
      const newOffset = (page - 1) * pageSize;
      const newFilters = { ...currentFilters, offset: newOffset };
      onFiltersChange(newFilters);
    },
    [currentFilters, onFiltersChange],
  );

  const handlePageSizeChange = useCallback(
    (pageSize: number): void => {
      const newFilters = { ...currentFilters, limit: pageSize, offset: 0 };
      onFiltersChange(newFilters);
    },
    [currentFilters, onFiltersChange],
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

  // Handle export
  const handleExport = useCallback(async (format: ExportFormat): Promise<{ success: boolean; error?: string; blob?: Blob }> => {
    try {
      const exportFilters = { ...currentFilters, limit: undefined, offset: undefined };
      const result = await exportMutation.mutateAsync({ format, filters: exportFilters });
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Export failed"
      };
    }
  }, [exportMutation, currentFilters]);

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
                <FiltersComponent
                  filters={currentFilters}
                  onFiltersChange={onFiltersChange}
                  onFiltersApply={handleApplyFilters}
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
          <div className="flex-1 flex flex-col overflow-hidden p-4">
            <div className="flex-1 overflow-hidden">
              {viewType === "list" && listQueryResult && (
                <OpportunityList
                  type={opportunityType}
                  data={listQueryResult}
                  selectedId={selectedOpportunity?.id}
                  onSelect={handleSelectOpportunity}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  onExport={handleExport}
                  filters={currentFilters}
                />
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

              {viewType === "map" && showSkeleton && (
                <MapSkeleton />
              )}
              {viewType === "list" && showSkeleton && (
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
