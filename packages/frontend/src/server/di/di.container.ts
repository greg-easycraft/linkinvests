import { createContainer, asValue, AwilixContainer, asFunction } from 'awilix';
import { db } from '~/server/db';

// Repository imports
import { AuctionService, DrizzleAuctionRepository } from '~/server/domains/auctions';
import { SuccessionService, DrizzleSuccessionRepository } from '~/server/domains/successions';
import { LiquidationService, DrizzleLiquidationRepository } from '~/server/domains/liquidations';
import { EnergyDiagnosticsService, DrizzleEnergyDiagnosticsRepository } from '~/server/domains/energy-diagnostics';

// Shared services
import { ExportService } from '~/server/services/export.service';

// Type definitions for DI container
export interface DIContainer {
  // Database
  db: typeof db;

  // Shared services
  exportService: ExportService;

  // Domain-specific repositories
  auctionRepository: DrizzleAuctionRepository;
  successionRepository: DrizzleSuccessionRepository;
  liquidationRepository: DrizzleLiquidationRepository;
  energyDiagnosticsRepository: DrizzleEnergyDiagnosticsRepository;

  // Domain-specific services
  auctionService: AuctionService;
  successionService: SuccessionService;
  liquidationService: LiquidationService;
  energyDiagnosticsService: EnergyDiagnosticsService;
}

// Create and configure the DI container
function createDIContainer(): AwilixContainer<DIContainer> {
  const container = createContainer<DIContainer>();

  container.register({
    // Database instance
    db: asValue(db),

    // Shared services
    exportService: asFunction(() => new ExportService()),

    // Domain-specific repositories
    auctionRepository: asFunction(() => new DrizzleAuctionRepository(container.resolve('db'))),
    successionRepository: asFunction(() => new DrizzleSuccessionRepository(container.resolve('db'))),
    liquidationRepository: asFunction(() => new DrizzleLiquidationRepository(container.resolve('db'))),
    energyDiagnosticsRepository: asFunction(() => new DrizzleEnergyDiagnosticsRepository(container.resolve('db'))),

    // Domain-specific services
    auctionService: asFunction(() => new AuctionService(container.resolve('auctionRepository'), container.resolve('exportService'))),
    successionService: asFunction(() => new SuccessionService(container.resolve('successionRepository'), container.resolve('exportService'))),
    liquidationService: asFunction(() => new LiquidationService(container.resolve('liquidationRepository'), container.resolve('exportService'))),
    energyDiagnosticsService: asFunction(() => new EnergyDiagnosticsService(container.resolve('energyDiagnosticsRepository'), container.resolve('exportService'))),
  });

  return container;
}

// Global container instance
let containerInstance: AwilixContainer<DIContainer> | null = null;

// Get or create the container instance (singleton pattern)
export function getContainer(): AwilixContainer<DIContainer> {
  if (!containerInstance) {
    containerInstance = createDIContainer();
  }
  return containerInstance;
}

// Helper function to resolve dependencies from container
export function resolve<K extends keyof DIContainer>(name: K): DIContainer[K] {
  return getContainer().resolve(name);
}

// Export the container for direct access if needed
export const container = getContainer();