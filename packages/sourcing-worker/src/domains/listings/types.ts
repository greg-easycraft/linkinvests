import { EnergyClass, PropertyType } from '@linkinvests/shared';

export interface ListingsJobFilters {
  beforeDate?: string;
  afterDate?: string;
  energyGradesMax?: EnergyClass;
  propertyTypes?: PropertyType[];
  departmentCode?: string;
}

export interface ListingJobData {
  source?: string;
  filters?: ListingsJobFilters;
}
