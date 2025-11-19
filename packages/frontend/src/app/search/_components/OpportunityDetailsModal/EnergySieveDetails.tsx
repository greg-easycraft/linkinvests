"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Zap,
  FileText,
  Hash,
  TrendingDown,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { EnergyDiagnostic } from "@linkinvests/shared";

interface EnergySieveDetailsProps {
  opportunity: EnergyDiagnostic;
}

// Energy class colors and labels
const ENERGY_CLASS_INFO: Record<string, { color: string; label: string }> = {
  'A': { color: 'green-600', label: 'Très performant' },
  'B': { color: 'green-500', label: 'Performant' },
  'C': { color: 'yellow-500', label: 'Assez performant' },
  'D': { color: 'orange-500', label: 'Peu performant' },
  'E': { color: 'orange-600', label: 'Peu performant' },
  'F': { color: 'red-500', label: 'Très peu performant' },
  'G': { color: 'red-600', label: 'Extrêmement peu performant' },
};

export function EnergySieveDetails({ opportunity }: EnergySieveDetailsProps) {
  const energyClassInfo = ENERGY_CLASS_INFO[opportunity.energyClass];

  return (
    <Card className="mt-6 text-[var(--primary)] border-[var(--primary)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Détails de la passoire énergétique
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Energy Information */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Informations énergétiques</h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            {opportunity.energyClass && (
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-gray-600" />
                <span className="font-medium">Classe énergétique:</span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`font-bold bg-${energyClassInfo?.color ?? '[var(--primary)]'}`}
                  >
                    {opportunity.energyClass}
                  </Badge>
                  {energyClassInfo && (
                    <span className="text-gray-600 text-xs">
                      ({energyClassInfo.label})
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-gray-600" />
              <span className="font-medium">Numéro DPE:</span>
              <Badge variant="outline" className="font-mono bg-[var(--primary)]">
                {opportunity.externalId}
              </Badge>
            </div>
          </div>
        </div>

        {/* Energy Efficiency Explanation */}
        {opportunity.energyClass && ['F', 'G'].includes(opportunity.energyClass) && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">À propos des passoires énergétiques</h4>
            <div className="bg-orange-50 border border-orange-200 rounded-md p-3 text-sm">
              <div className="flex items-start gap-2">
                <TrendingDown className="h-4 w-4 text-orange-600 mt-0.5" />
                <div className="text-orange-800">
                  <p className="font-medium mb-1">Logement énergivore</p>
                  <p className="text-xs leading-relaxed">
                    Ce bien est classé comme &quot;passoire énergétique&quot; (classe {opportunity.energyClass}).
                    Il présente une consommation d&apos;énergie très élevée et pourrait nécessiter des travaux
                    de rénovation énergétique importants pour améliorer ses performances.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DPE Date */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Date du diagnostic</h4>
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-gray-600" />
            <span>
              {format(new Date(opportunity.opportunityDate), "PPPP", { locale: fr })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}