"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { X, MapPin, Calendar, Building2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import * as Dialog from "@radix-ui/react-dialog";
import type {
  Opportunity,
  AuctionOpportunity,
  SuccessionOpportunity,
  LiquidationOpportunity,
  EnergyDiagnostic
} from "~/server/domains/opportunities/lib.types";
import { StreetView } from "./StreetView";
import { AuctionDetails } from "./AuctionDetails";
import { SuccessionDetails } from "./SuccessionDetails";
import { LiquidationDetails } from "./LiquidationDetails";
import { EnergySieveDetails } from "./EnergySieveDetails";

interface OpportunityDetailsModalProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
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

export function OpportunityDetailsModal({
  opportunity,
  isOpen,
  onClose,
}: OpportunityDetailsModalProps): React.ReactElement {
  if (!opportunity) return <></>;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl max-h-[90vh] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg overflow-y-auto">
          <div className="flex flex-row items-center justify-between space-y-0 pb-4">
            <Dialog.Title className="text-xl pr-8 text-[var(--primary)]">{opportunity.label}</Dialog.Title>
            <Dialog.Close asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

        <div className="space-y-6">
          {/* Street View */}
          <StreetView
            address={opportunity.address}
            latitude={opportunity.latitude}
            longitude={opportunity.longitude}
            className="w-full h-64 rounded-lg"
          />

          {/* Type Badge */}
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
                <div className="text-sm font-medium mb-1 font-heading text-[var(--primary)]">Adresse</div>
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
                <div className="text-sm font-medium mb-1 font-heading text-[var(--primary)]">Date de l&apos;opportunité</div>
                <div className="text-sm text-neutral-600">
                  {format(new Date(opportunity.opportunityDate), "dd MMMM yyyy", {
                    locale: fr,
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Type-specific Details */}
          {opportunity.type === 'auction' && (
            <AuctionDetails opportunity={opportunity as AuctionOpportunity & { type: 'auction' }} />
          )}
          {opportunity.type === 'succession' && (
            <SuccessionDetails opportunity={opportunity as SuccessionOpportunity & { type: 'succession' }} />
          )}
          {opportunity.type === 'liquidation' && (
            <LiquidationDetails opportunity={opportunity as LiquidationOpportunity & { type: 'liquidation' }} />
          )}
          {opportunity.type === 'energy_sieve' && (
            <EnergySieveDetails opportunity={opportunity as EnergyDiagnostic & { type: 'energy_sieve' }} />
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
        </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}