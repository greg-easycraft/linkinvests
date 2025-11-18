"use client";

import { OpportunitiesListEmptyState } from "./OpportunitiesListEmptyState";
import { OpportunityType, type Opportunity } from "@linkinvests/shared";
import { OpportunityCard } from "./OpportunityCard";
import { OpportunitiesListSkeleton } from "./OpportunitiesListSkeleton";

interface OpportunitiesListProps {
  opportunities: Opportunity[];
  selectedId?: string;
  onSelect: (opportunity: Opportunity) => void;
  type: OpportunityType;
  isLoading: boolean;
}

export function OpportunitiesList({
  opportunities,
  selectedId,
  onSelect,
  type,
  isLoading,

}: OpportunitiesListProps): React.ReactElement {
  if(isLoading) {
    return <OpportunitiesListSkeleton />;
  }
  if (opportunities.length === 0) {
    return <OpportunitiesListEmptyState />;
  }

  return (
   <div className="h-full overflow-y-auto">
     <div className="space-y-3 pb-4">
       {opportunities.map((opportunity: Opportunity) => (
         <OpportunityCard
           key={opportunity.id}
           opportunity={opportunity}
           selectedId={selectedId}
           onSelect={onSelect}
           type={type}
         />
       ))}
     </div>
   </div>
 );
}