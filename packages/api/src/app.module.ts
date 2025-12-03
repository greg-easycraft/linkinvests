import { Module } from '@nestjs/common';
import { ConfigModule } from './common/config/index';
import { EmailModule } from './common/email/index';
import { DatabaseModule } from './common/database/index';
import { ExportModule } from './common/export/index';
import { AuctionsModule } from './domains/auctions/index';
import { ListingsModule } from './domains/listings/index';
import { SuccessionsModule } from './domains/successions/index';
import { LiquidationsModule } from './domains/liquidations/index';
import { EnergyDiagnosticsModule } from './domains/energy-diagnostics/index';
import { AddressesModule } from './domains/addresses/index';

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
