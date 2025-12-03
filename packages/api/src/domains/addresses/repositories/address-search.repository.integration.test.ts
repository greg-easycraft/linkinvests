/**
 * @jest-environment node
 */
import { DrizzleAddressSearchRepository } from './address-search.repository';
import { useTestDb } from '~/test-utils/use-test-db';
import { EnergyClass } from '@linkinvests/shared';

describe('DrizzleAddressSearchRepository Integration Tests', () => {
  const db = useTestDb();
  const addressSearchRepository = new DrizzleAddressSearchRepository(db);

  it('should find all for address search', async () => {
    const results = await addressSearchRepository.findAllForAddressSearch({
      zipCode: '75001',
      energyClass: EnergyClass.F,
      squareFootageMin: 45,
      squareFootageMax: 55
    });

    expect(results).toBeInstanceOf(Array);
    results.forEach(result => {
      expect(result).toHaveProperty('energyClass', 'F');
      expect(result).toHaveProperty('zipCode', '75001');
    });
  });

  it('should filter by energy class', async () => {
    const results = await addressSearchRepository.findAllForAddressSearch({
      zipCode: '75001',
      energyClass: EnergyClass.G,
      squareFootageMin: 40,
      squareFootageMax: 60
    });

    results.forEach(result => {
      expect(result.energyClass).toBe('G');
    });
  });

  it('should filter by square footage range', async () => {
    const results = await addressSearchRepository.findAllForAddressSearch({
      zipCode: '75001',
      energyClass: EnergyClass.F,
      squareFootageMin: 45,
      squareFootageMax: 50
    });

    results.forEach(result => {
      if (result.squareFootage) {
        expect(result.squareFootage).toBeGreaterThanOrEqual(45);
        expect(result.squareFootage).toBeLessThanOrEqual(50);
      }
    });
  });
});