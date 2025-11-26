'use client';

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MapPin, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { Auction, Opportunity } from "@linkinvests/shared";
import { ImageCarousel, StreetView, AuctionDetails } from "~/app/_components/opportunity";

interface AuctionDetailContentProps {
  auction: Auction;
}

// Type guard to check if opportunity has pictures
const hasPictureFields = (opportunity: Opportunity): opportunity is Extract<Opportunity, { mainPicture?: string; pictures?: string[] }> => {
  return 'mainPicture' in opportunity || 'pictures' in opportunity;
};

// Helper to check if opportunity has any pictures available
const hasAvailablePictures = (opportunity: Opportunity): boolean => {
  if (!hasPictureFields(opportunity)) return false;
  return !!(opportunity.mainPicture || (opportunity.pictures && opportunity.pictures.length > 0));
};

export function AuctionDetailContent({ auction }: AuctionDetailContentProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title Card */}
      <Card className="bg-[var(--secundary)]">
        <CardHeader>
          <CardTitle className="text-2xl text-[var(--primary)]">
            {auction.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image carousel or Street View */}
          {hasAvailablePictures(auction) ? (
            <ImageCarousel opportunity={auction} className="w-full" />
          ) : (
            <StreetView
              address={auction.address ?? null}
              latitude={auction.latitude}
              longitude={auction.longitude}
              className="w-full h-64 rounded-lg"
            />
          )}

          {/* Details Grid */}
          <div className="space-y-4">
            {/* Address */}
            <div className="flex gap-3">
              <MapPin className="h-5 w-5 text-neutral-500 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium mb-1 font-heading text-[var(--primary)]">Adresse</div>
                <div className="text-sm text-neutral-600">
                  {auction.address ?? "Non disponible"}
                </div>
                <div className="text-xs text-neutral-500 mt-1">
                  {auction.zipCode} - Département {auction.department}
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="flex gap-3">
              <Calendar className="h-5 w-5 text-neutral-500 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium mb-1 font-heading text-[var(--primary)]">Date de l&apos;opportunité</div>
                <div className="text-sm text-neutral-600">
                  {format(new Date(auction.opportunityDate), "dd MMMM yyyy", {
                    locale: fr,
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Type-specific details */}
      <AuctionDetails opportunity={auction} />

      {/* Timestamps */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-xs text-neutral-500 space-y-1">
            <div>Créé le : {format(new Date(auction.createdAt), "dd/MM/yyyy à HH:mm")}</div>
            {auction.updatedAt && (
              <div>Mis à jour le : {format(new Date(auction.updatedAt), "dd/MM/yyyy à HH:mm")}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
