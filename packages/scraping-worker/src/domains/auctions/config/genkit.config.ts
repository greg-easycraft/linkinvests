import type { ConfigService } from '@nestjs/config';

/**
 * Initialize Genkit with Google AI provider
 * TODO: Complete implementation once Genkit API is clarified
 */
export function initializeGenkit(configService: ConfigService): void {
  const apiKey = configService.get<string>('GOOGLE_AI_API_KEY');

  if (!apiKey) {
    throw new Error(
      'GOOGLE_AI_API_KEY environment variable is required for AI extraction'
    );
  }

  // TODO: Implement Genkit initialization
  // See: https://firebase.google.com/docs/genkit
}
