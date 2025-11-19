"use client";

import { OpportunityType } from "@linkinvests/shared";
import type { EnergyDiagnosticFilters as IEnergyDiagnosticFilters, EnergyClass } from "~/types/filters";
import { BaseFilters } from "./BaseFilters";

interface EnergyDiagnosticFiltersProps {
  filters: IEnergyDiagnosticFilters;
  onFiltersChange: (filters: IEnergyDiagnosticFilters) => void;
}


// Energy classes with labels
const ENERGY_CLASSES: { value: EnergyClass; label: string; color: string }[] = [
  { value: 'E', label: 'E (Peu économe)', color: 'text-orange-600' },
  { value: 'F', label: 'F (Énergivore)', color: 'text-red-500' },
  { value: 'G', label: 'G (Très énergivore)', color: 'text-red-700' },
];

export function EnergyDiagnosticFilters({
  filters,
  onFiltersChange,
}: EnergyDiagnosticFiltersProps): React.ReactElement {

  const handleEnergyClassChange = (energyClass: EnergyClass, checked: boolean): void => {
    const currentClasses = filters.energyClasses ?? [];
    const updatedClasses = checked
      ? [...currentClasses, energyClass]
      : currentClasses.filter(c => c !== energyClass);

    onFiltersChange({ ...filters, energyClasses: updatedClasses.length > 0 ? updatedClasses : undefined });
  };

  const CustomFilters = (
    <>
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
    </>
  );

  return (
    <BaseFilters
      currentType={OpportunityType.ENERGY_SIEVE}
      filters={filters}
      onFiltersChange={onFiltersChange}
      ExtraFilters={CustomFilters}
    />
  );
}