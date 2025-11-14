import { BaseOpportunity } from "@linkinvests/shared";

export type OpportunitiesDataQueryResult<T extends BaseOpportunity> = {
  opportunities: T[];
  page: number;
  pageSize: number;
};
