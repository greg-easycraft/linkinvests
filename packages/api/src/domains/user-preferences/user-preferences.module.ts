import { Module } from '@nestjs/common';
import { UserQuickActionsRepository } from './lib.types';
import { UserQuickActionsRepositoryImpl } from './repositories/user-quick-actions.repository';
import { UserPreferencesService } from './services/user-preferences.service';
import { UserPreferencesController } from './user-preferences.controller';

@Module({
  controllers: [UserPreferencesController],
  providers: [
    {
      provide: UserQuickActionsRepository,
      useClass: UserQuickActionsRepositoryImpl,
    },
    UserPreferencesService,
  ],
  exports: [UserPreferencesService, UserQuickActionsRepository],
})
export class UserPreferencesModule {}
