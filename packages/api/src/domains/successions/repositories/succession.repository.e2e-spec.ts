/**
 * @jest-environment node
 */
import { SuccessionRepositoryImpl } from './succession.repository';
import { useTestDb } from '~/test-utils/use-test-db';
import { OpportunityType } from '@linkinvests/shared';
import type { ISuccessionFilters, PaginationFilters } from '@linkinvests/shared';

describe('SuccessionRepositoryImpl Integration Tests', () => {
  const db = useTestDb();
  const successionRepository = new SuccessionRepositoryImpl(db);

  describe('basic functionality', () => {
    it('should find all successions without filters', async () => {
      const successions = await successionRepository.findAll();

      expect(successions).toHaveLength(5);
      expect(successions[0]).toHaveProperty('id');
      expect(successions[0]).toHaveProperty('type', OpportunityType.SUCCESSION);
      expect(successions[0]).toHaveProperty('city');
      expect(successions[0]).toHaveProperty('department');
    });

    it('should find by ID', async () => {
      const all = await successionRepository.findAll();
      const targetId = all[0]?.id ?? '';
      const found = await successionRepository.findById(targetId);
      expect(found?.id).toBe(targetId);
    });

    it('should count successions without filters', async () => {
      const count = await successionRepository.count();
      expect(count).toBe(5);
    });
  });

  describe('filter functionality', () => {
    describe('departments filter', () => {
      it('should filter by single department', async () => {
        // First get all departments to see what exists in fixtures
        const allSuccessions = await successionRepository.findAll();
        const existingDepartment = allSuccessions[0]?.department;

        if (!existingDepartment) {
          console.warn('No successions with departments found in fixtures');
          return;
        }

        const filters: ISuccessionFilters = {
          departments: [existingDepartment],
        };

        const successions = await successionRepository.findAll(filters);
        const count = await successionRepository.count(filters);

        expect(successions.length).toBeGreaterThan(0);
        expect(successions.length).toBe(count);
        successions.forEach((succession) => {
          expect(succession.department).toBe(existingDepartment);
        });
      });

      it('should filter by multiple departments', async () => {
        const allSuccessions = await successionRepository.findAll();
        const departments = [
          ...new Set(allSuccessions.map((s) => s.department)),
        ].filter(Boolean);

        if (departments.length < 2) {
          console.warn(
            'Not enough different departments found in fixtures for multiple department test',
          );
          return;
        }

        const filters: ISuccessionFilters = {
          departments: departments.slice(0, 2),
        };

        const successions = await successionRepository.findAll(filters);
        const count = await successionRepository.count(filters);

        expect(successions.length).toBeGreaterThan(0);
        expect(successions.length).toBe(count);
        successions.forEach((succession) => {
          expect(departments.slice(0, 2)).toContain(succession.department);
        });
      });

      it('should return empty array for non-existent department', async () => {
        const filters: ISuccessionFilters = {
          departments: ['99'],
        };

        const successions = await successionRepository.findAll(filters);
        const count = await successionRepository.count(filters);

        expect(successions).toHaveLength(0);
        expect(count).toBe(0);
      });
    });

    describe('zipCodes filter', () => {
      it('should filter by single zip code', async () => {
        const allSuccessions = await successionRepository.findAll();
        const existingZipCode = allSuccessions[0]?.zipCode;

        if (!existingZipCode) {
          console.warn('No successions with zip codes found in fixtures');
          return;
        }

        const filters: ISuccessionFilters = {
          zipCodes: [existingZipCode],
        };

        const successions = await successionRepository.findAll(filters);
        const count = await successionRepository.count(filters);

        expect(successions.length).toBeGreaterThan(0);
        expect(successions.length).toBe(count);
        successions.forEach((succession) => {
          expect(succession.zipCode).toBe(existingZipCode);
        });
      });

      it('should filter by multiple zip codes', async () => {
        const allSuccessions = await successionRepository.findAll();
        const zipCodes = [
          ...new Set(allSuccessions.map((s) => s.zipCode)),
        ].filter(Boolean);

        if (zipCodes.length < 2) {
          console.warn(
            'Not enough different zip codes found in fixtures for multiple zip code test',
          );
          return;
        }

        const filters: ISuccessionFilters = {
          zipCodes: zipCodes.slice(0, 2),
        };

        const successions = await successionRepository.findAll(filters);
        const count = await successionRepository.count(filters);

        expect(successions.length).toBeGreaterThan(0);
        expect(successions.length).toBe(count);
        successions.forEach((succession) => {
          expect(zipCodes.slice(0, 2)).toContain(succession.zipCode);
        });
      });

      it('should return empty array for non-existent zip code', async () => {
        const filters: ISuccessionFilters = {
          zipCodes: ['00000'],
        };

        const successions = await successionRepository.findAll(filters);
        const count = await successionRepository.count(filters);

        expect(successions).toHaveLength(0);
        expect(count).toBe(0);
      });
    });

    describe('dateAfter filter', () => {
      it('should filter by last month', async () => {
        const filters: ISuccessionFilters = {
          dateAfter: 'last_month',
        };

        const successions = await successionRepository.findAll(filters);
        const count = await successionRepository.count(filters);

        expect(successions.length).toBe(count);
        // Note: Result depends on fixture dates and current date
        expect(successions).toBeInstanceOf(Array);
      });

      it('should filter by last 3 months', async () => {
        const filters: ISuccessionFilters = {
          dateAfter: 'last_3_months',
        };

        const successions = await successionRepository.findAll(filters);
        const count = await successionRepository.count(filters);

        expect(successions.length).toBe(count);
        expect(successions).toBeInstanceOf(Array);
      });

      it('should filter by last 12 months', async () => {
        const filters: ISuccessionFilters = {
          dateAfter: '12_months',
        };

        const successions = await successionRepository.findAll(filters);
        const count = await successionRepository.count(filters);

        expect(successions.length).toBe(count);
        expect(successions).toBeInstanceOf(Array);
      });
    });

    describe('bounds filter', () => {
      it('should filter by map bounds', async () => {
        // First get the coordinate ranges from existing successions
        const allSuccessions = await successionRepository.findAll();
        const successionsWithCoords = allSuccessions.filter(
          (s) => s.latitude != null && s.longitude != null,
        );

        if (successionsWithCoords.length === 0) {
          console.warn('No successions with coordinates found in fixtures');
          return;
        }

        const latitudes = successionsWithCoords.map((s) => s.latitude);
        const longitudes = successionsWithCoords.map((s) => s.longitude);

        const filters: ISuccessionFilters = {
          bounds: {
            north: Math.max(...latitudes) + 0.1,
            south: Math.min(...latitudes) - 0.1,
            east: Math.max(...longitudes) + 0.1,
            west: Math.min(...longitudes) - 0.1,
          },
        };

        const successions = await successionRepository.findAll(filters);
        const count = await successionRepository.count(filters);

        expect(successions.length).toBeGreaterThan(0);
        expect(successions.length).toBe(count);
        successions.forEach((succession) => {
          if (succession.latitude != null && succession.longitude != null) {
            expect(succession.latitude).toBeGreaterThanOrEqual(
              filters.bounds!.south,
            );
            expect(succession.latitude).toBeLessThanOrEqual(
              filters.bounds!.north,
            );
            expect(succession.longitude).toBeGreaterThanOrEqual(
              filters.bounds!.west,
            );
            expect(succession.longitude).toBeLessThanOrEqual(
              filters.bounds!.east,
            );
          }
        });
      });

      it('should return empty array for bounds with no successions', async () => {
        const filters: ISuccessionFilters = {
          bounds: {
            north: 90.0,
            south: 89.0,
            east: 180.0,
            west: 179.0,
          },
        };

        const successions = await successionRepository.findAll(filters);
        const count = await successionRepository.count(filters);

        expect(successions).toHaveLength(0);
        expect(count).toBe(0);
      });
    });

    describe('combined filters', () => {
      it('should combine departments and zip codes filters', async () => {
        const allSuccessions = await successionRepository.findAll();
        const existingDepartment = allSuccessions[0]?.department;
        const existingZipCode = allSuccessions[0]?.zipCode;

        if (!existingDepartment || !existingZipCode) {
          console.warn('No suitable succession found for combined filter test');
          return;
        }

        const filters: ISuccessionFilters = {
          departments: [existingDepartment],
          zipCodes: [existingZipCode],
        };

        const successions = await successionRepository.findAll(filters);
        const count = await successionRepository.count(filters);

        expect(successions.length).toBe(count);
        successions.forEach((succession) => {
          expect(succession.department).toBe(existingDepartment);
          expect(succession.zipCode).toBe(existingZipCode);
        });
      });

      it('should combine multiple filter types', async () => {
        const allSuccessions = await successionRepository.findAll();
        const existingDepartment = allSuccessions[0]?.department;

        if (!existingDepartment) {
          console.warn('No department found for combined filter test');
          return;
        }

        const filters: ISuccessionFilters = {
          departments: [existingDepartment],
          dateAfter: '12_months',
        };

        const successions = await successionRepository.findAll(filters);
        const count = await successionRepository.count(filters);

        expect(successions.length).toBe(count);
        successions.forEach((succession) => {
          expect(succession.department).toBe(existingDepartment);
        });
      });
    });

    describe('pagination', () => {
      it('should apply pagination without filters', async () => {
        const paginationFilters: PaginationFilters = {
          limit: 2,
          offset: 1,
        };

        const successions = await successionRepository.findAll(
          undefined,
          paginationFilters,
        );

        expect(successions).toHaveLength(2);
      });

      it('should apply pagination with filters', async () => {
        const allSuccessions = await successionRepository.findAll();
        const existingDepartment = allSuccessions[0]?.department;

        if (!existingDepartment) {
          console.warn('No department found for pagination test');
          return;
        }

        const filters: ISuccessionFilters = {
          departments: [existingDepartment],
        };
        const paginationFilters: PaginationFilters = {
          limit: 1,
          offset: 0,
        };

        const successions = await successionRepository.findAll(
          filters,
          paginationFilters,
        );

        expect(successions).toHaveLength(1);
        expect(successions[0]?.department).toBe(existingDepartment);
      });
    });

    describe('sorting', () => {
      it('should sort by createdAt descending (default)', async () => {
        const successions = await successionRepository.findAll();

        // Verify default sorting (createdAt desc) - most recent first
        expect(successions).toBeInstanceOf(Array);
        if (successions.length > 1) {
          for (let i = 1; i < successions.length; i++) {
            const current = new Date(successions[i].createdAt);
            const previous = new Date(successions[i - 1].createdAt);
            expect(current.getTime()).toBeLessThanOrEqual(previous.getTime());
          }
        }
      });

      it('should sort by specified field ascending', async () => {
        const filters: ISuccessionFilters = {
          sortBy: 'label',
          sortOrder: 'asc',
        };

        const successions = await successionRepository.findAll(filters);

        expect(successions).toBeInstanceOf(Array);
        // Test that results are properly ordered (basic sanity check)
        if (successions.length > 1) {
          for (let i = 1; i < successions.length; i++) {
            const current = successions[i]?.label || '';
            const previous = successions[i - 1]?.label || '';
            expect(current.localeCompare(previous)).toBeGreaterThanOrEqual(0);
          }
        }
      });

      it('should sort by specified field descending', async () => {
        const filters: ISuccessionFilters = {
          sortBy: 'label',
          sortOrder: 'desc',
        };

        const successions = await successionRepository.findAll(filters);

        expect(successions).toBeInstanceOf(Array);
        // Test that results are properly ordered (basic sanity check)
        if (successions.length > 1) {
          for (let i = 1; i < successions.length; i++) {
            const current = successions[i]?.label || '';
            const previous = successions[i - 1]?.label || '';
            expect(current.localeCompare(previous)).toBeLessThanOrEqual(0);
          }
        }
      });
    });
  });
});
