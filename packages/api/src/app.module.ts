import { Module } from '@nestjs/common';
import { AuthModule } from './common/auth';
import { ConfigModule } from './common/config';
import { DatabaseModule } from './common/database';
import { EmailModule } from './common/email';
import { ExportModule } from './common/export';
import { AuctionsModule } from './domains/auctions';
import { ListingsModule } from './domains/listings';
import { SuccessionsModule } from './domains/successions';
import { LiquidationsModule } from './domains/liquidations';
import { EnergyDiagnosticsModule } from './domains/energy-diagnostics';
import { AddressesModule } from './domains/addresses';
import { SavedSearchesModule } from './domains/saved-searches';
import { FavoritesModule } from './domains/favorites';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule,
    EmailModule,
    ExportModule,
    AuctionsModule,
    ListingsModule,
    SuccessionsModule,
    LiquidationsModule,
    EnergyDiagnosticsModule,
    AddressesModule,
    SavedSearchesModule,
    FavoritesModule,
  ],
})
export class AppModule {}
