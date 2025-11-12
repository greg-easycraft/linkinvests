"use client";

import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { ExportFormat } from "~/server/services/export.service";
import type { OpportunityFilters } from "~/types/filters";
import { ExportDropdown } from "./ExportDropDown";

interface ExportButtonProps {
  onExport: (format: ExportFormat) => Promise<{ success: boolean; error?: string; blob?: Blob }>;
  filters: OpportunityFilters;
  totalCount: number;
  disabled?: boolean;
  className?: string;
}

export function ExportButton({
  onExport,
  totalCount,
  disabled = false,
  className = ""
}: Omit<ExportButtonProps, 'filters'>) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);

  const EXPORT_LIMIT = 500;
  const isOverLimit = totalCount > EXPORT_LIMIT;
  const isButtonDisabled = disabled || isOverLimit || isExporting;

  const handleExport = async (format: ExportFormat) => {
    if (isButtonDisabled) return;

    setIsExporting(true);
    setExportingFormat(format);

    try {
      const result = await onExport(format);

      if (!result.success || !result.blob) {
        // Show error (you might want to use a toast library here)
        console.error('Export failed:', result.error);
        alert(`Export failed: ${result.error || 'Unknown error'}`);
        return;
      }
      // Trigger download
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `export_${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  };

  if (isOverLimit) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <ExportDropdown className={className} onExport={handleExport} disabled={isButtonDisabled} isExporting={isExporting} exportingFormat={exportingFormat} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Too many results ({totalCount.toLocaleString()}).
              Maximum {EXPORT_LIMIT} items allowed.
              Please refine your filters.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <ExportDropdown 
    className={className}
    onExport={handleExport} 
    disabled={isButtonDisabled} 
    isExporting={isExporting} 
    exportingFormat={exportingFormat} 
  />;
}