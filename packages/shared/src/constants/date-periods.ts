import type { DatePeriod } from '../api/filters.schema';
import type { DatePeriodOption } from '../types/filters.types';

/**
 * Predefined date period options for opportunity filtering
 */
export const DATE_PERIOD_OPTIONS: Array<DatePeriodOption> = [
  {
    value: 'last_month',
    label: 'Depuis 1 mois',
    months: 1,
  },
  {
    value: 'last_3_months',
    label: 'Depuis 3 mois',
    months: 3,
  },
  {
    value: '6_months',
    label: 'Depuis 6 mois',
    months: 6,
  },
  {
    value: '9_months',
    label: 'Depuis 9 mois',
    months: 9,
  },
  {
    value: '12_months',
    label: 'Depuis 12 mois',
    months: 12,
  },
  {
    value: '18_months',
    label: 'Depuis 18 mois',
    months: 18,
  },
  {
    value: '24_months',
    label: 'Depuis 24 mois',
    months: 24,
  },
];

/**
 * Get date period option by value
 */
export function getDatePeriodOption(
  value: DatePeriod
): DatePeriodOption | undefined {
  return DATE_PERIOD_OPTIONS.find((option) => option.value === value);
}

/**
 * Calculate the threshold date for a given date period.
 * Handles both short-form (7d, 30d, 6m, 1y) and long-form (last_month, 6_months) periods.
 *
 * @param period - The date period to calculate from
 * @param from - Optional start date (defaults to now)
 * @returns The calculated threshold date
 */
export function calculateStartDate(
  period: DatePeriod,
  from: Date = new Date()
): Date {
  const thresholdDate = new Date(from);

  switch (period) {
    case '7d':
      thresholdDate.setDate(thresholdDate.getDate() - 7);
      break;
    case '30d':
    case 'last_month':
      thresholdDate.setDate(thresholdDate.getDate() - 30);
      break;
    case '90d':
    case 'last_3_months':
      thresholdDate.setDate(thresholdDate.getDate() - 90);
      break;
    case '6m':
    case '6_months':
      thresholdDate.setMonth(thresholdDate.getMonth() - 6);
      break;
    case '9_months':
      thresholdDate.setMonth(thresholdDate.getMonth() - 9);
      break;
    case '1y':
    case '12_months':
      thresholdDate.setFullYear(thresholdDate.getFullYear() - 1);
      break;
    case '18_months':
      thresholdDate.setMonth(thresholdDate.getMonth() - 18);
      break;
    case '24_months':
      thresholdDate.setFullYear(thresholdDate.getFullYear() - 2);
      break;
    case 'all':
    default:
      return new Date(0);
  }

  thresholdDate.setHours(0, 0, 0, 0);
  return thresholdDate;
}
