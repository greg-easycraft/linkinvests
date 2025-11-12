"use client";

import React from "react";
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { ExportFormat } from "~/server/services/export.service";

export function ExportDropdown({
    onExport,
    disabled = false,
    isExporting = false,
    className = "",
    exportingFormat = null,
}: {
    onExport(format: ExportFormat): Promise<void>;
    disabled: boolean;
    className?: string;
    isExporting: boolean;
    exportingFormat: ExportFormat | null;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    className={className}
                >
                    {isExporting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Exporting {exportingFormat?.toUpperCase()}...
                        </>
                    ) : (
                        <>
                            <Download className="h-4 w-4" />
                            Export
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={`bg-[var(--primary)] text-[var(--secundary)] shadow-md ${className}`}>
                <DropdownMenuItem
                    onClick={() => onExport("csv")}
                    disabled={disabled}
                    className="cursor-pointer hover:bg-[var(--secundary)] hover:text-[var(--primary)]"
                >
                    <FileText className="h-4 w-4 mr-2" />
                    Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onExport("xlsx")}
                    disabled={disabled}
                    className="cursor-pointer hover:bg-[var(--secundary)] hover:text-[var(--primary)]"
                >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export as XLSX
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}