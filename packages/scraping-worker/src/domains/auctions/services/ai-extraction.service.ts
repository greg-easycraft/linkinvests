import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { AuctionExtraction } from '../schemas/auction-extraction.schema';

/**
 * AI Extraction Service using Genkit
 *
 * TODO: Complete Genkit integration once API is clarified
 * The Genkit API has changed and requires investigation to properly integrate.
 * For now, AI extraction is disabled and returns null.
 *
 * Future implementation should:
 * 1. Use correct Genkit initialization from @genkit-ai/core
 * 2. Define a flow for structured data extraction
 * 3. Use Gemini 1.5 Flash model from @genkit-ai/googleai
 * 4. Extract: price, property Type, description, square footage, auction venue
 */
@Injectable()
export class AiExtractionService implements OnModuleInit {
  private readonly logger = new Logger(AiExtractionService.name);
  private isInitialized = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    // TODO: Initialize Genkit when API is clarified
    const apiKey = this.configService.get<string>('GOOGLE_AI_API_KEY');

    if (!apiKey) {
      this.logger.warn('GOOGLE_AI_API_KEY not configured - AI extraction disabled');
      return;
    }

    this.isInitialized = false; // Set to false until Genkit integration is complete
    this.logger.warn('AI extraction temporarily disabled - Genkit integration pending');
  }

  /**
   * Extract structured auction data from French auction description
   * @param description - Raw auction description text in French
   * @returns Extracted auction data or null (currently always null - TODO: implement)
   */
  async extractAuctionData(description: string): Promise<AuctionExtraction | null> {
    if (!this.isInitialized) {
      this.logger.debug('AI extraction disabled - skipping');
      return null;
    }

    if (!description || description.trim().length === 0) {
      this.logger.debug('Empty description provided - skipping extraction');
      return null;
    }

    // TODO: Implement Genkit-based extraction
    this.logger.debug('AI extraction not yet implemented');
    return null;
  }
}
