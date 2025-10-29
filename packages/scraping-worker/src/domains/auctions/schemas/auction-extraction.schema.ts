import { z } from 'zod';

/**
 * Zod schema for AI-extracted auction data
 * Used by Genkit flow to ensure structured output from LLM
 */
export const auctionExtractionSchema = z.object({
  price: z
    .number()
    .nullable()
    .describe('Auction starting price or estimated value in euros'),
  propertyType: z
    .string()
    .nullable()
    .describe(
      'Type of property in French (e.g., "Maison", "Appartement", "Terrain", "Local commercial")'
    ),
  description: z
    .string()
    .nullable()
    .describe('Brief description of the property and auction'),
  squareFootage: z
    .number()
    .nullable()
    .describe('Property surface area in square meters (m²)'),
  auctionVenue: z
    .string()
    .nullable()
    .describe(
      'Location where the auction takes place (not the property address) - typically a courthouse or auction house'
    ),
});

export type AuctionExtraction = z.infer<typeof auctionExtractionSchema>;
