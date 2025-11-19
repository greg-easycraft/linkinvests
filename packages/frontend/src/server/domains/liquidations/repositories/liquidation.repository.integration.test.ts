/**
 * @jest-environment node
 */
import { DrizzleLiquidationRepository } from './liquidation.repository';
import { useTestDb } from '~/test-utils/use-test-db';
import { OpportunityType } from '@linkinvests/shared';

describe('DrizzleLiquidationRepository Integration Tests', () => {
  const db = useTestDb();
  const liquidationRepository = new DrizzleLiquidationRepository(db);

  it('should find all liquidations', async () => {
    const liquidations = await liquidationRepository.findAll();
    expect(liquidations).toHaveLength(5);
    expect(liquidations[0]).toHaveProperty('type', OpportunityType.LIQUIDATION);
  });

  it('should find by ID', async () => {
    const all = await liquidationRepository.findAll();
    const targetId = all[0]?.id ?? '';
    const found = await liquidationRepository.findById(targetId);
    expect(found?.id).toBe(targetId);
  });

  it('should count liquidations', async () => {
    const count = await liquidationRepository.count();
    expect(count).toBe(5);
  });
});