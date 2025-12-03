import {
  extractStreetFromAddress,
  extractCityFromAddress,
  standardizeString,
  damerauLevenshteinDistance,
  calculateCityMatchScore,
  calculateStreetMatchScore,
} from './string-utils';

describe('string-utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractStreetFromAddress', () => {
    it('should extract street before zipcode', () => {
      const result = extractStreetFromAddress('123 Rue de la Paix 75001 Paris', '75001');
      expect(result).toEqual('123 Rue de la Paix');
    });

    it('should extract street with multiple words', () => {
      const result = extractStreetFromAddress('10 Avenue du Général de Gaulle 69100 Villeurbanne', '69100');
      expect(result).toEqual('10 Avenue du Général de Gaulle');
    });

    it('should handle street with hyphens', () => {
      const result = extractStreetFromAddress('5-7 Rue Jean-Paul Sartre 67000 Strasbourg', '67000');
      expect(result).toEqual('5-7 Rue Jean-Paul Sartre');
    });

    it('should return null when address is empty', () => {
      const result = extractStreetFromAddress('', '75001');
      expect(result).toBeNull();
    });

    it('should return null when zipcode is empty', () => {
      const result = extractStreetFromAddress('123 Rue de la Paix 75001 Paris', '');
      expect(result).toBeNull();
    });

    it('should return null when zipcode not found in address', () => {
      const result = extractStreetFromAddress('123 Rue de la Paix Paris', '75001');
      expect(result).toBeNull();
    });

    it('should return null when nothing before zipcode', () => {
      const result = extractStreetFromAddress('75001 Paris', '75001');
      expect(result).toBeNull();
    });
  });

  describe('extractCityFromAddress', () => {
    it('should extract city after zipcode', () => {
      const result = extractCityFromAddress('123 Rue de la Paix 75001 Paris', '75001');
      expect(result).toEqual('Paris');
    });

    it('should extract city with multiple words', () => {
      const result = extractCityFromAddress('10 Avenue du Général 69100 Villeurbanne Cedex', '69100');
      expect(result).toEqual('Villeurbanne Cedex');
    });

    it('should handle city with hyphens', () => {
      const result = extractCityFromAddress('5 Rue Principale 67000 Strasbourg-Neudorf', '67000');
      expect(result).toEqual('Strasbourg-Neudorf');
    });

    it('should return null when address is empty', () => {
      const result = extractCityFromAddress('', '75001');
      expect(result).toBeNull();
    });

    it('should return null when zipcode is empty', () => {
      const result = extractCityFromAddress('123 Rue de la Paix 75001 Paris', '');
      expect(result).toBeNull();
    });

    it('should return null when zipcode not found in address', () => {
      const result = extractCityFromAddress('123 Rue de la Paix Paris', '75001');
      expect(result).toBeNull();
    });

    it('should return null when nothing after zipcode', () => {
      const result = extractCityFromAddress('123 Rue de la Paix 75001', '75001');
      expect(result).toBeNull();
    });
  });

  describe('standardizeString', () => {
    it('should convert to lowercase', () => {
      const result = standardizeString('PARIS');
      expect(result).toEqual('paris');
    });

    it('should remove accents', () => {
      const result = standardizeString('Évreux');
      expect(result).toEqual('evreux');
    });

    it('should handle cedilla', () => {
      const result = standardizeString('Besançon');
      expect(result).toEqual('besancon');
    });

    it('should replace hyphens with spaces', () => {
      const result = standardizeString('Saint-Pierre-le-Vieux');
      expect(result).toEqual('saint pierre le vieux');
    });

    it('should replace underscores with spaces', () => {
      const result = standardizeString('test_city');
      expect(result).toEqual('test city');
    });

    it('should replace apostrophes with spaces', () => {
      const result = standardizeString("L'Haÿ-les-Roses");
      expect(result).toEqual('l hay les roses');
    });

    it('should remove special characters', () => {
      const result = standardizeString('Paris (75)');
      expect(result).toEqual('paris 75');
    });

    it('should normalize whitespace', () => {
      const result = standardizeString('  Saint   Pierre  ');
      expect(result).toEqual('saint pierre');
    });

    it('should return empty string for empty input', () => {
      const result = standardizeString('');
      expect(result).toEqual('');
    });
  });

  describe('damerauLevenshteinDistance', () => {
    it('should return 0 for identical strings', () => {
      const result = damerauLevenshteinDistance('paris', 'paris');
      expect(result).toEqual(0);
    });

    it('should return length of string when comparing with empty', () => {
      expect(damerauLevenshteinDistance('paris', '')).toEqual(5);
      expect(damerauLevenshteinDistance('', 'paris')).toEqual(5);
    });

    it('should count single insertion', () => {
      const result = damerauLevenshteinDistance('paris', 'pariss');
      expect(result).toEqual(1);
    });

    it('should count single deletion', () => {
      const result = damerauLevenshteinDistance('paris', 'pari');
      expect(result).toEqual(1);
    });

    it('should count single substitution', () => {
      const result = damerauLevenshteinDistance('paris', 'pariS');
      expect(result).toEqual(1);
    });

    it('should count mid-string insertion', () => {
      const result = damerauLevenshteinDistance('paris', 'pairis');
      expect(result).toEqual(1); // Single 'i' insertion
    });

    it('should count adjacent character transposition', () => {
      const result = damerauLevenshteinDistance('ab', 'ba');
      expect(result).toEqual(1);
    });

    it('should handle completely different strings', () => {
      const result = damerauLevenshteinDistance('paris', 'lyon');
      expect(result).toEqual(5);
    });
  });

  describe('calculateCityMatchScore', () => {
    it('should return 100 for exact match', () => {
      const result = calculateCityMatchScore('Paris', 'Paris');
      expect(result).toEqual(100);
    });

    it('should return 100 for case-insensitive match', () => {
      const result = calculateCityMatchScore('PARIS', 'paris');
      expect(result).toEqual(100);
    });

    it('should return 100 for match with different accents', () => {
      const result = calculateCityMatchScore('Évreux', 'Evreux');
      expect(result).toEqual(100);
    });

    it('should return 100 for match with hyphens vs spaces', () => {
      const result = calculateCityMatchScore('Saint-Pierre', 'Saint Pierre');
      expect(result).toEqual(100);
    });

    it('should return high score for minor typo (distance <= 3)', () => {
      const result = calculateCityMatchScore('Parsi', 'Paris');
      expect(result).toBeGreaterThanOrEqual(55); // 100 - (2 * 15) = 70, allowing for some variance
      expect(result).toBeLessThan(100);
    });

    it('should return moderate-high score for prefix match', () => {
      const result = calculateCityMatchScore('Saint-Pierre', 'Saint-Pierre-le-Vieux');
      expect(result).toBeGreaterThanOrEqual(50);
      expect(result).toBeLessThanOrEqual(85);
    });

    it('should return low score for completely different cities', () => {
      const result = calculateCityMatchScore('Lyon', 'Paris');
      expect(result).toBeLessThan(50);
    });

    it('should return 0 for empty strings', () => {
      expect(calculateCityMatchScore('', 'Paris')).toEqual(0);
      expect(calculateCityMatchScore('Paris', '')).toEqual(0);
      expect(calculateCityMatchScore('', '')).toEqual(0);
    });

    it('should handle French city names with accents', () => {
      const result = calculateCityMatchScore('Besançon', 'Besancon');
      expect(result).toEqual(100);
    });

    it('should handle apostrophes in city names', () => {
      const result = calculateCityMatchScore("L'Haÿ-les-Roses", 'L Hay les Roses');
      expect(result).toEqual(100);
    });
  });

  describe('calculateStreetMatchScore', () => {
    it('should return 100 for exact match', () => {
      const result = calculateStreetMatchScore('9 rue de la paix', '9 rue de la paix');
      expect(result).toEqual(100);
    });

    it('should return 100 for case-insensitive match', () => {
      const result = calculateStreetMatchScore('9 RUE DE LA PAIX', '9 rue de la paix');
      expect(result).toEqual(100);
    });

    it('should return 100 for match with different accents', () => {
      const result = calculateStreetMatchScore('10 Rue des Écoles', '10 Rue des Ecoles');
      expect(result).toEqual(100);
    });

    it('should return high score for suffix match (missing street number)', () => {
      const result = calculateStreetMatchScore('9 rue de la paix', 'rue de la paix');
      expect(result).toBeGreaterThanOrEqual(50);
      expect(result).toBeLessThanOrEqual(85);
    });

    it('should return high score for suffix match (different street number)', () => {
      const result = calculateStreetMatchScore('rue de la paix', '15 rue de la paix');
      expect(result).toBeGreaterThanOrEqual(50);
      expect(result).toBeLessThanOrEqual(85);
    });

    it('should return high score for minor typo (distance <= 3)', () => {
      const result = calculateStreetMatchScore('9 rue de la paxi', '9 rue de la paix');
      expect(result).toBeGreaterThanOrEqual(55);
      expect(result).toBeLessThan(100);
    });

    it('should return low score for completely different streets', () => {
      const result = calculateStreetMatchScore('rue de la paix', 'avenue des champs');
      expect(result).toBeLessThan(50);
    });

    it('should return 0 for empty strings', () => {
      expect(calculateStreetMatchScore('', '9 rue de la paix')).toEqual(0);
      expect(calculateStreetMatchScore('9 rue de la paix', '')).toEqual(0);
      expect(calculateStreetMatchScore('', '')).toEqual(0);
    });

    it('should handle French street names with accents', () => {
      const result = calculateStreetMatchScore('5 Allée François Mitterrand', '5 Allee Francois Mitterrand');
      expect(result).toEqual(100);
    });

    it('should handle apostrophes in street names', () => {
      const result = calculateStreetMatchScore("12 Place de l'Église", '12 Place de l Eglise');
      expect(result).toEqual(100);
    });
  });
});
