import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';

export function setupBullBoard(
  failingCompaniesQueue: Queue,
  companyBuildingsQueue: Queue,
) {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  createBullBoard({
    queues: [
      new BullMQAdapter(failingCompaniesQueue),
      new BullMQAdapter(companyBuildingsQueue),
    ],
    serverAdapter,
  });

  return serverAdapter.getRouter();
}
