"use client";

import { Button } from "~/components/ui/button";
import type { OpportunityFilters } from "~/types/filters";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { OpportunityListEmptyState } from "./OpportunityListEmptyState";
import { Auction, OpportunityType, type Opportunity } from "@linkinvests/shared";
import { OpportunityCard } from "./OpportunityCard";
import { ExportButton } from "~/components/ExportButton";
import type { ExportFormat } from "~/server/services/export.service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { formatNumber } from "~/lib/utils";

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
  onPageSizeChange: (pageSize: number) => void;
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
  onPageSizeChange,
  onExport,
  type,
}: OpportunityListProps): React.ReactElement {
  if (data.opportunities.length === 0) {
    return <OpportunityListEmptyState />;
  }

  const startItem = (data.page - 1) * data.pageSize + 1;
  const endItem = Math.min(startItem + data.opportunities.length - 1, data.total);
  const pageSizeOptions = [25, 50, 100, 200];

  const handlePageSizeChange = (value: string): void => {
    const newPageSize = parseInt(value, 10);
    onPageSizeChange(newPageSize);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="flex-shrink-0 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-sm text-[var(--secundary)]">
              Affichage de <span className="font-bold">{startItem}-{endItem}</span> sur <span className="font-bold">{formatNumber(data.total)}</span> opportunités
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--secundary)]">Éléments par page:</span>
              <Select value={data.pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <ExportButton
            onExport={onExport}
            totalCount={data.total}
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3 pb-4">
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
      </div>

      {/* Fixed Pagination Footer */}
      {data.totalPages > 1 && (
        <div className="flex-shrink-0 border-t border-[var(--primary)]/20 pt-4">
          <div className="flex items-center justify-center">
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
        </div>
      )}
    </div>
  );
}