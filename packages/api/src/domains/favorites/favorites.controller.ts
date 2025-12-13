import {
  Controller,
  Get,
  Post,
  Body,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { Session, AuthGuard } from '@thallesp/nestjs-better-auth';
import type { AuthSession } from '~/common/auth/auth.types';
import {
  FavoriteService,
  FavoriteServiceErrorReason,
} from './services/favorite.service';
import {
  addFavoriteSchema,
  removeFavoriteSchema,
  checkFavoriteSchema,
  checkBatchFavoritesSchema,
  markEmailSentSchema,
  type AddFavoriteRequest,
  type RemoveFavoriteRequest,
  type CheckFavoriteRequest,
  type CheckBatchFavoritesRequest,
  type MarkEmailSentRequest,
} from '@linkinvests/shared';
import { isRefusal } from '~/common/utils/operation-result';

@Controller('favorites')
@UseGuards(AuthGuard)
export class FavoritesController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Get()
  async getUserFavorites(@Session() session: AuthSession) {
    const result = await this.favoriteService.getUserFavoritesGrouped(
      session.user.id,
    );
    if (isRefusal(result)) {
      throw new InternalServerErrorException();
    }
    return result.data;
  }

  @Post('add')
  async addFavorite(
    @Session() session: AuthSession,
    @Body(new ZodValidationPipe(addFavoriteSchema)) body: AddFavoriteRequest,
  ) {
    const result = await this.favoriteService.addFavorite(
      session.user.id,
      body.opportunityId,
      body.opportunityType,
    );
    if (isRefusal(result)) {
      switch (result.reason) {
        case FavoriteServiceErrorReason.ALREADY_EXISTS:
          throw new ConflictException('Already in favorites');
        default:
          throw new InternalServerErrorException();
      }
    }
    return { success: true };
  }

  @Post('remove')
  async removeFavorite(
    @Session() session: AuthSession,
    @Body(new ZodValidationPipe(removeFavoriteSchema))
    body: RemoveFavoriteRequest,
  ) {
    const result = await this.favoriteService.removeFavorite(
      session.user.id,
      body.opportunityId,
      body.opportunityType,
    );
    if (isRefusal(result)) {
      switch (result.reason) {
        case FavoriteServiceErrorReason.NOT_FOUND:
          throw new NotFoundException('Favorite not found');
        default:
          throw new InternalServerErrorException();
      }
    }
    return { success: true };
  }

  @Post('check')
  async checkFavorite(
    @Session() session: AuthSession,
    @Body(new ZodValidationPipe(checkFavoriteSchema))
    body: CheckFavoriteRequest,
  ) {
    const result = await this.favoriteService.checkFavorite(
      session.user.id,
      body.opportunityId,
      body.opportunityType,
    );
    if (isRefusal(result)) {
      throw new InternalServerErrorException();
    }
    return { isFavorite: result.data };
  }

  @Post('check-batch')
  async checkBatchFavorites(
    @Session() session: AuthSession,
    @Body(new ZodValidationPipe(checkBatchFavoritesSchema))
    body: CheckBatchFavoritesRequest,
  ) {
    const result = await this.favoriteService.checkMultipleFavorites(
      session.user.id,
      body.opportunityIds,
      body.opportunityType,
    );
    if (isRefusal(result)) {
      throw new InternalServerErrorException();
    }
    return { favoriteIds: result.data };
  }

  @Post('mark-email-sent')
  async markEmailSent(
    @Session() session: AuthSession,
    @Body(new ZodValidationPipe(markEmailSentSchema))
    body: MarkEmailSentRequest,
  ) {
    const result = await this.favoriteService.markEmailSent(
      session.user.id,
      body.favoriteId,
    );

    if (isRefusal(result)) {
      switch (result.reason) {
        case FavoriteServiceErrorReason.NOT_FOUND:
          throw new NotFoundException('Favorite not found');
        case FavoriteServiceErrorReason.EMAIL_ALREADY_SENT:
          throw new ConflictException('Email already sent');
        case FavoriteServiceErrorReason.NOT_SUCCESSION_TYPE:
          throw new BadRequestException(
            'Only succession favorites support email status',
          );
        default:
          throw new InternalServerErrorException();
      }
    }

    return { success: true };
  }
}
