/**
 * @jest-environment node
 */
import { LiquidationRepositoryImpl } from './liquidation.repository';
import { useTestDb } from '~/test-utils/use-test-db';
import { OpportunityType } from '@linkinvests/shared';
import type {
  ILiquidationFilters,
  PaginationFilters,
} from '@linkinvests/shared';

describe('LiquidationRepositoryImpl Integration Tests', () => {
  const db = useTestDb();
  const liquidationRepository = new LiquidationRepositoryImpl(db);

  describe('basic functionality', () => {
    it('should find all liquidations without filters', async () => {
      const liquidations = await liquidationRepository.findAll();

      expect(liquidations).toHaveLength(5);
      expect(liquidations[0]).toHaveProperty('id');
      expect(liquidations[0]).toHaveProperty(
        'type',
        OpportunityType.LIQUIDATION,
      );
      expect(liquidations[0]).toHaveProperty('city');
      expect(liquidations[0]).toHaveProperty('department');
    });

    it('should find by ID', async () => {
      const all = await liquidationRepository.findAll();
      const targetId = all[0]?.id ?? '';
      const found = await liquidationRepository.findById(targetId);
      expect(found?.id).toBe(targetId);
    });

    it('should count liquidations without filters', async () => {
      const count = await liquidationRepository.count();
      expect(count).toBe(5);
    });
  });

  describe('filter functionality', () => {
    describe('departments filter', () => {
      it('should filter by single department', async () => {
        // First get all departments to see what exists in fixtures
        const allLiquidations = await liquidationRepository.findAll();
        const existingDepartment = allLiquidations[0]?.department;

        if (!existingDepartment) {
          console.warn('No liquidations with departments found in fixtures');
          return;
        }

        const filters: ILiquidationFilters = {
          departments: [existingDepartment],
        };

        const liquidations = await liquidationRepository.findAll(filters);
        const count = await liquidationRepository.count(filters);

        expect(liquidations.length).toBeGreaterThan(0);
        expect(liquidations.length).toBe(count);
        liquidations.forEach((liquidation) => {
          expect(liquidation.department).toBe(existingDepartment);
        });
      });

      it('should filter by multiple departments', async () => {
        const allLiquidations = await liquidationRepository.findAll();
        const departments = [
          ...new Set(allLiquidations.map((l) => l.department)),
        ].filter(Boolean);

        if (departments.length < 2) {
          console.warn(
            'Not enough different departments found in fixtures for multiple department test',
          );
          return;
        }

        const filters: ILiquidationFilters = {
          departments: departments.slice(0, 2),
        };

        const liquidations = await liquidationRepository.findAll(filters);
        const count = await liquidationRepository.count(filters);

        expect(liquidations.length).toBeGreaterThan(0);
        expect(liquidations.length).toBe(count);
        liquidations.forEach((liquidation) => {
          expect(departments.slice(0, 2)).toContain(liquidation.department);
        });
      });

      it('should return empty array for non-existent department', async () => {
        const filters: ILiquidationFilters = {
          departments: ['99'],
        };

        const liquidations = await liquidationRepository.findAll(filters);
        const count = await liquidationRepository.count(filters);

        expect(liquidations).toHaveLength(0);
        expect(count).toBe(0);
      });
    });

    describe('zipCodes filter', () => {
      it('should filter by single zip code', async () => {
        const allLiquidations = await liquidationRepository.findAll();
        const existingZipCode = allLiquidations[0]?.zipCode;

        if (!existingZipCode) {
          console.warn('No liquidations with zip codes found in fixtures');
          return;
        }

        const filters: ILiquidationFilters = {
          zipCodes: [existingZipCode],
        };

        const liquidations = await liquidationRepository.findAll(filters);
        const count = await liquidationRepository.count(filters);

        expect(liquidations.length).toBeGreaterThan(0);
        expect(liquidations.length).toBe(count);
        liquidations.forEach((liquidation) => {
          expect(liquidation.zipCode).toBe(existingZipCode);
        });
      });

      it('should filter by multiple zip codes', async () => {
        const allLiquidations = await liquidationRepository.findAll();
        const zipCodes = [
          ...new Set(allLiquidations.map((l) => l.zipCode)),
        ].filter(Boolean);

        if (zipCodes.length < 2) {
          console.warn(
            'Not enough different zip codes found in fixtures for multiple zip code test',
          );
          return;
        }

        const filters: ILiquidationFilters = {
          zipCodes: zipCodes.slice(0, 2),
        };

        const liquidations = await liquidationRepository.findAll(filters);
        const count = await liquidationRepository.count(filters);

        expect(liquidations.length).toBeGreaterThan(0);
        expect(liquidations.length).toBe(count);
        liquidations.forEach((liquidation) => {
          expect(zipCodes.slice(0, 2)).toContain(liquidation.zipCode);
        });
      });

      it('should return empty array for non-existent zip code', async () => {
        const filters: ILiquidationFilters = {
          zipCodes: ['00000'],
        };

        const liquidations = await liquidationRepository.findAll(filters);
        const count = await liquidationRepository.count(filters);

        expect(liquidations).toHaveLength(0);
        expect(count).toBe(0);
      });
    });

    describe('dateAfter filter', () => {
      it('should filter by last month', async () => {
        const filters: ILiquidationFilters = {
          dateAfter: 'last_month',
        };

        const liquidations = await liquidationRepository.findAll(filters);
        const count = await liquidationRepository.count(filters);

        expect(liquidations.length).toBe(count);
        // Note: Result depends on fixture dates and current date
        expect(liquidations).toBeInstanceOf(Array);
      });

      it('should filter by last 3 months', async () => {
        const filters: ILiquidationFilters = {
          dateAfter: 'last_3_months',
        };

        const liquidations = await liquidationRepository.findAll(filters);
        const count = await liquidationRepository.count(filters);

        expect(liquidations.length).toBe(count);
        expect(liquidations).toBeInstanceOf(Array);
      });

      it('should filter by last 12 months', async () => {
        const filters: ILiquidationFilters = {
          dateAfter: '12_months',
        };

        const liquidations = await liquidationRepository.findAll(filters);
        const count = await liquidationRepository.count(filters);

        expect(liquidations.length).toBe(count);
        expect(liquidations).toBeInstanceOf(Array);
      });
    });

    describe('bounds filter', () => {
      it('should filter by map bounds', async () => {
        // First get the coordinate ranges from existing liquidations
        const allLiquidations = await liquidationRepository.findAll();
        const liquidationsWithCoords = allLiquidations.filter(
          (l) => l.latitude != null && l.longitude != null,
        );

        if (liquidationsWithCoords.length === 0) {
          console.warn('No liquidations with coordinates found in fixtures');
          return;
        }

        const latitudes = liquidationsWithCoords.map((l) => l.latitude);
        const longitudes = liquidationsWithCoords.map((l) => l.longitude);

        const filters: ILiquidationFilters = {
          bounds: {
            north: Math.max(...latitudes) + 0.1,
            south: Math.min(...latitudes) - 0.1,
            east: Math.max(...longitudes) + 0.1,
            west: Math.min(...longitudes) - 0.1,
          },
        };

        const liquidations = await liquidationRepository.findAll(filters);
        const count = await liquidationRepository.count(filters);

        expect(liquidations.length).toBeGreaterThan(0);
        expect(liquidations.length).toBe(count);
        liquidations.forEach((liquidation) => {
          if (liquidation.latitude != null && liquidation.longitude != null) {
            expect(liquidation.latitude).toBeGreaterThanOrEqual(
              filters.bounds!.south,
            );
            expect(liquidation.latitude).toBeLessThanOrEqual(
              filters.bounds!.north,
            );
            expect(liquidation.longitude).toBeGreaterThanOrEqual(
              filters.bounds!.west,
            );
            expect(liquidation.longitude).toBeLessThanOrEqual(
              filters.bounds!.east,
            );
          }
        });
      });

      it('should return empty array for bounds with no liquidations', async () => {
        const filters: ILiquidationFilters = {
          bounds: {
            north: 90.0,
            south: 89.0,
            east: 180.0,
            west: 179.0,
          },
        };

        const liquidations = await liquidationRepository.findAll(filters);
        const count = await liquidationRepository.count(filters);

        expect(liquidations).toHaveLength(0);
        expect(count).toBe(0);
      });
    });

    describe('combined filters', () => {
      it('should combine departments and zip codes filters', async () => {
        const allLiquidations = await liquidationRepository.findAll();
        const existingDepartment = allLiquidations[0]?.department;
        const existingZipCode = allLiquidations[0]?.zipCode;

        if (!existingDepartment || !existingZipCode) {
          console.warn(
            'No suitable liquidation found for combined filter test',
          );
          return;
        }

        const filters: ILiquidationFilters = {
          departments: [existingDepartment],
          zipCodes: [existingZipCode],
        };

        const liquidations = await liquidationRepository.findAll(filters);
        const count = await liquidationRepository.count(filters);

        expect(liquidations.length).toBe(count);
        liquidations.forEach((liquidation) => {
          expect(liquidation.department).toBe(existingDepartment);
          expect(liquidation.zipCode).toBe(existingZipCode);
        });
      });

      it('should combine multiple filter types', async () => {
        const allLiquidations = await liquidationRepository.findAll();
        const existingDepartment = allLiquidations[0]?.department;

        if (!existingDepartment) {
          console.warn('No department found for combined filter test');
          return;
        }

        const filters: ILiquidationFilters = {
          departments: [existingDepartment],
          dateAfter: '12_months',
        };

        const liquidations = await liquidationRepository.findAll(filters);
        const count = await liquidationRepository.count(filters);

        expect(liquidations.length).toBe(count);
        liquidations.forEach((liquidation) => {
          expect(liquidation.department).toBe(existingDepartment);
        });
      });
    });

    describe('pagination', () => {
      it('should apply pagination without filters', async () => {
        const paginationFilters: PaginationFilters = {
          limit: 2,
          offset: 1,
        };

        const liquidations = await liquidationRepository.findAll(
          undefined,
          paginationFilters,
        );

        expect(liquidations).toHaveLength(2);
      });

      it('should apply pagination with filters', async () => {
        const allLiquidations = await liquidationRepository.findAll();
        const existingDepartment = allLiquidations[0]?.department;

        if (!existingDepartment) {
          console.warn('No department found for pagination test');
          return;
        }

        const filters: ILiquidationFilters = {
          departments: [existingDepartment],
        };
        const paginationFilters: PaginationFilters = {
          limit: 1,
          offset: 0,
        };

        const liquidations = await liquidationRepository.findAll(
          filters,
          paginationFilters,
        );

        expect(liquidations).toHaveLength(1);
        expect(liquidations[0]?.department).toBe(existingDepartment);
      });
    });

    describe('sorting', () => {
      it('should sort by createdAt descending (default)', async () => {
        const liquidations = await liquidationRepository.findAll();

        // Verify default sorting (createdAt desc) - most recent first
        expect(liquidations).toBeInstanceOf(Array);
        if (liquidations.length > 1) {
          for (let i = 1; i < liquidations.length; i++) {
            const current = new Date(liquidations[i].createdAt);
            const previous = new Date(liquidations[i - 1].createdAt);
            expect(current.getTime()).toBeLessThanOrEqual(previous.getTime());
          }
        }
      });

      it('should sort by specified field ascending', async () => {
        const filters: ILiquidationFilters = {
          sortBy: 'address',
          sortOrder: 'asc',
        };

        const liquidations = await liquidationRepository.findAll(filters);

        expect(liquidations).toBeInstanceOf(Array);
        // Test that results are properly ordered (basic sanity check)
        if (liquidations.length > 1) {
          for (let i = 1; i < liquidations.length; i++) {
            const current = liquidations[i]?.streetAddress || '';
            const previous = liquidations[i - 1]?.streetAddress || '';
            expect(current.localeCompare(previous)).toBeGreaterThanOrEqual(0);
          }
        }
      });

      it('should sort by specified field descending', async () => {
        const filters: ILiquidationFilters = {
          sortBy: 'streetAddress',
          sortOrder: 'desc',
        };

        const liquidations = await liquidationRepository.findAll(filters);

        expect(liquidations).toBeInstanceOf(Array);
        // Test that results are properly ordered (basic sanity check)
        if (liquidations.length > 1) {
          for (let i = 1; i < liquidations.length; i++) {
            const current = liquidations[i]?.streetAddress || '';
            const previous = liquidations[i - 1]?.streetAddress || '';
            expect(current.localeCompare(previous)).toBeLessThanOrEqual(0);
          }
        }
      });
    });
  });
});
