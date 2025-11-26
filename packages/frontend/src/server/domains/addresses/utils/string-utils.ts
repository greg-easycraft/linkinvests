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
 * Calculates Damerau-Levenshtein distance between two strings.
 * Counts: insertions, deletions, substitutions, and transpositions.
 */
export function damerauLevenshteinDistance(a: string, b: string): number {
  const lenA = a.length;
  const lenB = b.length;

  if (lenA === 0) return lenB;
  if (lenB === 0) return lenA;

  // Create distance matrix with explicit initialization
  const d: number[][] = [];
  for (let i = 0; i <= lenA; i++) {
    d[i] = [];
    for (let j = 0; j <= lenB; j++) {
      d[i]![j] = 0;
    }
  }

  // Initialize first row and column
  for (let i = 0; i <= lenA; i++) d[i]![0] = i;
  for (let j = 0; j <= lenB; j++) d[0]![j] = j;

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      const deletion = d[i - 1]![j]! + 1;
      const insertion = d[i]![j - 1]! + 1;
      const substitution = d[i - 1]![j - 1]! + cost;

      d[i]![j] = Math.min(deletion, insertion, substitution);

      // Transposition
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i]![j] = Math.min(d[i]![j]!, d[i - 2]![j - 2]! + 1);
      }
    }
  }

  return d[lenA]![lenB]!;
}

/**
 * Calculates fuzzy match score (0-100) between two city names.
 * Uses hybrid approach:
 * 1. If distance <= threshold (3), return high score based on distance
 * 2. If distance > threshold but one is prefix of other, allow match with moderate score
 * 3. Otherwise, return low score based on normalized distance
 */
export function calculateCityMatchScore(city1: string, city2: string): number {
  const s1 = standardizeString(city1);
  const s2 = standardizeString(city2);

  if (!s1 || !s2) return 0;
  if (s1 === s2) return 100;

  const distance = damerauLevenshteinDistance(s1, s2);
  const maxLen = Math.max(s1.length, s2.length);

  // Small distance = high confidence match
  if (distance <= 3) {
    return Math.max(0, 100 - distance * 15);
  }

  // Prefix check: "Saint-Pierre" matches "Saint-Pierre-le-Vieux"
  const [shorter, longer] = s1.length <= s2.length ? [s1, s2] : [s2, s1];
  if (longer.startsWith(shorter)) {
    const suffixRatio = (longer.length - shorter.length) / longer.length;
    return Math.max(50, 85 - suffixRatio * 50); // 50-85 score range
  }

  // General case: normalized distance score
  const normalizedDistance = distance / maxLen;
  return Math.max(0, Math.round(100 - normalizedDistance * 100));
}

/**
 * Calculates fuzzy match score (0-100) between two street addresses.
 * Uses SUFFIX tolerance: "9 rue de la paix" matches "rue de la paix"
 * Street numbers at the beginning are less important than the street name.
 */
export function calculateStreetMatchScore(street1: string, street2: string): number {
  const s1 = standardizeString(street1);
  const s2 = standardizeString(street2);

  if (!s1 || !s2) return 0;
  if (s1 === s2) return 100;

  const distance = damerauLevenshteinDistance(s1, s2);
  const maxLen = Math.max(s1.length, s2.length);

  // Small distance = high confidence match
  if (distance <= 3) {
    return Math.max(0, 100 - distance * 15);
  }

  // SUFFIX check: "9 rue de la paix" matches "rue de la paix"
  // Street number at beginning is less important than street name
  const [shorter, longer] = s1.length <= s2.length ? [s1, s2] : [s2, s1];
  if (longer.endsWith(shorter)) {
    const prefixRatio = (longer.length - shorter.length) / longer.length;
    return Math.max(50, 85 - prefixRatio * 50); // 50-85 score range
  }

  // General case: normalized distance score
  const normalizedDistance = distance / maxLen;
  return Math.max(0, Math.round(100 - normalizedDistance * 100));
}
