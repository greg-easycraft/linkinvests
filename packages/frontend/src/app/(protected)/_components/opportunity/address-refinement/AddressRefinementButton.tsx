'use client';

import { Button } from "~/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { Search, Info } from "lucide-react";

interface AddressRefinementButtonProps {
  address: string | null;
  energyClass: string | null | undefined;
  onRefine: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  hasExistingLinks?: boolean;
}

/**
 * Check if address needs refinement (doesn't start with a number)
 */
export function addressNeedsRefinement(address: string | null): boolean {
  if (!address) return true;
  return !/^\d/.test(address.trim());
}

export function AddressRefinementButton({
  address,
  energyClass,
  onRefine,
  disabled = false,
  isLoading = false,
  hasExistingLinks = false,
}: AddressRefinementButtonProps) {
  // Don't show if address starts with a number
  if (address && !addressNeedsRefinement(address)) {
    return null;
  }

  const noEnergyClass = !energyClass;
  const isDisabled = disabled || isLoading || noEnergyClass || hasExistingLinks;

  const getTooltipContent = () => {
    if (hasExistingLinks) {
      return "L'adresse a déjà été affinée";
    }
    if (noEnergyClass) {
      return "Classe DPE requise pour affiner l'adresse";
    }
    return "Rechercher des diagnostics énergétiques correspondants";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefine}
              disabled={isDisabled}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Search className="h-4 w-4 animate-spin" />
              ) : noEnergyClass ? (
                <Info className="h-4 w-4" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Affiner l&apos;adresse
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipContent()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
