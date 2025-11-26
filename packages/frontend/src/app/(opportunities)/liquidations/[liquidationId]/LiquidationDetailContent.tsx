'use client';

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MapPin, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { Liquidation } from "@linkinvests/shared";
import { StreetView, LiquidationDetails } from "~/app/_components/opportunity";

interface LiquidationDetailContentProps {
  liquidation: Liquidation;
}

export function LiquidationDetailContent({ liquidation }: LiquidationDetailContentProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Link href="/search/liquidations">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux liquidations
        </Button>
      </Link>

      {/* Title Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-[var(--primary)]">
            {liquidation.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Street View */}
          <StreetView
            address={liquidation.address ?? null}
            latitude={liquidation.latitude}
            longitude={liquidation.longitude}
            className="w-full h-64 rounded-lg"
          />

          {/* Details Grid */}
          <div className="space-y-4">
            {/* Address */}
            <div className="flex gap-3">
              <MapPin className="h-5 w-5 text-neutral-500 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium mb-1 font-heading text-[var(--primary)]">Adresse</div>
                <div className="text-sm text-neutral-600">
                  {liquidation.address ?? "Non disponible"}
                </div>
                <div className="text-xs text-neutral-500 mt-1">
                  {liquidation.zipCode} - Département {liquidation.department}
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="flex gap-3">
              <Calendar className="h-5 w-5 text-neutral-500 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium mb-1 font-heading text-[var(--primary)]">Date de l&apos;opportunité</div>
                <div className="text-sm text-neutral-600">
                  {format(new Date(liquidation.opportunityDate), "dd MMMM yyyy", {
                    locale: fr,
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Type-specific details */}
      <LiquidationDetails opportunity={liquidation} />

      {/* Timestamps */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-xs text-neutral-500 space-y-1">
            <div>Créé le : {format(new Date(liquidation.createdAt), "dd/MM/yyyy à HH:mm")}</div>
            {liquidation.updatedAt && (
              <div>Mis à jour le : {format(new Date(liquidation.updatedAt), "dd/MM/yyyy à HH:mm")}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
