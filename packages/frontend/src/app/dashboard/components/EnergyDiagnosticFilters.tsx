"use client";

import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { DepartmentsInput } from "~/components/ui/departments-input";
import { ZipCodeInput } from "~/components/ui/zip-code-input";
// Using HTML input checkbox since no checkbox UI component exists
import { OpportunityType } from "@linkinvests/shared";
import type { OpportunityFilters as IOpportunityFilters, DatePeriod, EnergyClass } from "~/types/filters";
import { DATE_PERIOD_OPTIONS } from "~/constants/date-periods";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { ViewToggle } from "./ViewToggle";

type ViewType = "list" | "map";

interface EnergyDiagnosticFiltersProps {
  filters: IOpportunityFilters;
  onFiltersChange: (filters: IOpportunityFilters) => void;
  onFiltersApply: (filters: IOpportunityFilters) => void;
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
  [OpportunityType.REAL_ESTATE_LISTING]: "Annonce immobilière",
  [OpportunityType.AUCTION]: "Vente aux enchères",
  // [OpportunityType.DIVORCE]: "Divorce",
};

// Custom order for dropdown display - Succession last
const TYPE_DISPLAY_ORDER: OpportunityType[] = [
  OpportunityType.LIQUIDATION,
  OpportunityType.ENERGY_SIEVE,
  OpportunityType.REAL_ESTATE_LISTING,
  OpportunityType.AUCTION,
  OpportunityType.SUCCESSION, // Last
];

// Energy classes with labels
const ENERGY_CLASSES: { value: EnergyClass; label: string; color: string }[] = [
  { value: 'A', label: 'A (Très économe)', color: 'text-green-600' },
  { value: 'B', label: 'B (Économe)', color: 'text-green-500' },
  { value: 'C', label: 'C (Conventionnel)', color: 'text-yellow-500' },
  { value: 'D', label: 'D (Peu économe)', color: 'text-orange-400' },
  { value: 'E', label: 'E (Peu économe)', color: 'text-orange-600' },
  { value: 'F', label: 'F (Énergivore)', color: 'text-red-500' },
  { value: 'G', label: 'G (Très énergivore)', color: 'text-red-700' },
];

export function EnergyDiagnosticFilters({
  filters,
  onFiltersChange,
  onFiltersApply,
  onReset,
  viewType,
  onViewTypeChange,
  currentType,
  onTypeChange,
}: EnergyDiagnosticFiltersProps): React.ReactElement {

  // Debounce filter changes and auto-apply after 500ms of no changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onFiltersApply(filters);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [filters, onFiltersApply]);

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

  const handleDatePeriodChange = (value: string): void => {
    const datePeriod = value === "" ? undefined : (value as DatePeriod);
    onFiltersChange({ ...filters, datePeriod, dateRange: undefined }); // Clear old dateRange when using period
  };

  const handleEnergyClassChange = (energyClass: EnergyClass, checked: boolean): void => {
    const currentClasses = filters.energyClasses ?? [];
    const updatedClasses = checked
      ? [...currentClasses, energyClass]
      : currentClasses.filter(c => c !== energyClass);

    onFiltersChange({ ...filters, energyClasses: updatedClasses.length > 0 ? updatedClasses : undefined });
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
                {TYPE_DISPLAY_ORDER.map((type) => (
                  <SelectItem key={type} value={type}>
                    {TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Energy Class Filter - Multiple checkboxes */}
          <div>
            <label className="text-sm font-medium mb-2 block font-heading">Classes énergétiques</label>
            <div className="space-y-2">
              {ENERGY_CLASSES.map((energyClass) => {
                const isChecked = filters.energyClasses?.includes(energyClass.value) ?? false;
                return (
                  <div key={energyClass.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`energy-class-${energyClass.value}`}
                      checked={isChecked}
                      onChange={(e) => handleEnergyClassChange(energyClass.value, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`energy-class-${energyClass.value}`}
                      className={`text-sm cursor-pointer ${energyClass.color} font-medium`}
                    >
                      {energyClass.label}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Department Filter - Custom input with search */}
          <div>
            <label className="text-sm font-medium mb-2 block font-heading">Départements</label>
            <DepartmentsInput
              value={filters.departments?.map(String) ?? []}
              onChange={handleDepartmentChange}
              placeholder="Rechercher par numéro ou nom..."
            />
          </div>

          {/* Zip Code Filter - Custom input */}
          <div>
            <label className="text-sm font-medium mb-2 block font-heading">Codes postaux</label>
            <ZipCodeInput
              value={filters.zipCodes ?? []}
              onChange={handleZipCodeChange}
              placeholder="Entrez un code postal"
            />
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
          <Button onClick={onReset} variant="outline" className="flex-1">
            Réinitialiser
          </Button>
        </div>
      </div>
    </Card>
  );
}