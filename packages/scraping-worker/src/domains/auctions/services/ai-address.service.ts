import { Injectable, Logger } from '@nestjs/common';

import type {
  AddressRefinementInput,
  AddressRefinementOutput,
  AIAddressServiceConfig,
} from '../types/ai-address.types';
import type { RawAuctionInput } from '../types';
import { refineAddressFlow } from '../flows/address-standardization.flow';

@Injectable()
export class AIAddressService {
  private readonly logger = new Logger(AIAddressService.name);
  private readonly config: AIAddressServiceConfig = {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    minRequestInterval: 1000 / 32, // 1900 requests per minute / 60 seconds = 31.66 requests per second
    minConfidence: 0.6, // Minimum confidence score to accept AI result (0.6 = 60%)
  };
  private lastRequestTime = 0;

  private async standardizeAddress(
    input: AddressRefinementInput
  ): Promise<AddressRefinementOutput | null> {
    if (!input.currentAddress || input.currentAddress.trim().length === 0) {
      this.logger.warn('Empty address provided for AI standardization');
      return null;
    }

    this.logger.debug({ input }, 'AI standardizing address');

    // Rate limiting: ensure minimum interval between requests
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.config.minRequestInterval) {
      const delay = this.config.minRequestInterval - timeSinceLastRequest;
      await this.sleep(delay);
    }

    let lastError: Error | null = null;

    try {
      for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
        try {
          this.lastRequestTime = Date.now();

          const result = await refineAddressFlow(input);
          this.logger.debug({ before: input.currentAddress }, 'AI refining address');
          this.logger.debug({ result }, 'AI refined address');

          if (!result) {
            this.logger.warn({ input }, 'AI returned empty result');
            return null;
          }

          // Check if confidence score is acceptable
          if (result.confidence < this.config.minConfidence) {
            this.logger.warn(
              { input, confidence: result.confidence },
              `Low AI confidence (${result.confidence})`
            );
            return null;
          }

          this.logger.debug(
            {
              input: input.currentAddress,
              refinedAddress: result.refinedAddress,
              confidence: result.confidence,
              extractedFromDescription: result.extractedFromDescription,
            },
            'Successfully standardized address with AI'
          );

          return result;
        } catch (error: unknown) {
          lastError = error as Error;
          if (attempt < this.config.maxRetries) {
            this.logger.warn(
              {
                attempt,
                maxRetries: this.config.maxRetries,
                error: lastError.message,
                input: input.currentAddress,
              },
              `Attempt ${attempt}/${this.config.maxRetries} failed. Retrying...`
            );
            await this.sleep(this.config.retryDelay * attempt);
          }
        }
      }

      // If we reach here, all retry attempts failed
      const errorMessage = lastError?.message || 'Failed to process with AI';
      const errorStack = lastError?.stack;

      this.logger.error(
        { input, error: errorMessage, stack: errorStack },
        'All retry attempts failed for AI address standardization'
      );
      return null;
    } catch (error: unknown) {
      // Catch any unexpected errors outside the retry loop
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        { input, error: errorMessage, stack: errorStack },
        'Unexpected error during AI address standardization'
      );
      return null;
    }
  }

  async standardizeBatch(
    auctionOpportunities: RawAuctionInput[]
  ): Promise<RawAuctionInput[]> {
    const results: RawAuctionInput[] = [];

    this.logger.log(
      { total: auctionOpportunities.length },
      `AI standardizing batch of ${auctionOpportunities.length} auction opportunities`
    );

    let iteration = 0;
    const refinedAddresses: AddressRefinementOutput[] = [];

    for (const opportunity of auctionOpportunities) {
      iteration += 1;
      // Prepare input for AI standardization
      const input: AddressRefinementInput = {
        currentAddress: opportunity.address ?? '',
        description: opportunity.description,
        additionalContext: `City: ${opportunity.city}`, // Additional context from raw data
      };

      const aiResult = await this.standardizeAddress(input);

      if (!aiResult) {
        this.logger.debug(
          { opportunity: opportunity.address },
          'AI standardization failed, keeping original'
        );
        results.push(opportunity); // Keep original if AI fails
        continue;
      }

      // Add AI standardization data to the opportunity
      results.push({
        ...opportunity,
        address: aiResult.refinedAddress, // Update address with AI refined version
      });
      refinedAddresses.push(aiResult);

      if (iteration % 50 === 0) {
        this.logger.log(
          { processed: iteration, total: auctionOpportunities.length },
          `AI standardized ${iteration}/${auctionOpportunities.length} auction opportunities`
        );
      }
    }

    const avgConfidence =
      refinedAddresses.reduce((sum, r) => sum + r.confidence, 0) /
      Math.max(1, refinedAddresses.length);
    const failedCount = auctionOpportunities.length - refinedAddresses.length;

    this.logger.log(
      {
        total: auctionOpportunities.length,
        refined: refinedAddresses.length,
        avgConfidence,
      },
      `Batch AI standardization complete: ${refinedAddresses.length}/${auctionOpportunities.length} standardized`
    );

    if (failedCount > 0) {
      this.logger.warn(
        { failureCount: failedCount },
        'Some addresses could not be standardized with AI'
      );
    }

    return results;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Utility method to check if an address was improved by AI
   */
  wasAddressImproved(
    original: string,
    aiResult?: AddressRefinementOutput
  ): boolean {
    if (!aiResult) return false;
    return (
      aiResult.extractedFromDescription ||
      aiResult.refinedAddress.length > original.length ||
      aiResult.confidence > 0.8
    );
  }
}
