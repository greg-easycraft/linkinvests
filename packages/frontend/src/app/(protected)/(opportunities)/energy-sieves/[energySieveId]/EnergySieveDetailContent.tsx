'use client';

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MapPin, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { EnergyDiagnostic } from "@linkinvests/shared";
import { StreetView, EnergySieveDetails } from "~/app/(protected)/_components/opportunity";

interface EnergySieveDetailContentProps {
  energySieve: EnergyDiagnostic;
}

export function EnergySieveDetailContent({ energySieve }: EnergySieveDetailContentProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title Card */}
      <Card className="bg-[var(--secundary)]">
        <CardHeader>
          <CardTitle className="text-2xl text-[var(--primary)]">
            {energySieve.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Street View */}
          <StreetView
            address={energySieve.address ?? null}
            latitude={energySieve.latitude}
            longitude={energySieve.longitude}
            className="w-full h-64 rounded-lg"
          />

          {/* Details Grid */}
          <div className="space-y-4">
            {/* Address */}
            <div className="flex gap-3">
              <MapPin className="h-5 w-5 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium mb-1 font-heading text-[var(--primary)]">Adresse</div>
                <div className="text-sm !text-[var(--primary)]">
                  {energySieve.address ?? "Non disponible"}
                </div>
                <div className="text-xs mt-1 !text-[var(--primary)]">
                  {energySieve.zipCode} - Département {energySieve.department}
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="flex gap-3">
              <Calendar className="h-5 w-5 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium mb-1 font-heading text-[var(--primary)]">Date de l&apos;opportunité</div>
                <div className="text-sm !text-[var(--primary)]">
                  {format(new Date(energySieve.opportunityDate), "dd MMMM yyyy", {
                    locale: fr,
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Type-specific details */}
      <EnergySieveDetails opportunity={energySieve} />

      {/* Timestamps */}
      <Card className="bg-[var(--secundary)]">
        <CardContent className="pt-6 bg-[var(--secundary)]">
          <div className="text-xs space-y-1">
            <div>Créé le : {format(new Date(energySieve.createdAt), "dd/MM/yyyy à HH:mm")}</div>
            {energySieve.updatedAt && (
              <div>Mis à jour le : {format(new Date(energySieve.updatedAt), "dd/MM/yyyy à HH:mm")}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
