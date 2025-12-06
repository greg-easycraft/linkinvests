// Re-export shared constants
export {
  FRENCH_DEPARTMENTS,
  searchDepartments,
  getDepartmentById,
  getDepartmentsByIds,
  DATE_PERIOD_OPTIONS,
  getDatePeriodOption,
  calculateStartDate,
  DEFAULT_PAGE_SIZE,
} from '@linkinvests/shared'

// App-specific UI constants
export * from './opportunity-types'
export * from './sort-options'
export * from './energy-classes'
export * from './property-types'
export * from './occupation-statuses'
