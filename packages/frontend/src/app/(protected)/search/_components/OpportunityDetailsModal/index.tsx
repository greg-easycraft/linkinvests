"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { X, MapPin, Calendar, Mail } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import * as Dialog from "@radix-ui/react-dialog";
import {
  type Opportunity,
  type EnergyDiagnostic,
  type Auction,
  type Succession,
  type Liquidation,
  type Listing,
  OpportunityType,
} from "@linkinvests/shared";
import {
  StreetView,
  ImageCarousel,
  AuctionDetails,
  SuccessionDetails,
  LiquidationDetails,
  EnergySieveDetails,
  ListingDetails,
} from "~/app/(protected)/_components/opportunity";
import { contactMairie } from "~/utils/mailto";

interface OpportunityDetailsModalProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  type: OpportunityType;
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

// Helper to get the detail page URL for an opportunity
const getDetailPageUrl = (opportunity: Opportunity, type: OpportunityType): string => {
  const typeToPath: Record<OpportunityType, string> = {
    [OpportunityType.AUCTION]: 'auctions',
    [OpportunityType.REAL_ESTATE_LISTING]: 'listings',
    [OpportunityType.SUCCESSION]: 'successions',
    [OpportunityType.LIQUIDATION]: 'liquidations',
    [OpportunityType.ENERGY_SIEVE]: 'energy-sieves',
    [OpportunityType.DIVORCE]: 'divorces',
  };
  return `/${typeToPath[type]}/${opportunity.id}`;
};

export function OpportunityDetailsModal({
  opportunity,
  isOpen,
  onClose,
  type,
}: OpportunityDetailsModalProps): React.ReactElement {
  if (!opportunity) return <></>;

  const isSuccession = type === OpportunityType.SUCCESSION;
  const successionData = isSuccession ? (opportunity as Succession) : null;
  const hasEmail = isSuccession && !!successionData?.mairieContact?.email;

  const handleEmailMairie = () => {
    if (!successionData?.mairieContact?.email) return;

    contactMairie(successionData);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl max-h-[90vh] translate-x-[-50%] translate-y-[-50%] gap-4 bg-[var(--secundary)] p-6 shadow-sm duration-200 sm:rounded-lg overflow-y-auto">
          <div className="flex flex-row items-center justify-between space-y-0 pb-4">
            <Dialog.Title className="text-xl pr-8 text-[var(--primary)]">{opportunity.label}</Dialog.Title>
            <Dialog.Close asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 text-[var(--primary)]"
              >
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

        <div className="space-y-6">
          {/* Image carousel or Street View */}
          {hasAvailablePictures(opportunity) ? (
            <ImageCarousel opportunity={opportunity} className="w-full" />
          ) : (
            <StreetView
              address={opportunity.address ?? null}
              latitude={opportunity.latitude}
              longitude={opportunity.longitude}
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
                  {/* Email Mairie Button for Successions */}
                  {isSuccession && (
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
                  )}
                </div>
                <div className="text-sm !text-[var(--primary)]">
                  {opportunity.address ?? "Non disponible"}
                </div>
                <div className="text-xs mt-1 !text-[var(--primary)]">
                  {opportunity.zipCode} - Département {opportunity.department}
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="flex gap-3">
              <Calendar className="h-5 w-5 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium mb-1 font-heading text-[var(--primary)]">Date de l&apos;opportunité</div>
                <div className="text-sm !text-[var(--primary)]">
                  {format(new Date(opportunity.opportunityDate), "dd MMMM yyyy", {
                    locale: fr,
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Type-specific Details */}
          {type === OpportunityType.AUCTION && (
            <AuctionDetails opportunity={opportunity as Auction} detailPageUrl={getDetailPageUrl(opportunity, type)} />
          )}
          {type === OpportunityType.REAL_ESTATE_LISTING && (
            <ListingDetails opportunity={opportunity as Listing} detailPageUrl={getDetailPageUrl(opportunity, type)} />
          )}
          {type === OpportunityType.SUCCESSION && (
            <SuccessionDetails opportunity={opportunity as Succession} detailPageUrl={getDetailPageUrl(opportunity, type)} />
          )}
          {type === OpportunityType.LIQUIDATION && (
            <LiquidationDetails opportunity={opportunity as Liquidation} detailPageUrl={getDetailPageUrl(opportunity, type)} />
          )}
          {type === OpportunityType.ENERGY_SIEVE && (
            <EnergySieveDetails opportunity={opportunity as EnergyDiagnostic & { type: 'energy_sieve' }} detailPageUrl={getDetailPageUrl(opportunity, type)} />
          )}

          {/* Timestamps */}
          <div className="pt-4 border-t border-neutral-200">
            <div className="text-xs !text-[var(--primary)] space-y-1">
              <div>Créé le : {format(new Date(opportunity.createdAt), "dd/MM/yyyy à HH:mm")}</div>
              {opportunity.updatedAt && (
                <div>Mis à jour le : {format(new Date(opportunity.updatedAt), "dd/MM/yyyy à HH:mm")}</div>
              )}
            </div>
          </div>
        </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
