import { Module } from '@nestjs/common';
import { ConfigModule } from './common/config/index.js';
import { EmailModule } from './common/email/index.js';
import { DatabaseModule } from './common/database/index.js';
import { ExportModule } from './common/export/index.js';
import { AuctionsModule } from './domains/auctions/index.js';
import { ListingsModule } from './domains/listings/index.js';
import { SuccessionsModule } from './domains/successions/index.js';
import { LiquidationsModule } from './domains/liquidations/index.js';
import { EnergyDiagnosticsModule } from './domains/energy-diagnostics/index.js';
import { AddressesModule } from './domains/addresses/index.js';

@Module({
  imports: [
    ConfigModule,
    EmailModule,
    DatabaseModule,
    ExportModule,
    AuctionsModule,
    ListingsModule,
    SuccessionsModule,
    LiquidationsModule,
    EnergyDiagnosticsModule,
    AddressesModule,
  ],
})
export class AppModule {}
