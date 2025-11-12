import { BaseOpportunity } from "@linkinvests/shared";

export type OpportunitiesListQueryResult<T extends BaseOpportunity> = {
  opportunities: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type OpportunitiesMapQueryResult<T extends BaseOpportunity> = {
  opportunities: T[];
  total: number;
  isLimited: boolean;
};