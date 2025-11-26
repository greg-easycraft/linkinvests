"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  User,
  MapPin as VenueIcon,
  Phone,
  Mail,
  Clock,
  Globe,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { Succession } from "@linkinvests/shared";

interface SuccessionDetailsProps {
  opportunity: Succession;
}

export function SuccessionDetails({ opportunity }: SuccessionDetailsProps) {
  const hasPersonInfo = opportunity.firstName || opportunity.lastName;
  const hasMairieInfo = opportunity.mairieContact && (
    opportunity.mairieContact.name ||
    opportunity.mairieContact.address ||
    opportunity.mairieContact.phone ||
    opportunity.mairieContact.email ||
    opportunity.mairieContact.website ||
    opportunity.mairieContact.openingHours
  );

  if (!hasPersonInfo && !hasMairieInfo) {
    return null;
  }

  return (
    <Card className="mt-6 text-[var(--primary)] border-[var(--primary)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Détails de la succession
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Person Information */}
        {hasPersonInfo && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Informations du défunt</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              {(opportunity.firstName || opportunity.lastName) && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Nom:</span>
                  <span>
                    {[opportunity.firstName, opportunity.lastName].filter(Boolean).join(' ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mairie Contact Information */}
        {hasMairieInfo && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Informations de la mairie</h4>
            <div className="space-y-2 text-sm">
              {opportunity.mairieContact?.name && (
                <div className="flex items-start gap-2">
                  <VenueIcon className="h-4 w-4 text-gray-600 mt-0.5" />
                  <div>
                    <div className="font-medium">{opportunity.mairieContact.name}</div>
                    {opportunity.mairieContact.address && (
                      <div className="text-gray-600">{opportunity.mairieContact.address.complement1}
                      <br/>{opportunity.mairieContact.address.complement2}
                      <br/>{opportunity.mairieContact.address.numero_voie}
                      <br/>{opportunity.mairieContact.address.service_distribution}
                      <br/>{opportunity.mairieContact.address.code_postal}
                      <br/>{opportunity.mairieContact.address.nom_commune}</div>
                    )}
                  </div>
                </div>
              )}

              {opportunity.mairieContact?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-600" />
                  <span>{opportunity.mairieContact.phone}</span>
                </div>
              )}

              {opportunity.mairieContact?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-600" />
                  <span>{opportunity.mairieContact.email}</span>
                </div>
              )}

              {opportunity.mairieContact?.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-600" />
                  <a
                    href={opportunity.mairieContact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {opportunity.mairieContact.website}
                  </a>
                </div>
              )}

              {opportunity.mairieContact?.openingHours && (
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-gray-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Horaires d&apos;ouverture:</div>
                    <div className="text-gray-600 whitespace-pre-line">
                      {opportunity.mairieContact.openingHours}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Death Date */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Date du décès</h4>
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
