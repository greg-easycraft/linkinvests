import { Opportunity } from "@linkinvests/shared";

export type OpportunityListResult = {
  opportunities: Opportunity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type OpportunityMapResult = {
  opportunities: Opportunity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};