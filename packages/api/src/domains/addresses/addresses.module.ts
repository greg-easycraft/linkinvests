import { Module } from '@nestjs/common';
import { AddressSearchRepository, AddressLinksRepository } from './lib.types.js';
import { DrizzleAddressSearchRepository } from './repositories/address-search.repository.js';
import { DrizzleAddressLinksRepository } from './repositories/address-links.repository.js';
import { AddressSearchService } from './services/address-search.service.js';

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
