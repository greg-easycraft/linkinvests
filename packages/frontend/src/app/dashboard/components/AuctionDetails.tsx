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
  Banknote
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { Opportunity } from "~/server/domains/opportunities/lib.types";
import { OpportunityType } from "@linkinvests/shared";

interface AuctionDetailsProps {
  opportunity: Opportunity;
}

interface AuctionExtraData {
  id?: string;
  url?: string;
  auctionType?: string;
  propertyType?: string;
  currentPrice?: number;
  lowerEstimate?: number;
  upperEstimate?: number;
  reservePrice?: number;
  price?: number;
  description?: string;
  dpe?: string;
  squareFootage?: number;
  rooms?: number;
  auctionVenue?: string;
}

interface AuctionHouseContactData {
  type: 'auction_house';
  name: string;
  address: string;
  phone?: string;
  email?: string;
  auctioneer?: string;
  registrationRequired?: boolean;
  depositAmount?: number;
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
  // Only render for auction opportunities
  if (opportunity.type !== OpportunityType.AUCTION) {
    return null;
  }

  const extraData = opportunity.extraData as AuctionExtraData | null;
  const contactData = opportunity.contactData as AuctionHouseContactData | null;

  if (!extraData && !contactData) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gavel className="h-5 w-5" />
          Détails de l&apos;enchère
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price Information */}
        {(extraData?.currentPrice || extraData?.lowerEstimate || extraData?.upperEstimate || extraData?.reservePrice || extraData?.price) && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Prix et estimations</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              {extraData.currentPrice && (
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Enchère actuelle:</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {formatPrice(extraData.currentPrice)}
                  </Badge>
                </div>
              )}
              {extraData.lowerEstimate && extraData.upperEstimate && (
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Estimation:</span>
                  <span className="text-blue-600">
                    {formatPrice(extraData.lowerEstimate)} - {formatPrice(extraData.upperEstimate)}
                  </span>
                </div>
              )}
              {extraData.reservePrice && (
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">Prix de réserve:</span>
                  <span className="text-orange-600">{formatPrice(extraData.reservePrice)}</span>
                </div>
              )}
              {extraData.price && !extraData.currentPrice && (
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Prix:</span>
                  <span>{formatPrice(extraData.price)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Property Information */}
        {(extraData?.propertyType || extraData?.squareFootage || extraData?.rooms || extraData?.dpe) && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Informations du bien</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              {extraData.propertyType && (
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Type:</span>
                  <span>{extraData.propertyType}</span>
                </div>
              )}
              {extraData.squareFootage && (
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Surface:</span>
                  <span>{formatSquareFootage(extraData.squareFootage)}</span>
                </div>
              )}
              {extraData.rooms && (
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Nombre de pièces:</span>
                  <span>{extraData.rooms}</span>
                </div>
              )}
              {extraData.dpe && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">DPE:</span>
                  <Badge variant="outline">{extraData.dpe}</Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {extraData?.description && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Description</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {extraData.description}
            </p>
          </div>
        )}

        {/* Auction House Contact Information */}
        {contactData && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Informations de contact</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <VenueIcon className="h-4 w-4 text-gray-600 mt-0.5" />
                <div>
                  <div className="font-medium">{contactData.name}</div>
                  <div className="text-gray-600">{contactData.address}</div>
                </div>
              </div>

              {contactData.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-600" />
                  <span>{contactData.phone}</span>
                </div>
              )}

              {contactData.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-600" />
                  <span>{contactData.email}</span>
                </div>
              )}

              {contactData.auctioneer && (
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Commissaire-priseur:</span>
                  <span>{contactData.auctioneer}</span>
                </div>
              )}

              {contactData.registrationRequired && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-600" />
                  <Badge variant="outline" className="text-amber-600 border-amber-600">
                    Inscription requise
                  </Badge>
                </div>
              )}

              {contactData.depositAmount && (
                <div className="flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Caution:</span>
                  <span>{formatPrice(contactData.depositAmount)}</span>
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