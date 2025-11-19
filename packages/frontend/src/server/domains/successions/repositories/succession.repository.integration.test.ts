/**
 * @jest-environment node
 */
import { DrizzleSuccessionRepository } from './succession.repository';
import { useTestDb } from '~/test-utils/use-test-db';
import { OpportunityType } from '@linkinvests/shared';

describe('DrizzleSuccessionRepository Integration Tests', () => {
  const db = useTestDb();
  const successionRepository = new DrizzleSuccessionRepository(db);

  it('should find all successions', async () => {
    const successions = await successionRepository.findAll();
    expect(successions).toHaveLength(5);
    expect(successions[0]).toHaveProperty('type', OpportunityType.SUCCESSION);
  });

  it('should find by ID', async () => {
    const all = await successionRepository.findAll();
    const targetId = all[0]?.id ?? '';
    const found = await successionRepository.findById(targetId);
    expect(found?.id).toBe(targetId);
  });

  it('should count successions', async () => {
    const count = await successionRepository.count();
    expect(count).toBe(5);
  });
});