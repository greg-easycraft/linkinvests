import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { MapPin, Calendar, ExternalLink } from "lucide-react";
import { StaticStreetView } from "./StaticStreetView";
import { TYPE_LABELS, TYPE_COLORS } from "~/constants/opportunity-types";
import { Opportunity, OpportunityType } from "@linkinvests/shared";

interface OpportunityCardProps {
  opportunity: Opportunity;
  onSelect: (opportunity: Opportunity) => void;
  selectedId?: string;
  type: OpportunityType;
  externalUrl?: string;
}

export function OpportunityCard({ opportunity, onSelect, selectedId, type, externalUrl }: OpportunityCardProps): React.ReactElement {
    return (
        <Card
          key={opportunity.id}
          onClick={() => onSelect(opportunity)}
          className={`cursor-pointer transition-all hover:shadow-lg bg-[var(--secundary)] text-[var(--primary)] border-2 ${selectedId === opportunity.id
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
                        backgroundColor: TYPE_COLORS[type],
                        color: 'white',
                        border: 'none'
                      }}
                    >
                      {TYPE_LABELS[type] ?? type}
                    </Badge>
                    {externalUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(externalUrl, '_blank', 'noopener,noreferrer');
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
    }