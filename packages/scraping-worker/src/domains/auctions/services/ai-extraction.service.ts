import { Injectable, Logger } from '@nestjs/common';

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
export class AiExtractionService {
  private readonly logger = new Logger(AiExtractionService.name);
  constructor() {}

  /**
   * Extract structured auction data from French auction description
   * @param description - Raw auction description text in French
   * @returns Extracted auction data or null (currently always null - TODO: implement)
   */
  async extractAuctionData(
    description: string
  ): Promise<AuctionExtraction | null> {
    if (!description || description.trim().length === 0) {
      this.logger.debug('Empty description provided - skipping extraction');
      return null;
    }

    // TODO: Implement Genkit-based extraction
    this.logger.debug('AI extraction not yet implemented');
    return Promise.resolve(null);
  }
}
