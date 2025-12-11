import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { Session, AuthGuard } from '@thallesp/nestjs-better-auth';
import type { AuthSession } from '~/common/auth/auth.types';
import {
  SavedSearchService,
  SavedSearchServiceErrorReason,
} from './services/saved-searches.service';
import {
  createSavedSearchRequestSchema,
  type CreateSavedSearchRequest,
} from '@linkinvests/shared';
import { isRefusal } from '~/common/utils/operation-result';

@Controller('saved-searches')
@UseGuards(AuthGuard)
export class SavedSearchesController {
  constructor(private readonly savedSearchService: SavedSearchService) {}

  @Get()
  async list(@Session() session: AuthSession) {
    const result = await this.savedSearchService.getUserSavedSearches(
      session.user.id,
    );
    if (isRefusal(result)) {
      throw new InternalServerErrorException();
    }
    return { savedSearches: result.data };
  }

  @Post()
  async create(
    @Session() session: AuthSession,
    @Body(new ZodValidationPipe(createSavedSearchRequestSchema))
    body: CreateSavedSearchRequest,
  ) {
    const result = await this.savedSearchService.createSavedSearch(
      session.user.id,
      body,
    );
    if (isRefusal(result)) {
      switch (result.reason) {
        case SavedSearchServiceErrorReason.LIMIT_EXCEEDED:
          throw new BadRequestException(
            'Nombre maximum de recherches sauvegardées atteint',
          );
        default:
          throw new InternalServerErrorException();
      }
    }
    return result.data;
  }

  @Delete(':id')
  async delete(@Session() session: AuthSession, @Param('id') id: string) {
    const result = await this.savedSearchService.deleteSavedSearch(
      session.user.id,
      id,
    );
    if (isRefusal(result)) {
      switch (result.reason) {
        case SavedSearchServiceErrorReason.NOT_FOUND:
          throw new NotFoundException('Recherche sauvegardée non trouvée');
        case SavedSearchServiceErrorReason.UNAUTHORIZED:
          throw new ForbiddenException(
            'Non autorisé à supprimer cette recherche',
          );
        default:
          throw new InternalServerErrorException();
      }
    }
    return { success: true };
  }
}
