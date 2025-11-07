import type { DatePeriod, DatePeriodOption } from "~/types/filters";

/**
 * Predefined date period options for opportunity filtering
 */
export const DATE_PERIOD_OPTIONS: DatePeriodOption[] = [
  {
    value: "last_month",
    label: "Depuis 1 mois",
    months: 1,
  },
  {
    value: "last_3_months",
    label: "Depuis 3 mois",
    months: 3,
  },
  {
    value: "6_months",
    label: "Depuis 6 mois",
    months: 6,
  },
  {
    value: "9_months",
    label: "Depuis 9 mois",
    months: 9,
  },
  {
    value: "12_months",
    label: "Depuis 12 mois",
    months: 12,
  },
  {
    value: "18_months",
    label: "Depuis 18 mois",
    months: 18,
  },
  {
    value: "24_months",
    label: "Depuis 24 mois",
    months: 24,
  },
];

/**
 * Get date period option by value
 * @param value - The date period value
 * @returns The date period option or undefined if not found
 */
export function getDatePeriodOption(value: DatePeriod): DatePeriodOption | undefined {
  return DATE_PERIOD_OPTIONS.find(option => option.value === value);
}

/**
 * Calculate the threshold date for a given date period
 * This date is used for "greater than or equal" filtering
 * @param period - The date period
 * @param from - Reference date (defaults to now)
 * @returns The calculated threshold date (opportunities after this date will be included)
 */
export function calculateStartDate(period: DatePeriod, from: Date = new Date()): Date {
  const option = getDatePeriodOption(period);
  if (!option) {
    throw new Error(`Invalid date period: ${period}`);
  }

  const thresholdDate = new Date(from);
  thresholdDate.setMonth(thresholdDate.getMonth() - option.months);
  thresholdDate.setHours(0, 0, 0, 0); // Start of day

  return thresholdDate;
}