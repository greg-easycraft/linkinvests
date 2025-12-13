import { Module } from '@nestjs/common';

import {
  FavoriteAuctionRepository,
  FavoriteEnergyDiagnosticsRepository,
  FavoriteEventRepository,
  FavoriteLiquidationRepository,
  FavoriteListingRepository,
  FavoriteRepository,
  FavoriteSuccessionRepository,
} from './lib.types';
import {
  FavoriteAuctionRepositoryImpl,
  FavoriteEnergyDiagnosticsRepositoryImpl,
  FavoriteEventRepositoryImpl,
  FavoriteLiquidationRepositoryImpl,
  FavoriteListingRepositoryImpl,
  FavoriteRepositoryImpl,
  FavoriteSuccessionRepositoryImpl,
} from './repositories';
import { FavoriteService } from './services/favorite.service';
import { FavoritesController } from './favorites.controller';

@Module({
  controllers: [FavoritesController],
  providers: [
    {
      provide: FavoriteRepository,
      useClass: FavoriteRepositoryImpl,
    },
    {
      provide: FavoriteEventRepository,
      useClass: FavoriteEventRepositoryImpl,
    },
    {
      provide: FavoriteAuctionRepository,
      useClass: FavoriteAuctionRepositoryImpl,
    },
    {
      provide: FavoriteListingRepository,
      useClass: FavoriteListingRepositoryImpl,
    },
    {
      provide: FavoriteSuccessionRepository,
      useClass: FavoriteSuccessionRepositoryImpl,
    },
    {
      provide: FavoriteLiquidationRepository,
      useClass: FavoriteLiquidationRepositoryImpl,
    },
    {
      provide: FavoriteEnergyDiagnosticsRepository,
      useClass: FavoriteEnergyDiagnosticsRepositoryImpl,
    },
    FavoriteService,
  ],
  exports: [FavoriteService, FavoriteRepository],
})
export class FavoritesModule {}
