"use client";

import { useCallback, useMemo } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { DepartmentsInput } from "~/components/ui/departments-input";
import { ZipCodeInput } from "~/components/ui/zip-code-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { OpportunityType } from "@linkinvests/shared";
import type { IOpportunityFilters, DatePeriodOption } from "~/types/filters";
import { OpportunityTypeFilter, DatePeriodFilter, OPPORTUNITY_TYPE_TO_PATH } from "~/components/filters";
import { ViewToggle } from "../ViewToggle";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DEFAULT_SORT_OPTIONS, type SortOption } from "~/constants/sort-options";

type ViewType = "list" | "map";

interface OpportunityFiltersProps<T extends IOpportunityFilters> {
  filters: T;
  onFiltersChange: (filters: T) => void;
  currentType: OpportunityType;
  ExtraFilters?: React.ReactNode;
  datePeriodOptions?: DatePeriodOption[];
  sortOptions?: SortOption[];
}

export function BaseFilters({
  filters,
  currentType,
  onFiltersChange,
  ExtraFilters,
  datePeriodOptions,
  sortOptions = DEFAULT_SORT_OPTIONS,
}: OpportunityFiltersProps<IOpportunityFilters>): React.ReactElement {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const handleTypeChange = useCallback((selectedValue: OpportunityType): void => {
    const url = `/search/${OPPORTUNITY_TYPE_TO_PATH[selectedValue]}`;
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('page');
    router.push(url + `?${newParams.toString()}`);
  }, [router, searchParams]);

  const viewType = useMemo(() => {
    const param = searchParams.get("view") as ViewType;
    if (param === "map") return "map";
    return "list";
  }, [searchParams]);

  const currentSortValue = useMemo(() => {
    const sortBy = filters.sortBy ?? "opportunityDate";
    const sortOrder = filters.sortOrder ?? "desc";
    return `${sortBy}_${sortOrder}`;
  }, [filters.sortBy, filters.sortOrder]);

  const handleSortChange = useCallback((value: string): void => {
    const selectedOption = sortOptions.find(opt => opt.value === value);
    if (selectedOption) {
      onFiltersChange({
        ...filters,
        sortBy: selectedOption.sortBy,
        sortOrder: selectedOption.sortOrder,
        page: 1,
      });
    }
  }, [filters, onFiltersChange, sortOptions]);

  const handleViewTypeChange = useCallback((value: ViewType): void => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("view", value);
    router.push(`/search/${OPPORTUNITY_TYPE_TO_PATH[currentType]}?${newParams.toString()}`);
  }, [router, currentType, searchParams]);

  const handleReset = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  return (
    <Card className="bg-[var(--secundary)] text-[var(--primary)] h-full flex flex-col shadow-sm">
      <CardHeader className="flex-shrink-0 space-y-4">
        {/* View Toggle */}
        <div>
          <ViewToggle value={viewType} onValueChange={handleViewTypeChange} />
        </div>

        {/* Sort Select */}
        <div>
          <label className="text-sm font-medium mb-2 block font-heading">Trier par</label>
          <Select value={currentSortValue} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Trier par..." />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {/* Type Filter */}
          <OpportunityTypeFilter value={currentType} onChange={handleTypeChange} />

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
          <DatePeriodFilter
            value={filters.datePeriod}
            onChange={(value) => onFiltersChange({ ...filters, datePeriod: value })}
            datePeriodOptions={datePeriodOptions}
          />

          {ExtraFilters && <div className="space-y-4">{ExtraFilters}</div>}
        </div>
      </CardContent>

      {/* Fixed Action Buttons */}
      {searchParams.size ? (<div className="flex-shrink-0 p-6 pt-0">
        <div className="flex gap-2">
          <Button onClick={handleReset} variant="outline" className="flex-1">
            Réinitialiser
          </Button>
        </div>
      </div>) : null}
    </Card>
  );
}
