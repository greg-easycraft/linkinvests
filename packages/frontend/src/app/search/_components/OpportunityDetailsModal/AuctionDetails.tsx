"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Gavel,
  Euro,
  Home,
  Ruler,
  FileText,
  MapPin as VenueIcon,
  Phone,
  Mail,
  UserCheck,
  Banknote,
  ExternalLink
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { Auction } from "@linkinvests/shared";

interface AuctionDetailsProps {
  opportunity: Auction;
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(price);
};

const formatSquareFootage = (squareFootage: number): string => {
  return `${squareFootage} m²`;
};

export function AuctionDetails({ opportunity }: AuctionDetailsProps) {
  const hasPriceInfo = opportunity.currentPrice || opportunity.lowerEstimate ||
                      opportunity.upperEstimate || opportunity.reservePrice;
  const hasPropertyInfo = opportunity.propertyType || opportunity.squareFootage ||
                         opportunity.rooms || opportunity.dpe;
  const hasContactInfo = opportunity.auctionHouseContact && (
    opportunity.auctionHouseContact.name ||
    opportunity.auctionHouseContact.address ||
    opportunity.auctionHouseContact.phone ||
    opportunity.auctionHouseContact.email ||
    opportunity.auctionHouseContact.auctioneer ||
    opportunity.auctionHouseContact.registrationRequired ||
    opportunity.auctionHouseContact.depositAmount
  );

  if (!hasPriceInfo && !hasPropertyInfo && !hasContactInfo && !opportunity.url && !opportunity.description) {
    return null;
  }

  return (
    <Card className="mt-6 text-[var(--primary)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 mb-2">
          <Gavel className="h-5 w-5" />
          Détails de l&apos;enchère
        </CardTitle>
        {opportunity.url && (
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(opportunity.url!, '_blank', 'noopener,noreferrer')}
              title="Voir l'annonce originale"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Voir l&apos;annonce
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price Information */}
        {hasPriceInfo && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Prix et estimations</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              {opportunity.currentPrice && (
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Enchère actuelle:</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {formatPrice(Number(opportunity.currentPrice))}
                  </Badge>
                </div>
              )}
              {opportunity.lowerEstimate && opportunity.upperEstimate && (
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Estimation:</span>
                  <span className="text-blue-600">
                    {formatPrice(Number(opportunity.lowerEstimate))} - {formatPrice(Number(opportunity.upperEstimate))}
                  </span>
                </div>
              )}
              {opportunity.reservePrice && (
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">Prix de réserve:</span>
                  <span className="text-orange-600">{formatPrice(Number(opportunity.reservePrice))}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Property Information */}
        {hasPropertyInfo && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Informations du bien</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              {opportunity.propertyType && (
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Type:</span>
                  <span>{opportunity.propertyType}</span>
                </div>
              )}
              {opportunity.squareFootage && (
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Surface:</span>
                  <span>{formatSquareFootage(Number(opportunity.squareFootage))}</span>
                </div>
              )}
              {opportunity.rooms && (
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Nombre de pièces:</span>
                  <span>{opportunity.rooms}</span>
                </div>
              )}
              {opportunity.dpe && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">DPE:</span>
                  <Badge variant="outline">{opportunity.dpe}</Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {opportunity.description && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Description</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {opportunity.description}
            </p>
          </div>
        )}

        {/* Auction House Contact Information */}
        {hasContactInfo && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Informations de contact</h4>
            <div className="space-y-2 text-sm">
              {(opportunity.auctionHouseContact?.name || opportunity.auctionHouseContact?.address) && (
                <div className="flex items-start gap-2">
                  <VenueIcon className="h-4 w-4 text-gray-600 mt-0.5" />
                  <div>
                    {opportunity.auctionHouseContact.name && (
                      <div className="font-medium">{opportunity.auctionHouseContact.name}</div>
                    )}
                    {opportunity.auctionHouseContact.address && (
                      <div className="text-gray-600">{opportunity.auctionHouseContact.address}</div>
                    )}
                  </div>
                </div>
              )}

              {opportunity.auctionHouseContact?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-600" />
                  <span>{opportunity.auctionHouseContact.phone}</span>
                </div>
              )}

              {opportunity.auctionHouseContact?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-600" />
                  <span>{opportunity.auctionHouseContact.email}</span>
                </div>
              )}

              {opportunity.auctionHouseContact?.auctioneer && (
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Commissaire-priseur:</span>
                  <span>{opportunity.auctionHouseContact.auctioneer}</span>
                </div>
              )}

              {opportunity.auctionHouseContact?.registrationRequired && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-600" />
                  <Badge variant="outline" className="text-amber-600 border-amber-600">
                    Inscription requise
                  </Badge>
                </div>
              )}

              {opportunity.auctionHouseContact?.depositAmount && (
                <div className="flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Caution:</span>
                  <span>{formatPrice(Number(opportunity.auctionHouseContact.depositAmount))}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Auction Date */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Date de l&apos;enchère</h4>
          <div className="flex items-center gap-2 text-sm">
            <Gavel className="h-4 w-4 text-gray-600" />
            <span>
              {format(new Date(opportunity.opportunityDate), "PPPP", { locale: fr })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}