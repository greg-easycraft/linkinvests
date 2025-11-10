"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { X, MapPin, Calendar, Building2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { Opportunity } from "~/server/domains/opportunities/lib.types";
import { StreetView } from "./StreetView";
import { AuctionDetails } from "./AuctionDetails";

interface OpportunitySidebarProps {
  opportunity: Opportunity | null;
  onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  succession: "Succession",
  liquidation: "Liquidation",
  energy_sieve: "Passoire énergétique",
  real_estate_listing: "Annonce immobilière",
  auction: "Vente aux enchères",
  divorce: "Divorce",
};

export function OpportunitySidebar({
  opportunity,
  onClose,
}: OpportunitySidebarProps): React.ReactElement | null {
  if (!opportunity) {
    return (
      <Card className="h-full bg-[var(--secundary)] text-[var(--primary)]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-sm">Sélectionnez une opportunité pour voir les détails</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-auto bg-[var(--secundary)] text-[var(--primary)]">
      {/* Street View at the top */}
      <StreetView
        address={opportunity.address}
        latitude={opportunity.latitude}
        longitude={opportunity.longitude}
        className="w-full h-64 rounded-t-lg"
      />

      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <CardTitle className="text-xl">{opportunity.label}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Type */}
        <div className="flex gap-2">
          <Badge variant="secondary">
            {TYPE_LABELS[opportunity.type] ?? opportunity.type}
          </Badge>
        </div>

        {/* Details Grid */}
        <div className="space-y-4">
          {/* Address */}
          <div className="flex gap-3">
            <MapPin className="h-5 w-5 text-neutral-500 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium mb-1 font-heading">Adresse</div>
              <div className="text-sm text-neutral-600">
                {opportunity.address ?? "Non disponible"}
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                {opportunity.zipCode} - Département {opportunity.department}
              </div>
            </div>
          </div>

          {/* SIRET - only for liquidation opportunities */}
          {opportunity.type === 'liquidation' && opportunity.siret && (
            <div className="flex gap-3">
              <Building2 className="h-5 w-5 text-neutral-500 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium mb-1 font-heading">SIRET</div>
                <div className="text-sm text-neutral-600">{opportunity.siret}</div>
              </div>
            </div>
          )}

          {/* Date */}
          <div className="flex gap-3">
            <Calendar className="h-5 w-5 text-neutral-500 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium mb-1 font-heading">Date de l&apos;opportunité</div>
              <div className="text-sm text-neutral-600">
                {format(new Date(opportunity.opportunityDate), "dd MMMM yyyy", {
                  locale: fr,
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Auction Details (only for auction opportunities) */}
        {opportunity.type === 'auction' && (
          <AuctionDetails opportunity={opportunity} />
        )}

        {/* Timestamps */}
        <div className="pt-4 border-t border-neutral-200">
          <div className="text-xs text-neutral-500 space-y-1">
            <div>Créé le : {format(new Date(opportunity.createdAt), "dd/MM/yyyy à HH:mm")}</div>
            {opportunity.updatedAt && (
              <div>Mis à jour le : {format(new Date(opportunity.updatedAt), "dd/MM/yyyy à HH:mm")}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
