'use client';

import { useEffect, useState, useCallback, useRef } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MapPin, Calendar, Euro, Gavel } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { FullPageSpinner } from "~/components/ui/full-page-spinner";
import type { Auction, Opportunity, EnergyClass } from "@linkinvests/shared";
import {
  ImageCarousel,
  StreetView,
  AuctionDetails,
  AddressRefinementButton,
  addressNeedsRefinement,
  DiagnosticLinksTable,
} from "~/app/_components/opportunity";
import {
  getAuctionDiagnosticLinks,
  searchAndLinkDiagnostics,
  type DiagnosticLink,
} from "~/app/_actions/address-refinement/queries";

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

// Price formatting utility
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(price);
};

export function AuctionDetailContent({ auction }: AuctionDetailContentProps) {
  const [diagnosticLinks, setDiagnosticLinks] = useState<DiagnosticLink[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load existing links on mount
  useEffect(() => {
    async function loadExistingLinks() {
      if (!addressNeedsRefinement(auction.address ?? null)) {
        setIsLoadingLinks(false);
        return;
      }

      try {
        const links = await getAuctionDiagnosticLinks(auction.id);
        setDiagnosticLinks(links);
      } catch (error) {
        console.error('Failed to load diagnostic links:', error);
      } finally {
        setIsLoadingLinks(false);
      }
    }

    loadExistingLinks();
  }, [auction.id, auction.address]);

  const handleRefineAddress = useCallback(async () => {
    if (!auction.energyClass) return;

    setIsSearching(true);
    try {
      const links = await searchAndLinkDiagnostics({
        opportunityId: auction.id,
        opportunityType: 'auction',
        zipCode: auction.zipCode,
        energyClass: auction.energyClass as EnergyClass,
        squareFootage: auction.squareFootage ?? undefined,
        address: auction.address ?? undefined,
      });
      setDiagnosticLinks(links);

      // Show toast with results count
      if (links.length === 0) {
        toast.warning("Aucun diagnostic correspondant trouvé");
      } else {
        toast.success(`${links.length} diagnostic${links.length > 1 ? 's' : ''} correspondant${links.length > 1 ? 's' : ''} trouvé${links.length > 1 ? 's' : ''}`);
      }

      // Scroll to results after a short delay to ensure DOM is updated
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error('Failed to search and link diagnostics:', error);
      toast.error("Erreur lors de la recherche de diagnostics");
    } finally {
      setIsSearching(false);
    }
  }, [auction]);

  const showRefinementUI = addressNeedsRefinement(auction.address ?? null);

  return (
    <>
      {isSearching && <FullPageSpinner message="Recherche de diagnostics en cours..." />}
      <div className="max-w-4xl mx-auto space-y-6">
      {/* Title Card */}
      <Card className="bg-[var(--secundary)] border-[var(--primary)]">
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
              <MapPin className="h-5 w-5 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium font-heading text-[var(--primary)]">Adresse</div>
                  {showRefinementUI && !isLoadingLinks && (
                    <AddressRefinementButton
                      address={auction.address ?? null}
                      energyClass={auction.energyClass}
                      onRefine={handleRefineAddress}
                      isLoading={isSearching}
                      hasExistingLinks={diagnosticLinks.length > 0}
                    />
                  )}
                </div>
                <div className="text-sm !text-[var(--primary)]">
                  {auction.address ?? "Non disponible"}
                </div>
                <div className="text-xs mt-1 !text-[var(--primary)]">
                  {auction.zipCode} - Département {auction.department}
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="flex gap-3">
              <Calendar className="h-5 w-5 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium mb-1 font-heading text-[var(--primary)]">Date de l&apos;enchère</div>
                <div className="text-sm !text-[var(--primary)]">
                  {format(new Date(auction.opportunityDate), "dd MMMM yyyy", {
                    locale: fr,
                  })}
                </div>
              </div>
            </div>

            {/* Current Price */}
            {auction.currentPrice && (
              <div className="flex gap-3">
                <Euro className="h-5 w-5 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium mb-1 font-heading text-[var(--primary)]">Prix actuel</div>
                  <div className="text-sm font-semibold text-green-600">
                    {formatPrice(auction.currentPrice)}
                  </div>
                </div>
              </div>
            )}

            {/* Reserve Price */}
            {auction.reservePrice && (
              <div className="flex gap-3">
                <Gavel className="h-5 w-5 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium mb-1 font-heading text-[var(--primary)]">Mise à prix</div>
                  <div className="text-sm font-semibold text-orange-600">
                    {formatPrice(auction.reservePrice)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Type-specific details */}
      <AuctionDetails opportunity={auction} />

      {/* Diagnostic Links Table */}
      {showRefinementUI && (diagnosticLinks.length > 0 || isSearching) && (
        <div ref={resultsRef}>
          <DiagnosticLinksTable links={diagnosticLinks} isLoading={isSearching} />
        </div>
      )}

      {/* Timestamps */}
      <Card className="border-[var(--primary)]">
        <CardContent className="pt-6 bg-[var(--secundary)]">
          <div className="text-xs space-y-1">
            <div>Créé le : {format(new Date(auction.createdAt), "dd/MM/yyyy à HH:mm")}</div>
            {auction.updatedAt && (
              <div>Mis à jour le : {format(new Date(auction.updatedAt), "dd/MM/yyyy à HH:mm")}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
