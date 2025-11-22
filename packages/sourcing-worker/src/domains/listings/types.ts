import { EnergyClass, PropertyType } from '@linkinvests/shared';

export interface ListingsJobFilters {
  beforeDate?: string;
  afterDate?: string;
  energyGradeMax?: EnergyClass;
  energyGradeMin?: EnergyClass;
  propertyTypes?: PropertyType[];
  departmentCode?: string;
}

export interface ListingJobData extends ListingsJobFilters {
  source?: string;
}
