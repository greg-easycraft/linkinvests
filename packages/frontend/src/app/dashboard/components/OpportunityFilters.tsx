"use client";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { MultiSelect, type MultiSelectOption } from "~/components/ui/multi-select";
import { MultiInput } from "~/components/ui/multi-input";
import { OpportunityType } from "@linkinvests/shared";
import type { OpportunityFilters as IOpportunityFilters, DatePeriod } from "~/types/filters";
import { FRENCH_DEPARTMENTS } from "~/constants/departments";
import { DATE_PERIOD_OPTIONS } from "~/constants/date-periods";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { ViewToggle } from "./ViewToggle";

type ViewType = "list" | "map";

interface OpportunityFiltersProps {
  filters: IOpportunityFilters;
  onFiltersChange: (filters: IOpportunityFilters) => void;
  onApply: () => void;
  onReset: () => void;
  viewType: ViewType;
  onViewTypeChange: (viewType: ViewType) => void;
  currentType: OpportunityType;
  onTypeChange: (type: OpportunityType) => void;
}

// @ts-expect-error - TODO: Add real estate listing and divorce types
const TYPE_LABELS: Record<OpportunityType, string> = {
  [OpportunityType.SUCCESSION]: "Succession",
  [OpportunityType.LIQUIDATION]: "Liquidation",
  [OpportunityType.ENERGY_SIEVE]: "Passoire énergétique",
  // [OpportunityType.REAL_ESTATE_LISTING]: "Annonce immobilière",
  [OpportunityType.AUCTION]: "Vente aux enchères",
  // [OpportunityType.DIVORCE]: "Divorce",
};

export function OpportunityFilters({
  filters,
  onFiltersChange,
  onApply,
  onReset,
  viewType,
  onViewTypeChange,
  currentType,
  onTypeChange,
}: OpportunityFiltersProps): React.ReactElement {

  // Convert departments to MultiSelectOption format
  const departmentOptions: MultiSelectOption[] = FRENCH_DEPARTMENTS.map((dept) => ({
    label: dept.label,
    value: dept.id.toString(),
    searchValue: `${dept.id} ${dept.name}`,
  }));

  // No longer needed since we use Select component directly

  const handleDepartmentChange = (selectedValues: string[]): void => {
    onFiltersChange({ ...filters, departments: selectedValues });
  };

  const handleZipCodeChange = (zipCodes: string[]): void => {
    onFiltersChange({ ...filters, zipCodes });
  };

  const handleTypeChange = (value: string): void => {
    if (value && Object.values(OpportunityType).includes(value as OpportunityType)) {
      onTypeChange(value as OpportunityType);
    }
  };

  // Validator for zip codes (French postal codes are 5 digits)
  const validateZipCode = (value: string): boolean => {
    const num = parseInt(value, 10);
    return !isNaN(num) && num > 0 && value.length === 5;
  };

  const handleDatePeriodChange = (value: string): void => {
    const datePeriod = value === "" ? undefined : (value as DatePeriod);
    onFiltersChange({ ...filters, datePeriod, dateRange: undefined }); // Clear old dateRange when using period
  };

  return (
    <Card className="bg-[var(--secundary)] text-[var(--primary)] h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        {/* View Toggle */}
        <div>
          <ViewToggle value={viewType} onValueChange={onViewTypeChange} />
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
                {Object.values(OpportunityType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department Filter - Multi-select with search */}
          <div>
            <label className="text-sm font-medium mb-2 block font-heading">Départements</label>
            <MultiSelect
              options={departmentOptions}
              selected={filters.departments?.map(String) ?? []}
              onChange={handleDepartmentChange}
              placeholder="Départements"
              searchPlaceholder="Rechercher par numéro ou nom..."
              maxDisplayItems={3}
            />
          </div>

          {/* Zip Code Filter - Multi-input */}
          <div>
            <label className="text-sm font-medium mb-2 block font-heading">Codes postaux</label>
            <MultiInput
              values={filters.zipCodes?.map(String) ?? []}
              onChange={handleZipCodeChange}
              placeholder="Entrez les codes postaux séparés par des virgules..."
              type="number"
              validator={validateZipCode}
              maxValues={10}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Format: 5 chiffres (ex: 75001, 13001)
            </p>
          </div>

          {/* Date Period Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block font-heading">Opportunités depuis</label>
            <Select
              value={filters.datePeriod ?? ""}
              onValueChange={handleDatePeriodChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes les opportunités" />
              </SelectTrigger>
              <SelectContent>
                {DATE_PERIOD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>

      {/* Fixed Action Buttons */}
      <div className="flex-shrink-0 p-6 pt-0">
        <div className="flex gap-2">
          <Button onClick={onApply} className="flex-1">
            Appliquer
          </Button>
          <Button onClick={onReset} variant="outline">
            Réinitialiser
          </Button>
        </div>
      </div>
    </Card>
  );
}
