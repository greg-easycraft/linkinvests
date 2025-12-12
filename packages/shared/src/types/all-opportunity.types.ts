import type { OpportunityType } from '../constants/opportunity.js';
import type { BaseOpportunity } from './base-opportunity.types.js';

export interface AllOpportunity extends BaseOpportunity {
  /** Same as id, kept for compatibility with the DB view */
  opportunityId: string;
  type: OpportunityType;
  energyClass?: string;
  squareFootage?: number;
  price?: number;
  mainPicture?: string;
}
