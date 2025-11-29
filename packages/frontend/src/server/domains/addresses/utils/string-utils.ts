import Fuse from 'fuse.js';

/**
 * Extracts street address from an address string (text before zipcode).
 * Address format: "STREET ZIPCODE CITY" (e.g., "123 Rue de la Paix 75001 Paris")
 * Returns "123 Rue de la Paix"
 */
export function extractStreetFromAddress(address: string, zipCode: string): string | null {
  if (!address || !zipCode) return null;

  const zipCodeIndex = address.indexOf(zipCode);
  if (zipCodeIndex === -1) return null;

  const beforeZipCode = address.substring(0, zipCodeIndex).trim();
  return beforeZipCode || null;
}

/**
 * Extracts city name from an address string (text after zipcode).
 * Address format: "... ZIPCODE CITY" (e.g., "123 Rue de la Paix 75001 Paris")
 * Returns the text after the zipcode, or null if not found.
 */
export function extractCityFromAddress(address: string, zipCode: string): string | null {
  if (!address || !zipCode) return null;

  const zipCodeIndex = address.indexOf(zipCode);
  if (zipCodeIndex === -1) return null;

  const afterZipCode = address.substring(zipCodeIndex + zipCode.length).trim();
  return afterZipCode || null;
}

/**
 * Standardizes a string for comparison by:
 * - Converting to lowercase
 * - Removing accents (é → e, ç → c, etc.)
 * - Removing hyphens, underscores, and special characters
 * - Normalizing whitespace
 */
export function standardizeString(str: string): string {
  if (!str) return '';

  return str
    .toLowerCase()
    .normalize('NFD') // Decompose accents
    .replace(/[\u0300-\u036f]/g, '') // Remove accent marks
    .replace(/[-_']/g, ' ') // Replace hyphens/underscores/apostrophes with space
    .replace(/[^a-z0-9\s]/g, '') // Remove other special chars
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Calculates the match score between two strings using Fuse.js.
 * @param originalStr - The original string to match against.
 * @param strToMatch - The string to match against the original string.
 * @returns The match score between the two strings. 0 for perfect match, 1 for no match.
 */
export function calculateMatchScore(originalStr: string, strToMatch: string): number {
  if(originalStr === strToMatch) {
    return 0;
  }

  if(originalStr.includes(strToMatch) || strToMatch.includes(originalStr)) {
    return 0.1;
  }

  const list = [originalStr];

  const options = {
    includeScore: true,
    ignoreDiacritics: true,
    isCaseSensitive: false,
  };
  
  const fuse = new Fuse(list, options);

  const result = fuse.search(strToMatch);

  return result[0]?.score || 1;
}