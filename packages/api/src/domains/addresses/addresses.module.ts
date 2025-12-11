import { Module } from '@nestjs/common';
import { AddressSearchRepository, AddressLinksRepository } from './lib.types';
import { AddressSearchRepositoryImpl } from './repositories/address-search.repository';
import { AddressLinksRepositoryImpl } from './repositories/address-links.repository';
import { AddressSearchService } from './services/address-search.service';
import { AddressesController } from './addresses.controller';

@Module({
  controllers: [AddressesController],
  providers: [
    {
      provide: AddressSearchRepository,
      useClass: AddressSearchRepositoryImpl,
    },
    {
      provide: AddressLinksRepository,
      useClass: AddressLinksRepositoryImpl,
    },
    AddressSearchService,
  ],
  exports: [
    AddressSearchService,
    AddressSearchRepository,
    AddressLinksRepository,
  ],
})
export class AddressesModule {}
