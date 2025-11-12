import { OpportunityType } from "@linkinvests/shared";
import { getAuctionById, getAuctions, getAuctionsForMap } from "~/app/_actions/auctions/queries";
import OpportunitiesPage from "../components/OpportunitiesPage";

export default function AuctionsPage(): React.ReactElement {
  return (
    <OpportunitiesPage 
      opportunityType={OpportunityType.AUCTION} 
      getOpportunities={getAuctions} 
      getOpportunityById={getAuctionById}
      getOpportunitiesForMap={getAuctionsForMap}
      />
  );
}
