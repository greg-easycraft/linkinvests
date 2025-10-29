"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import type { Opportunity } from "~/server/domains/opportunities/lib.types";
import type { OpportunityListResult } from "~/server/domains/opportunities/services/opportunity-service";
import { ChevronLeft, ChevronRight, MapPin, Calendar, Building2 } from "lucide-react";
import { StreetView } from "./StreetView";

interface OpportunityListProps {
  data: OpportunityListResult;
  selectedId?: number;
  onSelect: (opportunity: Opportunity) => void;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  succession: "Succession",
  liquidation: "Liquidation",
  energy_sieve: "Passoire énergétique",
  real_estate_listing: "Annonce immobilière",
  auction: "Vente aux enchères",
  divorce: "Divorce",
};

export function OpportunityList({
  data,
  selectedId,
  onSelect,
  onPageChange,
  isLoading = false,
}: OpportunityListProps): React.ReactElement {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-neutral-500">Chargement...</div>
      </div>
    );
  }

  if (data.opportunities.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-neutral-500">Aucune opportunité trouvée</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-[var(--primary)]">
        Affichage de {data.opportunities.length} sur {data.total} opportunités
      </div>

      {/* Cards Grid */}
      <div className="space-y-3">
        {data.opportunities.map((opportunity) => (
          <Card
            key={opportunity.id}
            onClick={() => onSelect(opportunity)}
            className={`cursor-pointer transition-all hover:shadow-lg bg-[var(--secundary)] text-[var(--primary)] border-2 ${
              selectedId === opportunity.id
                ? "border-blue-500 shadow-lg"
                : "border-transparent"
            }`}
          >
            <div className="flex gap-4 p-4">
              {/* Street View Thumbnail */}
              <div className="flex-shrink-0">
                <StreetView
                  address={opportunity.address}
                  latitude={opportunity.latitude}
                  longitude={opportunity.longitude}
                  className="w-48 h-32 rounded-lg"
                />
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-lg font-semibold font-heading truncate">
                      {opportunity.label}
                    </h3>
                    <div className="flex gap-2 flex-shrink-0">
                      <Badge variant="secondary">
                        {TYPE_LABELS[opportunity.type] ?? opportunity.type}
                      </Badge>
                      <Badge variant="outline">{opportunity.status}</Badge>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    {/* Address */}
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-[var(--primary)] opacity-70" />
                      <div className="min-w-0">
                        <div className="text-xs opacity-70 font-heading">Adresse</div>
                        <div className="truncate">{opportunity.address ?? "Non disponible"}</div>
                      </div>
                    </div>

                    {/* Department */}
                    <div className="flex items-start gap-2">
                      <Building2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-[var(--primary)] opacity-70" />
                      <div>
                        <div className="text-xs opacity-70 font-heading">Département</div>
                        <div>{opportunity.department} - {opportunity.zipCode}</div>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0 text-[var(--primary)] opacity-70" />
                      <div>
                        <div className="text-xs opacity-70 font-heading">Date</div>
                        <div>
                          {format(new Date(opportunity.opportunityDate), "dd MMMM yyyy", {
                            locale: fr,
                          })}
                        </div>
                      </div>
                    </div>

                    {/* SIRET */}
                    {opportunity.siret && (
                      <div className="flex items-start gap-2">
                        <Building2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-[var(--primary)] opacity-70" />
                        <div className="min-w-0">
                          <div className="text-xs opacity-70 font-heading">SIRET</div>
                          <div className="truncate font-mono text-xs">{opportunity.siret}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-[var(--primary)] opacity-70">
            Page {data.page} sur {data.totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(data.page - 1)}
              disabled={data.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(data.page + 1)}
              disabled={data.page === data.totalPages}
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
