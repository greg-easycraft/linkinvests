"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import type { Opportunity } from "~/server/domains/opportunities/lib.types";
import type { OpportunityListResult } from "~/server/domains/opportunities/services/opportunity-service";
import type { OpportunityFilters } from "~/types/filters";
import { ChevronLeft, ChevronRight, MapPin, Calendar, ExternalLink } from "lucide-react";
import { OpportunityListEmptyState } from "./OpportunityListEmptyState";
import { StaticStreetView } from "./StaticStreetView";
import { OpportunityType } from "@linkinvests/shared";
import { TYPE_LABELS, TYPE_COLORS } from "~/constants/opportunity-types";

interface OpportunityListProps {
  data: OpportunityListResult;
  selectedId?: string;
  onSelect: (opportunity: Opportunity) => void;
  onPageChange: (page: number) => void;
  filters?: OpportunityFilters;
}


// Helper function to get URL from auction opportunities
function getOpportunityUrl(opportunity: Opportunity): string | null {
  if (opportunity.type === "auction") {
    return opportunity.url || null;
  }
  return null;
}

export function OpportunityList({
  data,
  selectedId,
  onSelect,
  onPageChange,
}: OpportunityListProps): React.ReactElement {
  if (data.opportunities.length === 0) {
    return <OpportunityListEmptyState />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-[var(--secundary)]">
          Affichage de {data.opportunities.length} sur {data.total} opportunités
        </div>
      </div>

      {/* Cards Grid */}
      <div className="space-y-3">
        {data.opportunities.map((opportunity) => {
          const opportunityUrl = getOpportunityUrl(opportunity);

          return (
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
                <StaticStreetView
                  latitude={opportunity.latitude}
                  longitude={opportunity.longitude}
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
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor: TYPE_COLORS[opportunity.type as OpportunityType],
                          color: 'white',
                          border: 'none'
                        }}
                      >
                        {TYPE_LABELS[opportunity.type] ?? opportunity.type}
                      </Badge>
                      {opportunityUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(opportunityUrl, '_blank', 'noopener,noreferrer');
                          }}
                          title="Voir l'annonce originale"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
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
                  </div>
                </div>
              </div>
            </div>
          </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center pt-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(data.page - 1)}
              disabled={data.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            <div className="text-sm text-[var(--secundary)] opacity-70 px-4">
              Page {data.page} sur {data.totalPages}
            </div>
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