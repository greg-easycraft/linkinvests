import {
  extractStreetFromAddress,
  extractCityFromAddress,
  standardizeString,
  calculateMatchScore,
} from './string-utils';

describe('string-utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractStreetFromAddress', () => {
    it('should extract street before zipcode', () => {
      const result = extractStreetFromAddress(
        '123 Rue de la Paix 75001 Paris',
        '75001',
      );
      expect(result).toEqual('123 Rue de la Paix');
    });

    it('should extract street with multiple words', () => {
      const result = extractStreetFromAddress(
        '10 Avenue du Général de Gaulle 69100 Villeurbanne',
        '69100',
      );
      expect(result).toEqual('10 Avenue du Général de Gaulle');
    });

    it('should handle street with hyphens', () => {
      const result = extractStreetFromAddress(
        '5-7 Rue Jean-Paul Sartre 67000 Strasbourg',
        '67000',
      );
      expect(result).toEqual('5-7 Rue Jean-Paul Sartre');
    });

    it('should return null when address is empty', () => {
      const result = extractStreetFromAddress('', '75001');
      expect(result).toBeNull();
    });

    it('should return null when zipcode is empty', () => {
      const result = extractStreetFromAddress(
        '123 Rue de la Paix 75001 Paris',
        '',
      );
      expect(result).toBeNull();
    });

    it('should return null when zipcode not found in address', () => {
      const result = extractStreetFromAddress(
        '123 Rue de la Paix Paris',
        '75001',
      );
      expect(result).toBeNull();
    });

    it('should return null when nothing before zipcode', () => {
      const result = extractStreetFromAddress('75001 Paris', '75001');
      expect(result).toBeNull();
    });
  });

  describe('extractCityFromAddress', () => {
    it('should extract city after zipcode', () => {
      const result = extractCityFromAddress(
        '123 Rue de la Paix 75001 Paris',
        '75001',
      );
      expect(result).toEqual('Paris');
    });

    it('should extract city with multiple words', () => {
      const result = extractCityFromAddress(
        '10 Avenue du Général 69100 Villeurbanne Cedex',
        '69100',
      );
      expect(result).toEqual('Villeurbanne Cedex');
    });

    it('should handle city with hyphens', () => {
      const result = extractCityFromAddress(
        '5 Rue Principale 67000 Strasbourg-Neudorf',
        '67000',
      );
      expect(result).toEqual('Strasbourg-Neudorf');
    });

    it('should return null when address is empty', () => {
      const result = extractCityFromAddress('', '75001');
      expect(result).toBeNull();
    });

    it('should return null when zipcode is empty', () => {
      const result = extractCityFromAddress(
        '123 Rue de la Paix 75001 Paris',
        '',
      );
      expect(result).toBeNull();
    });

    it('should return null when zipcode not found in address', () => {
      const result = extractCityFromAddress(
        '123 Rue de la Paix Paris',
        '75001',
      );
      expect(result).toBeNull();
    });

    it('should return null when nothing after zipcode', () => {
      const result = extractCityFromAddress(
        '123 Rue de la Paix 75001',
        '75001',
      );
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

  describe('calculateMatchScore', () => {
    it('should return 0 for identical strings', () => {
      const result = calculateMatchScore('paris', 'paris');
      expect(result).toEqual(0);
    });

    it('should return 0.1 when one string contains the other', () => {
      const result = calculateMatchScore('Saint-Pierre', 'Saint');
      expect(result).toEqual(0.1);
    });

    it('should return 0.1 when search string contains original', () => {
      const result = calculateMatchScore('Paris', 'Paris France');
      expect(result).toEqual(0.1);
    });

    it('should return low score for similar strings', () => {
      const result = calculateMatchScore('paris', 'parsi');
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(0.5);
    });

    it('should return high score for completely different strings', () => {
      const result = calculateMatchScore('paris', 'london');
      expect(result).toBeGreaterThan(0.5);
    });

    it('should return 1 for no match', () => {
      const result = calculateMatchScore('abc', 'xyz');
      expect(result).toEqual(1);
    });
  });
});
