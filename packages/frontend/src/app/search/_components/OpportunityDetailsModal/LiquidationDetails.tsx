"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Building2,
  Phone,
  Mail,
  UserCheck,
  Hash,
  Calendar,
  FileText,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { Liquidation } from "@linkinvests/shared";

interface LiquidationDetailsProps {
  opportunity: Liquidation;
}

const formatSiret = (siret: string): string => {
  // Format SIRET as XXX XXX XXX XXXXX for readability
  if (siret.length === 14) {
    return `${siret.slice(0, 3)} ${siret.slice(3, 6)} ${siret.slice(6, 9)} ${siret.slice(9)}`;
  }
  return siret;
};

export function LiquidationDetails({ opportunity }: LiquidationDetailsProps) {
  const hasCompanyInfo = opportunity.companyContact && (
    opportunity.companyContact.name ||
    opportunity.companyContact.phone ||
    opportunity.companyContact.email ||
    opportunity.companyContact.legalRepresentative ||
    opportunity.companyContact.administrateur
  );

  if (!opportunity.siret && !hasCompanyInfo) {
    return null;
  }

  return (
    <Card className="mt-6 text-[var(--primary)] border-[var(--primary)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Détails de la liquidation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Company Information */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Informations de l&apos;entreprise</h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            {opportunity.siret && (
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-gray-600" />
                <span className="font-medium">SIRET:</span>
                <Badge variant="outline" className="font-mono bg-[var(--primary)]">
                  {formatSiret(opportunity.siret)}
                </Badge>
              </div>
            )}

            {opportunity.companyContact?.name && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <span className="font-medium">Raison sociale:</span>
                <span>{opportunity.companyContact.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        {hasCompanyInfo && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Informations de contact</h4>
            <div className="space-y-2 text-sm">
              {opportunity.companyContact?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Téléphone:</span>
                  <span>{opportunity.companyContact.phone}</span>
                </div>
              )}

              {opportunity.companyContact?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Email:</span>
                  <a
                    href={`mailto:${opportunity.companyContact.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {opportunity.companyContact.email}
                  </a>
                </div>
              )}

              {opportunity.companyContact?.legalRepresentative && (
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Représentant légal:</span>
                  <span>{opportunity.companyContact.legalRepresentative}</span>
                </div>
              )}

              {opportunity.companyContact?.administrateur && (
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Administrateur:</span>
                  <span className="text-blue-600">{opportunity.companyContact.administrateur}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Liquidation Date */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Date de liquidation</h4>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-600" />
            <span>
              {format(new Date(opportunity.opportunityDate), "PPPP", { locale: fr })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}