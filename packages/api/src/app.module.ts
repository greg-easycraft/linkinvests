import { Module } from '@nestjs/common';
import { ConfigModule } from './common/config';
import { EmailModule } from './common/email';
import { DatabaseModule } from './common/database';
import { ExportModule } from './common/export';
import { AuctionsModule } from './domains/auctions';
import { ListingsModule } from './domains/listings';
import { SuccessionsModule } from './domains/successions';
import { LiquidationsModule } from './domains/liquidations';
import { EnergyDiagnosticsModule } from './domains/energy-diagnostics';
import { AddressesModule } from './domains/addresses';

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
