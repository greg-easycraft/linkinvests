"use client";

import { useCallback, useMemo } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { DepartmentsInput } from "~/components/ui/departments-input";
import { ZipCodeInput } from "~/components/ui/zip-code-input";
import { OpportunityType } from "@linkinvests/shared";
import type { OpportunityFilters as IOpportunityFilters, DatePeriod, DatePeriodOption } from "~/types/filters";
import { DATE_PERIOD_OPTIONS } from "~/constants/date-periods";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { ViewToggle } from "../ViewToggle";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ViewType = "list" | "map";

interface OpportunityFiltersProps {
  filters: IOpportunityFilters;
  onFiltersChange: (filters: IOpportunityFilters) => void;
  currentType: OpportunityType;
  ExtraFilters?: React.ReactNode;
  datePeriodOptions?: DatePeriodOption[];
}

// @ts-expect-error - TODO: Add real estate listing and divorce types
const TYPE_LABELS: Record<OpportunityType, string> = {
  [OpportunityType.SUCCESSION]: "Successions",
  [OpportunityType.LIQUIDATION]: "Liquidations",
  [OpportunityType.ENERGY_SIEVE]: "Passoires énergétiques",
  [OpportunityType.REAL_ESTATE_LISTING]: "Annonces immobilières",
  [OpportunityType.AUCTION]: "Ventes aux enchères",
  // [OpportunityType.DIVORCE]: "Divorces",
};

const TYPE_TO_PATH: Record<OpportunityType, string> = {
  [OpportunityType.SUCCESSION]: "successions",
  [OpportunityType.LIQUIDATION]: "liquidations",
  [OpportunityType.ENERGY_SIEVE]: "energy-sieves",
  [OpportunityType.REAL_ESTATE_LISTING]: "listings",
  [OpportunityType.AUCTION]: "auctions",
  [OpportunityType.DIVORCE]: "divorces",
};

// Custom order for dropdown display - Succession last
const TYPE_DISPLAY_ORDER: OpportunityType[] = [
  OpportunityType.LIQUIDATION,
  OpportunityType.ENERGY_SIEVE,
  OpportunityType.REAL_ESTATE_LISTING,
  OpportunityType.AUCTION,
  OpportunityType.SUCCESSION, // Last
];

export function BaseFilters({
  filters,
  currentType,
  onFiltersChange,
  ExtraFilters,
  datePeriodOptions = DATE_PERIOD_OPTIONS
}: OpportunityFiltersProps): React.ReactElement {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const viewType = useMemo(() => {
    const param = searchParams.get("view") as ViewType;
    if(param === "map") return "map";
    return "list";
  }, [searchParams]);

  const handleViewTypeChange = useCallback((value: ViewType): void => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("view", value);
    router.push(`/dashboard/${TYPE_TO_PATH[currentType]}?${newParams.toString()}`);
  }, [router, currentType, searchParams]);

  const handleTypeChange = useCallback((value: string): void => {
    router.push(`/dashboard/${TYPE_TO_PATH[value as OpportunityType]}`);
  }, [router, searchParams]);


  const handleReset = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  return (
    <Card className="bg-[var(--secundary)] text-[var(--primary)] h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        {/* View Toggle */}
        <div>
          <ViewToggle value={viewType} onValueChange={handleViewTypeChange} />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {/* Type Filter - Single select */}
          <div>
            <label className="text-sm font-medium mb-2 block font-heading">Type d&apos;opportunité</label>
            <Select
              value={currentType}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type..." />
              </SelectTrigger>
              <SelectContent>
                {TYPE_DISPLAY_ORDER.map((type) => (
                  <SelectItem key={type} value={type}>
                    {TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department Filter - Custom input with search */}
          <div>
            <label className="text-sm font-medium mb-2 block font-heading">Départements</label>
            <DepartmentsInput
              value={filters.departments?.map(String) ?? []}
              onChange={(value) => onFiltersChange({ ...filters, departments: value })}
              placeholder="Rechercher par numéro ou nom..."
            />
          </div>

          {/* Zip Code Filter - Custom input */}
          <div>
            <label className="text-sm font-medium mb-2 block font-heading">Codes postaux</label>
            <ZipCodeInput
              value={filters.zipCodes ?? []}
              onChange={(value) => onFiltersChange({ ...filters, zipCodes: value })}
              placeholder="Entrez un code postal"
            />
          </div>

          {/* Date Period Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block font-heading">Opportunités depuis</label>
            <Select
              value={filters.datePeriod ?? ""}
              onValueChange={(value) => onFiltersChange({ ...filters, datePeriod: value as DatePeriod })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes les opportunités" />
              </SelectTrigger>
              <SelectContent>
                {datePeriodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {ExtraFilters && <div className="space-y-4">{ExtraFilters}</div>}
        </div>
      </CardContent>

      {/* Fixed Action Buttons */}
      <div className="flex-shrink-0 p-6 pt-0">
        <div className="flex gap-2">
          <Button onClick={handleReset} variant="outline" className="flex-1">
            Réinitialiser
          </Button>
        </div>
      </div>
    </Card>
  );
}
