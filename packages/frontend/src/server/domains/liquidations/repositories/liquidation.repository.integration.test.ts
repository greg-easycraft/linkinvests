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
    const found = await liquidationRepository.findById(all[0]?.id!);
    expect(found?.id).toBe(all[0]?.id);
  });

  it('should count liquidations', async () => {
    const count = await liquidationRepository.count();
    expect(count).toBe(5);
  });
});