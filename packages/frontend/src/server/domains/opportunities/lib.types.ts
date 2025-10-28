import { domainSchema } from "@linkinvest/db";
import type { OpportunityFilters } from "~/types/filters";

export type Opportunity = typeof domainSchema.opportunities.$inferSelect;

export interface IOpportunityRepository {
  findAll(filters?: OpportunityFilters): Promise<Opportunity[]>;
  findById(id: number): Promise<Opportunity | null>;
  count(filters?: OpportunityFilters): Promise<number>;
}
