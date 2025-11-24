"use client";

import { ErrorBoundary } from "~/components/ErrorBoundary";
import { SellerTypeFilter } from "~/app/search/_components/OpportunityFilters/SellerTypeFilter";
import { RentalStatusFilter } from "./select/RentalStatusFilter";
import { OpportunityTypeFilter } from "./select/OpportunityTypeFilter";
import type { OpportunityType } from "@linkinvests/shared";

interface SafeFilterGroupProps {
  // SellerType props
  sellerType?: 'individual' | 'professional';
  onSellerTypeChange: (sellerType?: 'individual' | 'professional') => void;

  // RentalStatus props
  rentalStatus?: boolean;
  onRentalStatusChange: (value: boolean | undefined) => void;

  // OpportunityType props
  opportunityType: OpportunityType;
  onOpportunityTypeChange?: (value: OpportunityType) => void;
}

/**
 * Example component showing how to safely wrap filter components
 * with error boundaries to prevent DOM manipulation errors during auth changes.
 */
export function SafeFilterGroup({
  sellerType,
  onSellerTypeChange,
  rentalStatus,
  onRentalStatusChange,
  opportunityType,
  onOpportunityTypeChange
}: SafeFilterGroupProps) {
  return (
    <div className="space-y-4">
      {/* Wrap each filter with error boundary for maximum protection */}
      <ErrorBoundary
        fallback={
          <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded">
            Filter temporarily unavailable
          </div>
        }
        onError={(error) => console.warn('Filter error:', error)}
      >
        <SellerTypeFilter
          value={sellerType}
          onChange={onSellerTypeChange}
        />
      </ErrorBoundary>

      <ErrorBoundary
        fallback={
          <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded">
            Status filter temporarily unavailable
          </div>
        }
      >
        <RentalStatusFilter
          value={rentalStatus}
          onChange={onRentalStatusChange}
        />
      </ErrorBoundary>

      <ErrorBoundary
        fallback={
          <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded">
            Type filter temporarily unavailable
          </div>
        }
      >
        <OpportunityTypeFilter
          value={opportunityType}
          onChange={onOpportunityTypeChange}
        />
      </ErrorBoundary>
    </div>
  );
}