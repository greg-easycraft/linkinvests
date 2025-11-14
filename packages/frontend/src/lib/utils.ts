import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number for display with locale-appropriate thousands separators
 * Uses French locale formatting (spaces as thousands separators)
 *
 * @param num - The number to format
 * @returns Formatted number string (e.g., 12345 → "12 345")
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('fr-FR');
}
