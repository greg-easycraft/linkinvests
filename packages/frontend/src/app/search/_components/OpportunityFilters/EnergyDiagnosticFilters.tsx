"use client";

import { OpportunityType } from "@linkinvests/shared";
import type { EnergyDiagnosticFilters as IEnergyDiagnosticFilters } from "~/types/filters";
import { BaseFilters } from "./BaseFilters";
import { EnergyClassFilter } from "~/components/filters";

interface EnergyDiagnosticFiltersProps {
  filters: IEnergyDiagnosticFilters;
  onFiltersChange: (filters: IEnergyDiagnosticFilters) => void;
}


export function EnergyDiagnosticFilters({
  filters,
  onFiltersChange,
}: EnergyDiagnosticFiltersProps): React.ReactElement {

  const CustomFilters = (
    <>
      <EnergyClassFilter
        value={filters.energyClasses}
        onChange={(value) => onFiltersChange({ ...filters, energyClasses: value })}
        type="sieve"
        label="Classes énergétiques"
      />
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