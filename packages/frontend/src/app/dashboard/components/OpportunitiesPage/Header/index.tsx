"use client";

import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ExportButton } from "~/components/ExportButton";
import { CountSkeleton } from "./CountSkeleton";
import { formatNumber } from "~/lib/utils";
import { OpportunityType } from "@linkinvests/shared";
import type { ExportFormat } from "~/server/services/export.service";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

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
  itemsOnPage: number;
  onExport: (format: ExportFormat) => Promise<{ success: boolean; error?: string; blob?: Blob }>;
}

const pageSizeOptions = [25, 50, 100, 200];

export function OpportunityHeader({
  opportunityType,
  total,
  isCountLoading = false,
  itemsOnPage,
  onExport
}: OpportunityHeaderProps): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") ?? "25", 10);
  const totalPages = Math.ceil((total ?? 0) / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = startItem + itemsOnPage - 1;

  const handlePageSizeChange = useCallback((pageSize: number): void => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("pageSize", pageSize.toString());
    newSearchParams.set("page", "1");
    router.push(`?${newSearchParams.toString()}`);
  }, [router, searchParams]);

  const handlePageChange = useCallback((page: number): void => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", page.toString());
    router.push(`?${newSearchParams.toString()}`);
  }, [router, searchParams]);

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
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}

          <PageSizeSelector
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>

        {/* Right side: Export button */}
        <ExportButton
          onExport={onExport}
          totalCount={total || 0}
          opportunityType={getOpportunityTypeString(opportunityType)}
        />
      </div>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}): React.ReactElement {
  return (
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
  );
}

function PageSizeSelector({
  pageSize,
  onPageSizeChange,
}: {
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
}): React.ReactElement {
  return (
    <div className="flex items-center gap-2">
    <span className="text-sm text-[var(--secundary)]">Éléments par page:</span>
    <Select value={pageSize.toString()} onValueChange={(value: string) => onPageSizeChange(parseInt(value, 10))}>
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
  );
}