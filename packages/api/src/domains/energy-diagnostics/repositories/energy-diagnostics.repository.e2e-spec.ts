/**
 * @jest-environment node
 */
import { EnergyDiagnosticsRepositoryImpl } from './energy-diagnostics.repository';
import { useTestDb } from '~/test-utils/use-test-db';
import { EnergyClass, OpportunityType } from '@linkinvests/shared';
import type { IEnergyDiagnosticFilters, PaginationFilters } from '~/types';

describe('EnergyDiagnosticsRepositoryImpl Integration Tests', () => {
  const db = useTestDb();
  const energyDiagnosticsRepository = new EnergyDiagnosticsRepositoryImpl(db);

  describe('basic functionality', () => {
    it('should find all energy diagnostics without filters', async () => {
      const diagnostics = await energyDiagnosticsRepository.findAll();

      expect(diagnostics).toHaveLength(5);
      expect(diagnostics[0]).toHaveProperty('id');
      expect(diagnostics[0]).toHaveProperty(
        'type',
        OpportunityType.ENERGY_SIEVE,
      );
      expect(diagnostics[0]).toHaveProperty('city');
      expect(diagnostics[0]).toHaveProperty('department');

      // Verify all results have energy classes E, F, or G (business requirement)
      diagnostics.forEach((diagnostic) => {
        expect(['E', 'F', 'G']).toContain(diagnostic.energyClass);
      });
    });

    it('should find by ID', async () => {
      const all = await energyDiagnosticsRepository.findAll();
      const targetId = all[0]?.id ?? '';
      const found = await energyDiagnosticsRepository.findById(targetId);
      expect(found?.id).toBe(targetId);
    });

    it('should count energy diagnostics without filters', async () => {
      const count = await energyDiagnosticsRepository.count();
      expect(count).toBe(5);
    });
  });

  describe('filter functionality', () => {
    describe('departments filter', () => {
      it('should filter by single department', async () => {
        const allDiagnostics = await energyDiagnosticsRepository.findAll();
        const existingDepartment = allDiagnostics[0]?.department;

        if (!existingDepartment) {
          console.warn(
            'No energy diagnostics with departments found in fixtures',
          );
          return;
        }

        const filters: IEnergyDiagnosticFilters = {
          departments: [existingDepartment],
        };

        const diagnostics = await energyDiagnosticsRepository.findAll(filters);
        const count = await energyDiagnosticsRepository.count(filters);

        expect(diagnostics.length).toBeGreaterThan(0);
        expect(diagnostics.length).toBe(count);
        diagnostics.forEach((diagnostic) => {
          expect(diagnostic.department).toBe(existingDepartment);
          expect(['E', 'F', 'G']).toContain(diagnostic.energyClass);
        });
      });

      it('should filter by multiple departments', async () => {
        const allDiagnostics = await energyDiagnosticsRepository.findAll();
        const departments = [
          ...new Set(allDiagnostics.map((d) => d.department)),
        ].filter(Boolean);

        if (departments.length < 2) {
          console.warn(
            'Not enough different departments found in fixtures for multiple department test',
          );
          return;
        }

        const filters: IEnergyDiagnosticFilters = {
          departments: departments.slice(0, 2),
        };

        const diagnostics = await energyDiagnosticsRepository.findAll(filters);
        const count = await energyDiagnosticsRepository.count(filters);

        expect(diagnostics.length).toBeGreaterThan(0);
        expect(diagnostics.length).toBe(count);
        diagnostics.forEach((diagnostic) => {
          expect(departments.slice(0, 2)).toContain(diagnostic.department);
          expect(['E', 'F', 'G']).toContain(diagnostic.energyClass);
        });
      });

      it('should return empty array for non-existent department', async () => {
        const filters: IEnergyDiagnosticFilters = {
          departments: ['99'],
        };

        const diagnostics = await energyDiagnosticsRepository.findAll(filters);
        const count = await energyDiagnosticsRepository.count(filters);

        expect(diagnostics).toHaveLength(0);
        expect(count).toBe(0);
      });
    });

    describe('zipCodes filter', () => {
      it('should filter by single zip code', async () => {
        const allDiagnostics = await energyDiagnosticsRepository.findAll();
        const existingZipCode = allDiagnostics[0]?.zipCode;

        if (!existingZipCode) {
          console.warn(
            'No energy diagnostics with zip codes found in fixtures',
          );
          return;
        }

        const filters: IEnergyDiagnosticFilters = {
          zipCodes: [existingZipCode],
        };

        const diagnostics = await energyDiagnosticsRepository.findAll(filters);
        const count = await energyDiagnosticsRepository.count(filters);

        expect(diagnostics.length).toBeGreaterThan(0);
        expect(diagnostics.length).toBe(count);
        diagnostics.forEach((diagnostic) => {
          expect(diagnostic.zipCode).toBe(existingZipCode);
          expect(['E', 'F', 'G']).toContain(diagnostic.energyClass);
        });
      });

      it('should filter by multiple zip codes', async () => {
        const allDiagnostics = await energyDiagnosticsRepository.findAll();
        const zipCodes = [
          ...new Set(allDiagnostics.map((d) => d.zipCode)),
        ].filter(Boolean);

        if (zipCodes.length < 2) {
          console.warn(
            'Not enough different zip codes found in fixtures for multiple zip code test',
          );
          return;
        }

        const filters: IEnergyDiagnosticFilters = {
          zipCodes: zipCodes.slice(0, 2),
        };

        const diagnostics = await energyDiagnosticsRepository.findAll(filters);
        const count = await energyDiagnosticsRepository.count(filters);

        expect(diagnostics.length).toBeGreaterThan(0);
        expect(diagnostics.length).toBe(count);
        diagnostics.forEach((diagnostic) => {
          expect(zipCodes.slice(0, 2)).toContain(diagnostic.zipCode);
          expect(['E', 'F', 'G']).toContain(diagnostic.energyClass);
        });
      });

      it('should return empty array for non-existent zip code', async () => {
        const filters: IEnergyDiagnosticFilters = {
          zipCodes: ['00000'],
        };

        const diagnostics = await energyDiagnosticsRepository.findAll(filters);
        const count = await energyDiagnosticsRepository.count(filters);

        expect(diagnostics).toHaveLength(0);
        expect(count).toBe(0);
      });
    });

    describe('dateAfter filter', () => {
      it('should filter by last month', async () => {
        const filters: IEnergyDiagnosticFilters = {
          dateAfter: 'last_month',
        };

        const diagnostics = await energyDiagnosticsRepository.findAll(filters);
        const count = await energyDiagnosticsRepository.count(filters);

        expect(diagnostics.length).toBe(count);
        expect(diagnostics).toBeInstanceOf(Array);
        diagnostics.forEach((diagnostic) => {
          expect(['E', 'F', 'G']).toContain(diagnostic.energyClass);
        });
      });

      it('should filter by last 3 months', async () => {
        const filters: IEnergyDiagnosticFilters = {
          dateAfter: 'last_3_months',
        };

        const diagnostics = await energyDiagnosticsRepository.findAll(filters);
        const count = await energyDiagnosticsRepository.count(filters);

        expect(diagnostics.length).toBe(count);
        expect(diagnostics).toBeInstanceOf(Array);
        diagnostics.forEach((diagnostic) => {
          expect(['E', 'F', 'G']).toContain(diagnostic.energyClass);
        });
      });

      it('should filter by last 12 months', async () => {
        const filters: IEnergyDiagnosticFilters = {
          dateAfter: '12_months',
        };

        const diagnostics = await energyDiagnosticsRepository.findAll(filters);
        const count = await energyDiagnosticsRepository.count(filters);

        expect(diagnostics.length).toBe(count);
        expect(diagnostics).toBeInstanceOf(Array);
        diagnostics.forEach((diagnostic) => {
          expect(['E', 'F', 'G']).toContain(diagnostic.energyClass);
        });
      });
    });

    describe('bounds filter', () => {
      it('should filter by map bounds', async () => {
        const allDiagnostics = await energyDiagnosticsRepository.findAll();
        const diagnosticsWithCoords = allDiagnostics.filter(
          (d) => d.latitude != null && d.longitude != null,
        );

        if (diagnosticsWithCoords.length === 0) {
          console.warn(
            'No energy diagnostics with coordinates found in fixtures',
          );
          return;
        }

        const latitudes = diagnosticsWithCoords.map((d) => d.latitude);
        const longitudes = diagnosticsWithCoords.map((d) => d.longitude);

        const filters: IEnergyDiagnosticFilters = {
          bounds: {
            north: Math.max(...latitudes) + 0.1,
            south: Math.min(...latitudes) - 0.1,
            east: Math.max(...longitudes) + 0.1,
            west: Math.min(...longitudes) - 0.1,
          },
        };

        const diagnostics = await energyDiagnosticsRepository.findAll(filters);
        const count = await energyDiagnosticsRepository.count(filters);

        expect(diagnostics.length).toBeGreaterThan(0);
        expect(diagnostics.length).toBe(count);
        diagnostics.forEach((diagnostic) => {
          if (diagnostic.latitude != null && diagnostic.longitude != null) {
            expect(diagnostic.latitude).toBeGreaterThanOrEqual(
              filters.bounds!.south,
            );
            expect(diagnostic.latitude).toBeLessThanOrEqual(
              filters.bounds!.north,
            );
            expect(diagnostic.longitude).toBeGreaterThanOrEqual(
              filters.bounds!.west,
            );
            expect(diagnostic.longitude).toBeLessThanOrEqual(
              filters.bounds!.east,
            );
          }
          expect(['E', 'F', 'G']).toContain(diagnostic.energyClass);
        });
      });

      it('should return empty array for bounds with no energy diagnostics', async () => {
        const filters: IEnergyDiagnosticFilters = {
          bounds: {
            north: 90.0,
            south: 89.0,
            east: 180.0,
            west: 179.0,
          },
        };

        const diagnostics = await energyDiagnosticsRepository.findAll(filters);
        const count = await energyDiagnosticsRepository.count(filters);

        expect(diagnostics).toHaveLength(0);
        expect(count).toBe(0);
      });
    });

    describe('energyClasses filter', () => {
      it('should filter by allowed energy classes (F, G)', async () => {
        const filters: IEnergyDiagnosticFilters = {
          energyClasses: [EnergyClass.F, EnergyClass.G],
        };

        const diagnostics = await energyDiagnosticsRepository.findAll(filters);
        const count = await energyDiagnosticsRepository.count(filters);

        expect(diagnostics.length).toBe(count);
        diagnostics.forEach((diagnostic) => {
          expect(['F', 'G']).toContain(diagnostic.energyClass);
        });
      });

      it('should filter by allowed energy classes (E, F)', async () => {
        const filters: IEnergyDiagnosticFilters = {
          energyClasses: [EnergyClass.E, EnergyClass.F],
        };

        const diagnostics = await energyDiagnosticsRepository.findAll(filters);
        const count = await energyDiagnosticsRepository.count(filters);

        expect(diagnostics.length).toBe(count);
        diagnostics.forEach((diagnostic) => {
          expect(['E', 'F']).toContain(diagnostic.energyClass);
        });
      });

      it('should filter by single energy class (G)', async () => {
        const filters: IEnergyDiagnosticFilters = {
          energyClasses: [EnergyClass.G],
        };

        const diagnostics = await energyDiagnosticsRepository.findAll(filters);
        const count = await energyDiagnosticsRepository.count(filters);

        expect(diagnostics.length).toBe(count);
        diagnostics.forEach((diagnostic) => {
          expect(diagnostic.energyClass).toBe('G');
        });
      });

      it('should ignore disallowed energy classes (A, B, C, D)', async () => {
        const filters: IEnergyDiagnosticFilters = {
          energyClasses: [
            EnergyClass.A,
            EnergyClass.B,
            EnergyClass.C,
            EnergyClass.D,
          ],
        };

        const diagnostics = await energyDiagnosticsRepository.findAll(filters);
        const count = await energyDiagnosticsRepository.count(filters);

        // Should return empty since A, B, C, D are not allowed
        expect(diagnostics).toHaveLength(0);
        expect(count).toBe(0);
      });

      it('should filter mixed allowed and disallowed energy classes', async () => {
        const filters: IEnergyDiagnosticFilters = {
          energyClasses: [EnergyClass.A, EnergyClass.F, EnergyClass.G], // Should only consider F and G
        };

        const diagnostics = await energyDiagnosticsRepository.findAll(filters);
        const count = await energyDiagnosticsRepository.count(filters);

        expect(diagnostics.length).toBe(count);
        diagnostics.forEach((diagnostic) => {
          expect(['F', 'G']).toContain(diagnostic.energyClass);
        });
      });

      it('should default to E, F, G when no energyClasses specified', async () => {
        const filters: IEnergyDiagnosticFilters = {
          departments: ['75'], // Any other filter without energyClasses
        };

        const diagnostics = await energyDiagnosticsRepository.findAll(filters);

        diagnostics.forEach((diagnostic) => {
          expect(['E', 'F', 'G']).toContain(diagnostic.energyClass);
        });
      });
    });

    describe('combined filters', () => {
      it('should combine departments and energy classes filters', async () => {
        const allDiagnostics = await energyDiagnosticsRepository.findAll();
        const existingDepartment = allDiagnostics[0]?.department;

        if (!existingDepartment) {
          console.warn('No department found for combined filter test');
          return;
        }

        const filters: IEnergyDiagnosticFilters = {
          departments: [existingDepartment],
          energyClasses: [EnergyClass.F, EnergyClass.G],
        };

        const diagnostics = await energyDiagnosticsRepository.findAll(filters);
        const count = await energyDiagnosticsRepository.count(filters);

        expect(diagnostics.length).toBe(count);
        diagnostics.forEach((diagnostic) => {
          expect(diagnostic.department).toBe(existingDepartment);
          expect(['F', 'G']).toContain(diagnostic.energyClass);
        });
      });

      it('should combine multiple filter types', async () => {
        const allDiagnostics = await energyDiagnosticsRepository.findAll();
        const existingDepartment = allDiagnostics[0]?.department;
        const existingZipCode = allDiagnostics[0]?.zipCode;

        if (!existingDepartment || !existingZipCode) {
          console.warn('No suitable diagnostic found for combined filter test');
          return;
        }

        const filters: IEnergyDiagnosticFilters = {
          departments: [existingDepartment],
          zipCodes: [existingZipCode],
          energyClasses: [EnergyClass.E, EnergyClass.F, EnergyClass.G],
          dateAfter: '12_months',
        };

        const diagnostics = await energyDiagnosticsRepository.findAll(filters);
        const count = await energyDiagnosticsRepository.count(filters);

        expect(diagnostics.length).toBe(count);
        diagnostics.forEach((diagnostic) => {
          expect(diagnostic.department).toBe(existingDepartment);
          expect(diagnostic.zipCode).toBe(existingZipCode);
          expect(['E', 'F', 'G']).toContain(diagnostic.energyClass);
        });
      });
    });

    describe('pagination', () => {
      it('should apply pagination without filters', async () => {
        const paginationFilters: PaginationFilters = {
          limit: 2,
          offset: 1,
        };

        const diagnostics = await energyDiagnosticsRepository.findAll(
          undefined,
          paginationFilters,
        );

        expect(diagnostics).toHaveLength(2);
        diagnostics.forEach((diagnostic) => {
          expect(['E', 'F', 'G']).toContain(diagnostic.energyClass);
        });
      });

      it('should apply pagination with filters', async () => {
        const allDiagnostics = await energyDiagnosticsRepository.findAll();
        const existingDepartment = allDiagnostics[0]?.department;

        if (!existingDepartment) {
          console.warn('No department found for pagination test');
          return;
        }

        const filters: IEnergyDiagnosticFilters = {
          departments: [existingDepartment],
        };
        const paginationFilters: PaginationFilters = {
          limit: 1,
          offset: 0,
        };

        const diagnostics = await energyDiagnosticsRepository.findAll(
          filters,
          paginationFilters,
        );

        expect(diagnostics).toHaveLength(1);
        expect(diagnostics[0]?.department).toBe(existingDepartment);
        expect(['E', 'F', 'G']).toContain(diagnostics[0].energyClass);
      });
    });

    describe('sorting', () => {
      it('should sort by createdAt descending (default)', async () => {
        const diagnostics = await energyDiagnosticsRepository.findAll();

        expect(diagnostics).toBeInstanceOf(Array);
        if (diagnostics.length > 1) {
          for (let i = 1; i < diagnostics.length; i++) {
            const current = new Date(diagnostics[i].createdAt);
            const previous = new Date(diagnostics[i - 1].createdAt);
            expect(current.getTime()).toBeLessThanOrEqual(previous.getTime());
          }
        }
        diagnostics.forEach((diagnostic) => {
          expect(['E', 'F', 'G']).toContain(diagnostic.energyClass);
        });
      });

      it('should sort by specified field ascending', async () => {
        const filters: IEnergyDiagnosticFilters = {
          sortBy: 'address',
          sortOrder: 'asc',
        };

        const diagnostics = await energyDiagnosticsRepository.findAll(filters);

        expect(diagnostics).toBeInstanceOf(Array);
        if (diagnostics.length > 1) {
          for (let i = 1; i < diagnostics.length; i++) {
            const current = diagnostics[i]?.address || '';
            const previous = diagnostics[i - 1]?.address || '';
            expect(current.localeCompare(previous)).toBeGreaterThanOrEqual(0);
          }
        }
        diagnostics.forEach((diagnostic) => {
          expect(['E', 'F', 'G']).toContain(diagnostic.energyClass);
        });
      });

      it('should sort by specified field descending', async () => {
        const filters: IEnergyDiagnosticFilters = {
          sortBy: 'address',
          sortOrder: 'desc',
        };

        const diagnostics = await energyDiagnosticsRepository.findAll(filters);

        expect(diagnostics).toBeInstanceOf(Array);
        if (diagnostics.length > 1) {
          for (let i = 1; i < diagnostics.length; i++) {
            const current = diagnostics[i]?.address || '';
            const previous = diagnostics[i - 1]?.address || '';
            expect(current.localeCompare(previous)).toBeLessThanOrEqual(0);
          }
        }
        diagnostics.forEach((diagnostic) => {
          expect(['E', 'F', 'G']).toContain(diagnostic.energyClass);
        });
      });
    });
  });

  describe('business rules', () => {
    it('should always enforce E, F, G energy class restriction', async () => {
      const allWithoutFilters = await energyDiagnosticsRepository.findAll();
      const countWithoutFilters = await energyDiagnosticsRepository.count();

      expect(allWithoutFilters.length).toBe(countWithoutFilters);
      allWithoutFilters.forEach((diagnostic) => {
        expect(['E', 'F', 'G']).toContain(diagnostic.energyClass);
      });
    });

    it('should enforce energy class restriction when finding by ID', async () => {
      const all = await energyDiagnosticsRepository.findAll();
      const targetId = all[0]?.id ?? '';

      const found = await energyDiagnosticsRepository.findById(targetId);

      if (found) {
        expect(['E', 'F', 'G']).toContain(found.energyClass);
      }
    });
  });
});
