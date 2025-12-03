import type { DatePeriod } from '~/types/filters.js';

export function calculateStartDate(period: DatePeriod): Date {
  const now = new Date();

  switch (period) {
    case '7d':
      return new Date(now.setDate(now.getDate() - 7));
    case '30d':
    case 'last_month':
      return new Date(now.setDate(now.getDate() - 30));
    case '90d':
    case 'last_3_months':
      return new Date(now.setDate(now.getDate() - 90));
    case '6m':
    case '6_months':
      return new Date(now.setMonth(now.getMonth() - 6));
    case '9_months':
      return new Date(now.setMonth(now.getMonth() - 9));
    case '1y':
    case '12_months':
      return new Date(now.setFullYear(now.getFullYear() - 1));
    case 'all':
    default:
      return new Date(0); // Beginning of time
  }
}
