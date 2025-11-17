import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number for display with French-style thousands separators
 * Uses spaces as thousands separators (e.g., 10000 → "10 000", 345023 → "345 023")
 *
 * @param num - The number to format
 * @returns Formatted number string with space separators
 */
export function formatNumber(num: number): string {
  // Convert number to string and handle negative numbers
  const isNegative = num < 0;
  const absoluteNum = Math.abs(num);
  const numStr = absoluteNum.toString();

  // Split the number into groups of 3 digits from the right
  const parts: string[] = [];
  for (let i = numStr.length; i > 0; i -= 3) {
    const start = Math.max(0, i - 3);
    parts.unshift(numStr.slice(start, i));
  }

  // Join with spaces and add negative sign if needed
  const formatted = parts.join(' ');
  return isNegative ? `-${formatted}` : formatted;
}
