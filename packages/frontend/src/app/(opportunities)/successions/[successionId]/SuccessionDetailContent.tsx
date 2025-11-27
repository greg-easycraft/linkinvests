'use client';

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MapPin, Calendar, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { Succession } from "@linkinvests/shared";
import { StreetView, SuccessionDetails } from "~/app/_components/opportunity";
import { openMailto } from "~/utils/mailto";

interface SuccessionDetailContentProps {
  succession: Succession;
}

export function SuccessionDetailContent({ succession }: SuccessionDetailContentProps) {
  const hasEmail = !!succession.mairieContact?.email;

  const handleEmailMairie = () => {
    const email = succession.mairieContact?.email;
    if (!email) return;

    openMailto({
      to: email,
      subject: "Demande d'acte de décès",
      body: `Madame, Monsieur,\n\nJe souhaiterais obtenir un acte de décès pour la référence suivante :\n${succession.externalId}\n\nCordialement,`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title Card */}
      <Card className="bg-[var(--secundary)] border-[var(--primary)]">
        <CardHeader>
          <CardTitle className="text-2xl text-[var(--primary)]">
            {succession.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Street View */}
          <StreetView
            address={succession.address ?? null}
            latitude={succession.latitude}
            longitude={succession.longitude}
            className="w-full h-64 rounded-lg"
          />

          {/* Details Grid */}
          <div className="space-y-4">
            {/* Address */}
            <div className="flex gap-3">
              <MapPin className="h-5 w-5 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium font-heading text-[var(--primary)]">Adresse</div>
                  {/* Email Mairie Button */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEmailMairie}
                            disabled={!hasEmail}
                            className="gap-2"
                          >
                            <Mail className="h-4 w-4" />
                            Contacter la mairie
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {!hasEmail && (
                        <TooltipContent>
                          <p>Email de la mairie non disponible</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="text-sm !text-[var(--primary)]">
                  {succession.address ?? "Non disponible"}
                </div>
                <div className="text-xs mt-1 !text-[var(--primary)]">
                  {succession.zipCode} - Département {succession.department}
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="flex gap-3">
              <Calendar className="h-5 w-5 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium mb-1 font-heading text-[var(--primary)]">Date de l&apos;opportunité</div>
                <div className="text-sm !text-[var(--primary)]">
                  {format(new Date(succession.opportunityDate), "dd MMMM yyyy", {
                    locale: fr,
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Type-specific details */}
      <SuccessionDetails opportunity={succession} />

      {/* Timestamps */}
      <Card className="border-[var(--primary)]">
        <CardContent className="pt-6 bg-[var(--secundary)]">
          <div className="text-xs space-y-1">
            <div>Créé le : {format(new Date(succession.createdAt), "dd/MM/yyyy à HH:mm")}</div>
            {succession.updatedAt && (
              <div>Mis à jour le : {format(new Date(succession.updatedAt), "dd/MM/yyyy à HH:mm")}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
