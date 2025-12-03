import { Module } from '@nestjs/common';
import { AddressSearchRepository, AddressLinksRepository } from './lib.types';
import { DrizzleAddressSearchRepository } from './repositories/address-search.repository';
import { DrizzleAddressLinksRepository } from './repositories/address-links.repository';
import { AddressSearchService } from './services/address-search.service';

@Module({
  providers: [
    {
      provide: AddressSearchRepository,
      useClass: DrizzleAddressSearchRepository,
    },
    {
      provide: AddressLinksRepository,
      useClass: DrizzleAddressLinksRepository,
    },
    AddressSearchService,
  ],
  exports: [AddressSearchService, AddressSearchRepository, AddressLinksRepository],
})
export class AddressesModule {}
