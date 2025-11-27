import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { MapPin, Calendar, ExternalLink, Building2, Zap, Euro, RefreshCcw, Gavel } from "lucide-react";
import { StaticStreetView } from "./StaticStreetView";
import { TYPE_LABELS, TYPE_COLORS } from "~/constants/opportunity-types";
import { EnergyClass, Opportunity, OpportunityType } from "@linkinvests/shared";
import { EnergyClassBadge } from "~/components/ui/energy-class-badge";

// Type guard to check if opportunity has pictures
const hasPictureFields = (opportunity: Opportunity): opportunity is Extract<Opportunity, { mainPicture?: string; pictures?: string[] }> => {
  return 'mainPicture' in opportunity;
};

// Type guard to check if opportunity has property details (squareFootage and energyClass)
const hasPropertyDetails = (opportunity: Opportunity): opportunity is Extract<Opportunity, { energyClass?: string; squareFootage?: number }> => {
  return 'energyClass' in opportunity || 'squareFootage' in opportunity;
};

// Type guard to check if opportunity has price fields
const hasPriceFields = (opportunity: Opportunity): opportunity is Extract<Opportunity, { price?: number; currentPrice?: number; reservePrice?: number }> => {
  return 'price' in opportunity || 'currentPrice' in opportunity || 'reservePrice' in opportunity;
};

// Type guard to check if opportunity is a listing with lastChangeDate
const hasLastChangeDate = (opportunity: Opportunity): opportunity is Extract<Opportunity, { lastChangeDate?: string }> => {
  return 'lastChangeDate' in opportunity;
};

// Type guard to check if opportunity is an auction with currentPrice and reservePrice
const isAuction = (opportunity: Opportunity): opportunity is Extract<Opportunity, { currentPrice?: number; reservePrice?: number }> => {
  return 'currentPrice' in opportunity || 'reservePrice' in opportunity;
};

// Price formatting utility
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(price);
};

// Get price value based on opportunity type and available fields
const getPriceValue = (opportunity: Opportunity): number | undefined => {
  if ('currentPrice' in opportunity && opportunity.currentPrice) {
    return opportunity.currentPrice;
  }
  if ('reservePrice' in opportunity && opportunity.reservePrice) {
    return opportunity.reservePrice;
  }
  if ('price' in opportunity && opportunity.price) {
    return opportunity.price;
  }
  return undefined;
};

interface OpportunityCardProps {
  opportunity: Opportunity;
  onSelect: (opportunity: Opportunity) => void;
  selectedId?: string;
  type: OpportunityType;
  externalUrl?: string;
  isSelectionEnabled?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (opportunity: Opportunity) => void;
}

export function OpportunityCard({ opportunity, onSelect, selectedId, type, externalUrl, isSelectionEnabled, isSelected, onToggleSelection }: OpportunityCardProps): React.ReactElement {
    return (
        <Card
          key={opportunity.id}
          onClick={() => onSelect(opportunity)}
          className={`cursor-pointer transition-all hover:shadow-lg bg-[var(--secundary)] text-[var(--primary)] border ${selectedId === opportunity.id
              ? "border-blue-500 shadow-lg"
              : "border-[var(--primary)] shadow-lg"
            }`}
        >
          <div className="flex gap-4 p-4">
            {/* Checkbox for selection */}
            {isSelectionEnabled && (
              <div className="flex-shrink-0 flex items-center">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleSelection?.(opportunity)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            {/* Thumbnail - Main Picture or Street View fallback */}
            <div className="flex-shrink-0">
              {hasPictureFields(opportunity) && opportunity.mainPicture ? (
                <img
                  src={opportunity.mainPicture}
                  alt="Property main picture"
                  width={96}
                  height={72}
                  className="rounded-sm object-cover"
                />
              ) : (
                <StaticStreetView
                  latitude={opportunity.latitude}
                  longitude={opportunity.longitude}
                />
              )}
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
                <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
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
                      <div className="text-xs opacity-70 font-heading">
                        {type === OpportunityType.REAL_ESTATE_LISTING ? "Publication" : "Date"}
                      </div>
                      <div>
                        {format(new Date(opportunity.opportunityDate), "dd MMMM yyyy", {
                          locale: fr,
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Last Change Date (listings only) */}
                  {hasLastChangeDate(opportunity) && opportunity.lastChangeDate && (
                    <div className="flex items-start gap-2">
                      <RefreshCcw className="h-4 w-4 mt-0.5 flex-shrink-0 text-[var(--primary)] opacity-70" />
                      <div>
                        <div className="text-xs opacity-70 font-heading">Modification</div>
                        <div>
                          {format(new Date(opportunity.lastChangeDate), "dd MMMM yyyy", {
                            locale: fr,
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Price - For auctions show both currentPrice and reservePrice */}
                  {type === OpportunityType.AUCTION && isAuction(opportunity) && (
                    <>
                      {opportunity.currentPrice && (
                        <div className="flex items-start gap-2">
                          <Euro className="h-4 w-4 mt-0.5 flex-shrink-0 text-[var(--primary)] opacity-70" />
                          <div>
                            <div className="text-xs opacity-70 font-heading">Prix actuel</div>
                            <div className="font-semibold text-green-600">
                              {formatPrice(opportunity.currentPrice)}
                            </div>
                          </div>
                        </div>
                      )}
                      {opportunity.reservePrice && (
                        <div className="flex items-start gap-2">
                          <Gavel className="h-4 w-4 mt-0.5 flex-shrink-0 text-[var(--primary)] opacity-70" />
                          <div>
                            <div className="text-xs opacity-70 font-heading">Mise à prix</div>
                            <div className="font-semibold text-orange-600">
                              {formatPrice(opportunity.reservePrice)}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Price - For non-auctions */}
                  {type !== OpportunityType.AUCTION && hasPriceFields(opportunity) && getPriceValue(opportunity) && (
                    <div className="flex items-start gap-2">
                      <Euro className="h-4 w-4 mt-0.5 flex-shrink-0 text-[var(--primary)] opacity-70" />
                      <div>
                        <div className="text-xs opacity-70 font-heading">Prix</div>
                        <div className="font-semibold text-green-600">
                          {formatPrice(getPriceValue(opportunity)!)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Square Meters */}
                  {hasPropertyDetails(opportunity) && opportunity.squareFootage && (
                    <div className="flex items-start gap-2">
                      <Building2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-[var(--primary)] opacity-70" />
                      <div>
                        <div className="text-xs opacity-70 font-heading">Surface</div>
                        <div>{opportunity.squareFootage} m²</div>
                      </div>
                    </div>
                  )}

                  {/* Energy Class */}
                  {hasPropertyDetails(opportunity) && (
                    <div className="flex items-start gap-2">
                      <Zap className="h-4 w-4 mt-0.5 flex-shrink-0 text-[var(--primary)] opacity-70" />
                      <div>
                        <div className="text-xs opacity-70 font-heading">Classe énergétique</div>
                        <EnergyClassBadge energyClass={opportunity.energyClass as EnergyClass} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      );
    }