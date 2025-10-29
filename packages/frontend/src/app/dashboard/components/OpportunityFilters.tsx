"use client";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { OpportunityType } from "@linkinvests/shared";
import type { OpportunityFilters as IOpportunityFilters } from "~/types/filters";

interface OpportunityFiltersProps {
  filters: IOpportunityFilters;
  onFiltersChange: (filters: IOpportunityFilters) => void;
  onApply: () => void;
  onReset: () => void;
}

const TYPE_LABELS: Record<OpportunityType, string> = {
  [OpportunityType.SUCCESSION]: "Succession",
  [OpportunityType.LIQUIDATION]: "Liquidation",
  [OpportunityType.ENERGY_SIEVE]: "Passoire énergétique",
  [OpportunityType.REAL_ESTATE_LISTING]: "Annonce immobilière",
  [OpportunityType.AUCTION]: "Vente aux enchères",
  [OpportunityType.DIVORCE]: "Divorce",
};

export function OpportunityFilters({
  filters,
  onFiltersChange,
  onApply,
  onReset,
}: OpportunityFiltersProps): React.ReactElement {
  const handleTypeToggle = (type: OpportunityType): void => {
    const currentTypes = filters.types ?? [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];

    onFiltersChange({ ...filters, types: newTypes });
  };

  return (
    <Card className="bg-[var(--secundary)] text-[var(--primary)]">
      <CardHeader>
        <CardTitle className="text-lg">Filtres</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Type Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block font-heading">Type</label>
          <div className="flex flex-wrap gap-2">
            {Object.values(OpportunityType).map((type) => (
              <Button
                key={type}
                variant={filters.types?.includes(type) ? "default" : "outline"}
                size="sm"
                onClick={() => handleTypeToggle(type)}
                type="button"
              >
                {TYPE_LABELS[type]}
              </Button>
            ))}
          </div>
        </div>

        {/* Department Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block font-heading">Département</label>
          <Input
            type="number"
            placeholder="Numéro de département"
            value={filters.department ?? ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                department: e.target.value ? parseInt(e.target.value, 10) : undefined,
              })
            }
          />
        </div>

        {/* Zip Code Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block font-heading">Code postal</label>
          <Input
            type="number"
            placeholder="Code postal"
            value={filters.zipCode ?? ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                zipCode: e.target.value ? parseInt(e.target.value, 10) : undefined,
              })
            }
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block font-heading">Statut</label>
          <Input
            type="text"
            placeholder="Saisir le statut"
            value={filters.status ?? ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                status: e.target.value || undefined,
              })
            }
          />
        </div>

        {/* Date Range Filters */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block font-heading">Date après le</label>
            <Input
              type="date"
              value={
                filters.dateRange?.from
                  ? new Date(filters.dateRange.from).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) => {
                const newFrom = e.target.value ? new Date(e.target.value) : undefined;
                onFiltersChange({
                  ...filters,
                  dateRange: newFrom
                    ? {
                        from: newFrom,
                        to: filters.dateRange?.to ?? new Date(),
                      }
                    : undefined,
                });
              }}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block font-heading">Date avant le</label>
            <Input
              type="date"
              value={
                filters.dateRange?.to
                  ? new Date(filters.dateRange.to).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) => {
                const newTo = e.target.value ? new Date(e.target.value) : undefined;
                onFiltersChange({
                  ...filters,
                  dateRange:
                    newTo || filters.dateRange?.from
                      ? {
                          from: filters.dateRange?.from ?? new Date("2000-01-01"),
                          to: newTo ?? new Date(),
                        }
                      : undefined,
                });
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button onClick={onApply} className="flex-1">
            Appliquer
          </Button>
          <Button onClick={onReset} variant="outline">
            Réinitialiser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
