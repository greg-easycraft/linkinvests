"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { OpportunitiesMap } from "./OpportunitiesMap";
import { OpportunityDetailsModal } from "../OpportunityDetailsModal";
import { Auction, BaseOpportunity, EnergyDiagnostic, getDocIdFromSuccessionExternalId, Liquidation, Listing, type Opportunity, OpportunityType, Succession } from "@linkinvests/shared";
import { OpportunitiesDataQueryResult } from "~/types/query-result";
import { OpportunityHeader } from "./Header";
import { PageHeader } from "../PageHeader";
import { SelectionActionBar } from "./SelectionActionBar";
import type { ExportFormat } from "~/server/services/export.service";
import { useDelayedSkeleton } from "~/hooks/useDelayedSkeleton";
import { OpportunitiesList } from "./OpportunitiesList";
import { openMailto } from "~/utils/mailto";
import { toast } from "sonner";

type OpportunitiesPageProps<T extends BaseOpportunity> = {
  // Unified data structure
  data?: OpportunitiesDataQueryResult<T>;
  count?: number;
  isCountLoading?: boolean;
  isLoading: boolean;
  getOpportunityById: (id: string) => Promise<T | null>;
  onExport: (format: ExportFormat) => Promise<{ success: boolean; error?: string; blob?: Blob }>;
  FiltersComponent: React.ReactNode;
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
  opportunityType,
  data,
  count,
  isCountLoading,
  isLoading,
  onExport,
  FiltersComponent
}: PageProps): React.ReactElement {
  // Use delayed skeleton to prevent flashing when data loads quickly
  const showSkeleton = useDelayedSkeleton(isLoading);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersSidebarOpen, setIsFiltersSidebarOpen] = useState(true);
  const [selectedOpportunities, setSelectedOpportunities] = useState<Map<string, Succession>>(new Map());
  const searchParams = useSearchParams();

  // Selection is only enabled for successions
  const isSelectionEnabled = opportunityType === OpportunityType.SUCCESSION;

  // Clear selection when page/filters change
  useEffect(() => {
    setSelectedOpportunities(new Map());
  }, [searchParams]);

  const selectedIds = useMemo(() => new Set(selectedOpportunities.keys()), [selectedOpportunities]);

  const handleToggleSelection = useCallback((opportunity: Opportunity) => {
    setSelectedOpportunities(prev => {
      const next = new Map(prev);
      if (next.has(opportunity.id)) {
        next.delete(opportunity.id);
      } else {
        next.set(opportunity.id, opportunity as Succession);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const opportunities = data?.opportunities ?? [];
    setSelectedOpportunities(new Map(opportunities.map(o => [o.id, o as Succession])));
  }, [data?.opportunities]);

  const handleClearSelection = useCallback(() => {
    setSelectedOpportunities(new Map());
  }, []);

  const handleEmailMairie = useCallback(() => {
    selectedOpportunities.forEach((succession) => {
      const email = succession.mairieContact?.email;
      if (!email) {
        toast.warning(`Aucun email de mairie trouvé pour la succession ${succession.firstName} ${succession.lastName}`);
        return;
      };
      const docId = getDocIdFromSuccessionExternalId(succession.externalId);
      openMailto({
        to: email,
        subject: "Demande d'acte de décès",
        body: `Madame, Monsieur,\n\nJe souhaiterais obtenir l'acte de décès pour de ${succession.firstName} ${succession.lastName} (acte n° ${docId}).\n\nCordialement,`,
      });
    });
  }, [selectedOpportunities]);

  const viewMode = useMemo(() => {
    const viewType = searchParams.get("view");
    if (viewType === "map") return "map";
    return "list";
  }, [searchParams]);

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
                {FiltersComponent}
              </div>
            )}
          </div>
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden p-4">
            {/* Common Header with pagination and controls */}
            <OpportunityHeader
              opportunityType={opportunityType}
              total={count}
              isCountLoading={isCountLoading}
              itemsOnPage={(data?.opportunities ?? []).length}
              onExport={onExport}
              isSelectionEnabled={isSelectionEnabled}
              selectedCount={selectedOpportunities.size}
              onSelectAll={handleSelectAll}
              onClearSelection={handleClearSelection}
            />

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
              {/* List View */}
              {viewMode === "list" ? (
                <OpportunitiesList
                  isLoading={showSkeleton}
                  type={opportunityType}
                  opportunities={data?.opportunities ?? []}
                  selectedId={selectedOpportunity?.id}
                  onSelect={handleSelectOpportunity}
                  isSelectionEnabled={isSelectionEnabled}
                  selectedIds={selectedIds}
                  onToggleSelection={handleToggleSelection}
                />
              ) : (
                <OpportunitiesMap
                  isLoading={showSkeleton}
                  type={opportunityType}
                  opportunities={data?.opportunities ?? []}
                  selectedId={selectedOpportunity?.id}
                  onSelect={handleSelectOpportunity}
                />
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

      {/* Selection Action Bar (only for successions) */}
      {isSelectionEnabled && (
        <SelectionActionBar
          selectedCount={selectedOpportunities.size}
          onEmailMairie={handleEmailMairie}
          onClearSelection={handleClearSelection}
        />
      )}
    </div>
  );
}