/**
 * @jest-environment node
 */
import { DrizzleEnergyDiagnosticsRepository } from './energy-diagnostics.repository';
import { useTestDb } from '~/test-utils/use-test-db';
import { OpportunityType } from '@linkinvests/shared';

describe('DrizzleEnergyDiagnosticsRepository Integration Tests', () => {
  const db = useTestDb();
  const energyDiagnosticsRepository = new DrizzleEnergyDiagnosticsRepository(db);

  it('should find all energy diagnostics', async () => {
    const diagnostics = await energyDiagnosticsRepository.findAll();
    expect(diagnostics).toHaveLength(5);
    expect(diagnostics[0]).toHaveProperty('type', OpportunityType.ENERGY_SIEVE);
  });

  it('should filter by energy classes', async () => {
    const filters = { energyClasses: ['F', 'G'] };
    const diagnostics = await energyDiagnosticsRepository.findAll(filters);
    diagnostics.forEach(d => expect(['F', 'G']).toContain(d.energyClass));
  });

  it('should find by ID', async () => {
    const all = await energyDiagnosticsRepository.findAll();
    const found = await energyDiagnosticsRepository.findById(all[0].id);
    expect(found?.id).toBe(all[0].id);
  });

  it('should count energy diagnostics', async () => {
    const count = await energyDiagnosticsRepository.count();
    expect(count).toBe(5);
  });
});