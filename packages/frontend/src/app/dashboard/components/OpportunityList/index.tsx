"use client";

import { Button } from "~/components/ui/button";
import type { OpportunityFilters } from "~/types/filters";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { OpportunityListEmptyState } from "./OpportunityListEmptyState";
import { Auction, OpportunityType, type Opportunity } from "@linkinvests/shared";
import { OpportunityCard } from "./OpportunityCard";
import { ExportButton } from "~/components/ExportButton";
import type { ExportFormat } from "~/server/services/export.service";

interface OpportunityListProps {
  data: {
    opportunities: Opportunity[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  selectedId?: string;
  onSelect: (opportunity: Opportunity) => void;
  onPageChange: (page: number) => void;
  onExport: (format: ExportFormat) => Promise<{ success: boolean; error?: string; blob?: Blob }>;
  filters?: OpportunityFilters;
  type: OpportunityType;
}


// Helper function to get URL from auction opportunities
function getAuctionUrl(auction: Auction): string | null {
  return auction.url || null;
}

export function OpportunityList({
  data,
  selectedId,
  onSelect,
  onPageChange,
  onExport,
  type,
}: OpportunityListProps): React.ReactElement {
  if (data.opportunities.length === 0) {
    return <OpportunityListEmptyState />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-[var(--secundary)]">
          Affichage de {data.opportunities.length} sur {data.total} opportunités
        </div>
        <ExportButton
          onExport={onExport}
          totalCount={data.total}
        />
      </div>

      {/* Cards Grid */}
      <div className="space-y-3">
        {data.opportunities.map((opportunity: Opportunity) => {
          const opportunityUrl = type === OpportunityType.AUCTION ? getAuctionUrl(opportunity as Auction) : null;

          return (
            <OpportunityCard 
            key={opportunity.id} 
            opportunity={opportunity} 
            onSelect={onSelect} 
            selectedId={selectedId} 
            type={type} 
            externalUrl={opportunityUrl ?? undefined} 
            />
          );
        })}
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center pt-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(data.page - 1)}
              disabled={data.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            <div className="text-sm text-[var(--secundary)] opacity-70 px-4">
              Page {data.page} sur {data.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(data.page + 1)}
              disabled={data.page === data.totalPages}
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}