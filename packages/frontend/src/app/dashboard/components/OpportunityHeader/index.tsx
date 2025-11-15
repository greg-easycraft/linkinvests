"use client";

import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ExportButton } from "~/components/ExportButton";
import { CountSkeleton } from "../OpportunityList/CountSkeleton";
import { formatNumber } from "~/lib/utils";
import { OpportunityType } from "@linkinvests/shared";
import type { ExportFormat } from "~/server/services/export.service";

// Helper function to get opportunity type string for export filenames
function getOpportunityTypeString(type: OpportunityType): string {
  const typeMapping: Record<OpportunityType, string> = {
    [OpportunityType.AUCTION]: 'auctions',
    [OpportunityType.SUCCESSION]: 'successions',
    [OpportunityType.LIQUIDATION]: 'liquidations',
    [OpportunityType.ENERGY_SIEVE]: 'energy-sieves',
    [OpportunityType.REAL_ESTATE_LISTING]: 'listings',
    [OpportunityType.DIVORCE]: 'divorces',
  };
  return typeMapping[type] || 'opportunities';
}

interface OpportunityHeaderProps {
  // Data props
  opportunityType: OpportunityType;
  total?: number;
  isCountLoading?: boolean;

  // Pagination props
  currentPage: number;
  pageSize: number;
  totalPages: number;
  itemsOnPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;

  // Export props
  onExport: (format: ExportFormat) => Promise<{ success: boolean; error?: string; blob?: Blob }>;
  // TODO: Add filters prop when needed for filter-specific functionality
}

const pageSizeOptions = [25, 50, 100, 200];

export function OpportunityHeader({
  opportunityType,
  total,
  isCountLoading = false,
  currentPage,
  pageSize,
  totalPages,
  itemsOnPage,
  onPageChange,
  onPageSizeChange,
  onExport
}: OpportunityHeaderProps): React.ReactElement {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = startItem + itemsOnPage - 1;

  const handlePageSizeChange = (value: string): void => {
    const newPageSize = parseInt(value, 10);
    onPageSizeChange(newPageSize);
  };

  return (
    <div className="flex-shrink-0 pb-4 border-b border-[var(--primary)]/10">
      <div className="flex items-center justify-between mb-4">
        {/* Left side: Results count and page size */}
        <div className="flex items-center gap-6">
          <div className="text-sm text-[var(--secundary)]">
            Affichage de <span className="font-bold">{startItem}-{endItem}</span> sur{' '}
            {isCountLoading ? (
              <CountSkeleton />
            ) : (
              <span className="font-bold">{formatNumber(total || 0)}</span>
            )}{' '}
            opportunités
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--secundary)]">Éléments par page:</span>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
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

        {/* Right side: Export button */}
        <ExportButton
          onExport={onExport}
          totalCount={total || 0}
          opportunityType={getOpportunityTypeString(opportunityType)}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>

          <div className="text-sm text-[var(--secundary)] px-6">
            Page {currentPage} sur {totalPages}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="gap-2"
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}